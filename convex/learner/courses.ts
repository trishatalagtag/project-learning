import { v } from "convex/values";
import { publicQuery } from "../lib/functions";
import { learnerMutation, learnerQuery } from "../lib/functions";
import { getUserByUserId } from "../lib/auth";
import { listArgs, getPaginationDefaults, getSortDefaults } from "../lib/validators";
import { Id } from "../_generated/dataModel";

/**
 * Public list of courses (published only), optional category filter + pagination
 */
export const listPublicCourses = publicQuery({
  args: {
    ...listArgs,
    categoryId: v.optional(v.id("categories")),
  },
  returns: v.object({
    courses: v.array(
      v.object({
        _id: v.id("courses"),
        _creationTime: v.number(),
        title: v.string(),
        description: v.string(),
        categoryId: v.id("categories"),
        categoryName: v.string(),
        coverImageId: v.optional(v.id("_storage")),
        isEnrollmentOpen: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { limit, offset } = getPaginationDefaults(args);

    // Start from published courses
    let q = ctx.db.query("courses").withIndex("by_status", (q) => q.eq("status", "published"));

    // Narrow by category if provided (use index)
    if (args.categoryId) {
      q = ctx.db.query("courses").withIndex("by_category", (q) => q.eq("categoryId", args.categoryId as Id<"categories">));
      // still ensure published after collecting (since by_category doesn't enforce status)
      const all = await q.collect();
      const filtered = all.filter((c) => c.status === "published");
      // optional search
      const searched = args.search
        ? filtered.filter(
            (c) =>
              c.title.toLowerCase().includes(args.search!.toLowerCase()) ||
              c.description.toLowerCase().includes(args.search!.toLowerCase())
          )
        : filtered;

      const { sortBy, sortOrder } = getSortDefaults(args);
      const sorted = searched.sort((a: any, b: any) =>
        sortOrder === "asc" ? (a[sortBy] ?? 0) - (b[sortBy] ?? 0) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
      );

      const page = sorted.slice(offset, offset + limit);

      // Enrich category name
      const result = await Promise.all(
        page.map(async (course) => {
          const cat = await ctx.db.get(course.categoryId);
          return {
            _id: course._id,
            _creationTime: course._creationTime,
            title: course.title,
            description: course.description,
            categoryId: course.categoryId,
            categoryName: cat?.name ?? "Unknown",
            coverImageId: course.coverImageId,
            isEnrollmentOpen: course.isEnrollmentOpen,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
          };
        })
      );

      return {
        courses: result,
        total: sorted.length,
        hasMore: offset + limit < sorted.length,
      };
    }

    // No category filter; collect published then search/sort/paginate
    const published = await q.collect();

    const searched = args.search
      ? published.filter(
          (c) =>
            c.title.toLowerCase().includes(args.search!.toLowerCase()) ||
            c.description.toLowerCase().includes(args.search!.toLowerCase())
        )
      : published;

    const { sortBy, sortOrder } = getSortDefaults(args);
    const sorted = searched.sort((a: any, b: any) =>
      sortOrder === "asc" ? (a[sortBy] ?? 0) - (b[sortBy] ?? 0) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
    );

    const page = sorted.slice(offset, offset + limit);

    const result = await Promise.all(
      page.map(async (course) => {
        const cat = await ctx.db.get(course.categoryId);
        return {
          _id: course._id,
          _creationTime: course._creationTime,
          title: course.title,
          description: course.description,
          categoryId: course.categoryId,
          categoryName: cat?.name ?? "Unknown",
          coverImageId: course.coverImageId,
          isEnrollmentOpen: course.isEnrollmentOpen,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      })
    );

    return {
      courses: result,
      total: sorted.length,
      hasMore: offset + limit < sorted.length,
    };
  },
});

/**
 * Public course details (published only)
 */
export const getCourseDetails = publicQuery({
  args: { courseId: v.id("courses") },
  returns: v.union(
    v.object({
      _id: v.id("courses"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      categoryId: v.id("categories"),
      categoryName: v.string(),
      teacherId: v.optional(v.string()),
      teacherName: v.optional(v.string()),
      coverImageId: v.optional(v.id("_storage")),
      isEnrollmentOpen: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") return null;

    const category = await ctx.db.get(course.categoryId);

    let teacherName: string | undefined;
    if (course.teacherId) {
      const teacher = await getUserByUserId(ctx, course.teacherId);
      teacherName = teacher?.name;
    }

    return {
      _id: course._id,
      _creationTime: course._creationTime,
      title: course.title,
      description: course.description,
      content: course.content,
      categoryId: course.categoryId,
      categoryName: category?.name ?? "Unknown",
      teacherId: course.teacherId,
      teacherName,
      coverImageId: course.coverImageId,
      isEnrollmentOpen: course.isEnrollmentOpen,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  },
});

/**
 * Public search (published courses), with pagination
 */
export const searchCourses = publicQuery({
  args: {
    ...listArgs,
  },
  returns: v.object({
    courses: v.array(
      v.object({
        _id: v.id("courses"),
        _creationTime: v.number(),
        title: v.string(),
        description: v.string(),
        categoryId: v.id("categories"),
        categoryName: v.string(),
        coverImageId: v.optional(v.id("_storage")),
        isEnrollmentOpen: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    total: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { limit, offset } = getPaginationDefaults(args);
    // Start from published
    const published = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const filtered = args.search
      ? published.filter(
          (c) =>
            c.title.toLowerCase().includes(args.search!.toLowerCase()) ||
            c.description.toLowerCase().includes(args.search!.toLowerCase())
        )
      : published;

    const { sortBy, sortOrder } = getSortDefaults(args);
    const sorted = filtered.sort((a: any, b: any) =>
      sortOrder === "asc" ? (a[sortBy] ?? 0) - (b[sortBy] ?? 0) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
    );

    const page = sorted.slice(offset, offset + limit);

    const result = await Promise.all(
      page.map(async (course) => {
        const cat = await ctx.db.get(course.categoryId);
        return {
          _id: course._id,
          _creationTime: course._creationTime,
          title: course.title,
          description: course.description,
          categoryId: course.categoryId,
          categoryName: cat?.name ?? "Unknown",
          coverImageId: course.coverImageId,
          isEnrollmentOpen: course.isEnrollmentOpen,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      })
    );

    return {
      courses: result,
      total: sorted.length,
      hasMore: offset + limit < sorted.length,
    };
  },
});

/**
 * Enroll in a course (published AND open enrollment)
 */
export const enrollInCourse = learnerMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available");
    }
    if (!course.isEnrollmentOpen) {
      throw new Error("Course enrollment is restricted");
    }

    // Check existing enrollment
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", args.courseId)
      )
      .first();

    const now = Date.now();

    if (!existing) {
      await ctx.db.insert("enrollments", {
        userId: ctx.user.userId,
        courseId: args.courseId,
        status: "active",
        enrolledAt: now,
        completedAt: undefined,
      });
    } else if (existing.status !== "active") {
      await ctx.db.patch(existing._id, {
        status: "active",
        enrolledAt: now,
        completedAt: undefined,
      });
    }

    return null;
  },
});

/**
 * Enroll with code (published course with matching code)
 */
export const enrollWithCode = learnerMutation({
  args: {
    courseId: v.id("courses"),
    code: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available");
    }
    if (!course.enrollmentCode || course.enrollmentCode !== args.code) {
      throw new Error("Invalid enrollment code");
    }

    // Proceed similarly to open enrollment
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", args.courseId)
      )
      .first();

    const now = Date.now();

    if (!existing) {
      await ctx.db.insert("enrollments", {
        userId: ctx.user.userId,
        courseId: args.courseId,
        status: "active",
        enrolledAt: now,
        completedAt: undefined,
      });
    } else if (existing.status !== "active") {
      await ctx.db.patch(existing._id, {
        status: "active",
        enrolledAt: now,
        completedAt: undefined,
      });
    }

    return null;
  },
});

/**
 * Unenroll (drop) from a course
 */
export const unenrollFromCourse = learnerMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", args.courseId)
      )
      .first();

    if (!existing || existing.status !== "active") {
      // No-op if not enrolled or already not active
      return null;
    }

    await ctx.db.patch(existing._id, {
      status: "dropped",
    });

    return null;
  },
});