import { v } from "convex/values";
import { components } from "../_generated/api";
import { adminQuery } from "../lib/functions";
import { getPaginationDefaults, getSortDefaults, listArgs } from "../lib/validators";

/**
 * Get single user by auth user ID
 * Admin only
 */
export const getUserById = adminQuery({
  args: { authUserId: v.string() },
  returns: v.union(
    v.object({
      _id: v.string(),
      userId: v.string(), 
      name: v.string(),
      email: v.string(),
      role: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerified: v.boolean(),
      institution: v.optional(v.string()),
      bio: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      enrolledCoursesCount: v.number(),
      createdCoursesCount: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "_id", operator: "eq", value: args.authUserId }],
    });
    
    if (!user) return null;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.authUserId))
      .collect();

    const role = user.role ?? undefined;
    let createdCoursesCount: number | undefined;
    if (role === "FACULTY" || role === "ADMIN") {
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_teacher", (q) => q.eq("teacherId", args.authUserId))
        .collect();
      createdCoursesCount = courses.length;
    }

    return {
      _id: String(user._id),
      userId: args.authUserId, // ← ADD THIS (same as _id)
      name: user.name,
      email: user.email,
      role,
      image: user.image ?? undefined,
      emailVerified: user.emailVerified ?? false,
      institution: user.institution ?? undefined,
      bio: user.bio ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      enrolledCoursesCount: enrollments.length,
      createdCoursesCount,
    };
  },
});

/**
 * List all users with pagination, filtering, and sorting
 * Admin only
 */
export const listAllUsers = adminQuery({
  args: {
    ...listArgs,
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("FACULTY"), v.literal("LEARNER"))),
    status: v.optional(v.union(v.literal("active"), v.literal("deactivated"))),
  },
  returns: v.object({
    users: v.array(
      v.object({
        _id: v.string(),
        userId: v.string(), // ← ADD THIS
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("ADMIN"), v.literal("FACULTY"), v.literal("LEARNER")),
        image: v.optional(v.string()),
        institution: v.optional(v.string()),
        bio: v.optional(v.string()),
        emailVerified: v.boolean(),
        isDeactivated: v.boolean(),
        enrolledCoursesCount: v.number(),
        createdCoursesCount: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { limit, offset } = getPaginationDefaults(args);
    const { sortBy, sortOrder } = getSortDefaults(args);

    // Fetch users by each role separately using Better Auth adapter
    const [learnersResult, facultyResult, adminsResult] = await Promise.all([
      ctx.runQuery(components.auth.adapter.findMany, {
        model: "user",
        where: [{ field: "role", operator: "eq", value: "LEARNER" }],
        limit: 1000,
        offset: 0,
        paginationOpts: { cursor: null, numItems: 1000 }
      }),
      ctx.runQuery(components.auth.adapter.findMany, {
        model: "user",
        where: [{ field: "role", operator: "eq", value: "FACULTY" }],
        limit: 1000,
        offset: 0,
        paginationOpts: { cursor: null, numItems: 1000 }
      }),
      ctx.runQuery(components.auth.adapter.findMany, {
        model: "user",
        where: [{ field: "role", operator: "eq", value: "ADMIN" }],
        limit: 1000,
        offset: 0,
        paginationOpts: { cursor: null, numItems: 1000 }
      }),
    ]);

    // Helper to extract users from adapter response
    const extractUsers = (result: any): any[] => {
      if (Array.isArray(result)) return result;
      return result?.data ?? result?.items ?? result?.page ?? [];
    };

    // Merge all users from different roles
    const allUsers = [
      ...extractUsers(learnersResult),
      ...extractUsers(facultyResult),
      ...extractUsers(adminsResult),
    ];

    // Apply search filter
    let filteredUsers = allUsers;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (args.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === args.role);
    }

    // Apply status filter
    if (args.status) {
      const isDeactivated = args.status === "deactivated";
      filteredUsers = filteredUsers.filter(
        (user) => (user.isDeactivated ?? false) === isDeactivated
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const comparison = typeof aVal === "string" 
        ? aVal.localeCompare(bVal) 
        : aVal - bVal;

      return sortOrder === "desc" ? -comparison : comparison;
    });

    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // Enrich users with Convex data
    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (user) => {
        // Use _id directly (auth component ID)
        const authUserId = String(user._id);

        // Count enrollments
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", authUserId))
          .collect();
        const enrolledCoursesCount = enrollments.filter(
          (e) => e.status === "active" || e.status === "completed"
        ).length;

        // Count created courses (for FACULTY and ADMIN)
        let createdCoursesCount: number | undefined;
        const role = user.role;
        if (role === "FACULTY" || role === "ADMIN") {
          const courses = await ctx.db
            .query("courses")
            .withIndex("by_teacher", (q) => q.eq("teacherId", authUserId))
            .collect();
          createdCoursesCount = courses.length;
        }

        return {
          _id: authUserId,
          userId: authUserId, // ← ADD THIS (same as _id)
          name: user.name,
          email: user.email,
          role: (role ?? "LEARNER") as "ADMIN" | "FACULTY" | "LEARNER",
          image: user.image ?? undefined,
          institution: user.institution ?? undefined,
          bio: user.bio ?? undefined,
          emailVerified: user.emailVerified ?? false,
          isDeactivated: user.isDeactivated ?? false,
          enrolledCoursesCount,
          createdCoursesCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      })
    );
    
    return {
      users: enrichedUsers,
      total,
      hasMore: offset + limit < total,
    };
  },
});

/**
 * List users by role
 * Admin only
 */
export const listUsersByRole = adminQuery({
  args: { role: v.string() },
  returns: v.array(
    v.object({
      _id: v.string(),
      userId: v.string(), // ← ADD THIS
      name: v.string(),
      email: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const result = await ctx.runQuery(components.auth.adapter.findMany, {
      model: "user",
      where: [{ field: "role", operator: "eq", value: args.role }],
      limit: 100,
      offset: 0,
      paginationOpts: { cursor: null, numItems: 100 }
    });

    let users: any[] = [];
    if (Array.isArray(result)) {
      users = result;
    } else if (result && typeof result === "object") {
      users = result.data ?? result.items ?? [];
    }

    return users.map((u: any) => ({
      _id: String(u._id),
      userId: String(u._id), // ← ADD THIS (same as _id)
      name: u.name ?? "",
      email: u.email ?? "",
    }));
  },
});