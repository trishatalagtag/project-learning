import { v } from "convex/values";
import { components } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { adminMutation, adminQuery } from "../lib/functions";

/** Get a user by userId (component-local) */
export const findByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("user"),
      userId: v.optional(v.union(v.null(), v.string())),
      name: v.string(),
      email: v.string(),
      role: v.optional(v.union(v.null(), v.string())),
      image: v.optional(v.union(v.null(), v.string())),
      emailVerified: v.boolean(),
      institution: v.optional(v.union(v.null(), v.string())),
      bio: v.optional(v.union(v.null(), v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
    });
  },
});

/** Find by email for uniqueness checks */
export const findByEmail = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("user"),
      email: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", operator: "eq", value: args.email }],
    });
  },
});

/** Patch allowed fields by userId (lets us set role, institution, bio) */
export const patchByUserId = mutation({
  args: {
    userId: v.string(),
    patch: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      institution: v.optional(v.union(v.null(), v.string())),
      bio: v.optional(v.union(v.null(), v.string())),
      role: v.optional(v.union(v.null(), v.string())),
      updatedAt: v.number(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
    });
    if (!doc) throw new Error("User not found");
    await ctx.db.patch(doc._id, args.patch);
    return null;
  },
});

/**
 * Get single user by userId
 * Admin only
 */
export const getUserById = adminQuery({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("user"),
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
      where: [{ field: "userId", operator: "eq", value: args.userId }],
    });
    if (!user) return null;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const role = user.role ?? undefined;
    let createdCoursesCount: number | undefined;
    if (role === "FACULTY" || role === "ADMIN") {
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_teacher", (q) => q.eq("teacherId", args.userId))
        .collect();
      createdCoursesCount = courses.length;
    }

    return {
      _id: user._id,
      userId: user.userId ?? "",
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
 * List users by role
 * Admin only
 */
export const listUsersByRole = adminQuery({
  args: { role: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("user"),
      userId: v.string(),
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
      paginationOpts: {
        cursor: null,
        numItems: 100,
      }
    });

    // Handle different response structures from the adapter
    let users: any[] = [];
    if (Array.isArray(result)) {
      users = result;
    } else if (result && typeof result === "object") {
      // Handle paginated response: { data: [...], cursor: ... } or { items: [...] }
      users = result.data ?? result.items ?? [];
    }

    return users.map((u: any) => ({
      _id: u._id,
      userId: u.userId ?? "",
      name: u.name ?? "",
      email: u.email ?? "",
    }));
  },
});

/**
 * Update user role
 * Admin only
 */
// export const updateUserRole = adminMutation({
//   args: {
//     userId: v.string(),
//     role: v.union(v.literal("LEARNER"), v.literal("FACULTY"), v.literal("ADMIN")),
//   },
//   returns: v.null(),
//   handler: async (ctx, args) => {
//     const user = await ctx.runQuery(components.auth.adapter.findOne, {
//       model: "user",
//       where: [{ field: "userId", operator: "eq", value: args.userId }],
//     });
//     if (!user) throw new Error("User not found");

    

//     return null;
//   },
// });

/**
 * Update user profile (admin can update any user)
 * Admin only
 */
export const updateUserProfile = adminMutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    institution: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
    });
    if (!user) throw new Error("User not found");

    if (args.email && args.email !== user.email) {
      const existing = await ctx.runQuery(components.auth.adapter.findOne, {
        model: "user",
        where: [{ field: "email", operator: "eq", value: args.email }],
      });
      if (existing && existing._id !== user._id) {
        throw new Error("Email already in use");
      }
    }

    const data: {
      name?: string;
      email?: string;
      institution?: string | null;
      bio?: string | null;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.name !== undefined) data.name = args.name;
    if (args.email !== undefined) data.email = args.email;
    if (args.institution !== undefined) data.institution = args.institution ?? null;
    if (args.bio !== undefined) data.bio = args.bio ?? null;

    await ctx.runMutation(components.auth.adapter.updateOne, {
      input: {
        model: "user",
        update: data,
        where: [{ field: "userId", operator: "eq", value: args.userId }],
      },
    });

    return null;
  },
});

/**
 * Deactivate user (soft delete)
 * Admin only
 */
export const deactivateUser = adminMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(components.auth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
    });
    if (!user) throw new Error("User not found");

    const currentUser = await ctx.auth.getUserIdentity();
    if (user.userId === currentUser?.subject) {
      throw new Error("Cannot deactivate your own account");
    }

    await ctx.runMutation(components.auth.adapter.updateOne, {
      input: {
        model: "user",
        update: {
          updatedAt: Date.now(),
        },
        where: [{ field: "userId", operator: "eq", value: args.userId }],
      },
    });

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const e of enrollments) {
      if (e.status === "active") {
        await ctx.db.patch(e._id, { status: "dropped" });
      }
    }

    return null;
  },
});