import { v } from "convex/values";

import { mutation, query } from "../_generated/server";

import { Id } from "../_generated/dataModel";
import { getUserByUserId } from "../lib/auth";
import {
  enrichModulesWithLessonCounts,
  listContentByParent,
} from "../lib/content_retrieval";
import { enrichCourse, enrichCourses } from "../lib/courses";
import {
  enrollUserInCourse,
  unenrollFromCourse as unenrollLib
} from "../lib/enrollment";
import { learnerMutation, publicQuery } from "../lib/functions";
import { getPaginationDefaults, getSortDefaults, listArgs } from "../lib/validators";

// Existing listPublicCourses - ENHANCED with instructor name
export const listPublicCourses = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    sortBy: v.optional(v.union(v.literal("title"), v.literal("createdAt"), v.literal("updatedAt"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  returns: v.object({
    courses: v.array(
      v.object({
        _id: v.id("courses"),
        title: v.string(),
        description: v.string(),
        categoryId: v.id("categories"),
        categoryName: v.string(),
        coverImageId: v.optional(v.id("_storage")),
        coverImageUrl: v.union(v.string(), v.null()),
        isEnrollmentOpen: v.boolean(),
        teacherId: v.optional(v.string()),
        teacherName: v.union(v.string(), v.null()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 12;
    const offset = args.offset ?? 0;

    // Get all published courses
    let coursesQuery = ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    // Apply category filter
    if (args.categoryId) {
      coursesQuery = ctx.db
        .query("courses")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId as Id<"categories">))
        .filter((q) => q.eq(q.field("status"), "published"));
    }

    let allCourses = await coursesQuery.collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      allCourses = allCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort courses
    const sortBy = args.sortBy ?? "createdAt";
    const sortOrder = args.sortOrder ?? "desc";

    allCourses.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "createdAt") {
        comparison = a.createdAt - b.createdAt;
      } else if (sortBy === "updatedAt") {
        comparison = a.updatedAt - b.updatedAt;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    const total = allCourses.length;
    const paginatedCourses = allCourses.slice(offset, offset + limit);

    // Use shared enrichment helper (public level - minimal data)
    const enrichedCourses = await enrichCourses(ctx, paginatedCourses, "public");

    return {
      courses: enrichedCourses.map((course) => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        categoryName: course.categoryName ?? "Uncategorized",
        coverImageId: course.coverImageId,
        coverImageUrl: course.coverImageUrl,
        isEnrollmentOpen: course.isEnrollmentOpen,
        teacherId: course.teacherId,
        teacherName: course.teacherName ?? null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
      total,
    };
  },
});

// NEW: Get recently added courses (for Featured section)
export const getRecentlyAddedCourses = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      title: v.string(),
      description: v.string(),
      categoryId: v.id("categories"),
      categoryName: v.string(),
      coverImageId: v.optional(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      isEnrollmentOpen: v.boolean(),
      teacherId: v.optional(v.string()),
      teacherName: v.union(v.string(), v.null()),
      createdAt: v.number(),
      updatedAt: v.number(),
      isNew: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;

    // Get published courses sorted by creation date (newest first)
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    // Enrich courses
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        const category = await ctx.db.get(course.categoryId);

        let teacherName: string | null = null;
        if (course.teacherId) {
          const teacher = await getUserByUserId(ctx, course.teacherId);
          teacherName = teacher?.name ?? null;
        }

        let coverImageUrl: string | null = null;
        if (course.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(course.coverImageId);
        }

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          categoryId: course.categoryId,
          categoryName: category?.name ?? "Uncategorized",
          coverImageId: course.coverImageId,
          coverImageUrl,
          isEnrollmentOpen: course.isEnrollmentOpen,
          teacherId: course.teacherId,
          teacherName,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          isNew: course.createdAt > thirtyDaysAgo,
        };
      })
    );

    return enrichedCourses;
  },
});

// NEW: Get public course detail
export const getPublicCourseDetail = query({
  args: {
    courseId: v.id("courses"),
  },
  returns: v.union(
    v.object({
      _id: v.id("courses"),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      categoryId: v.id("categories"),
      categoryName: v.string(),
      coverImageId: v.optional(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      isEnrollmentOpen: v.boolean(),
      enrollmentCode: v.optional(v.string()),
      teacherId: v.optional(v.string()),
      teacherName: v.union(v.string(), v.null()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course || course.status !== "published") {
      return null;
    }

    const category = await ctx.db.get(course.categoryId);

    let teacherName: string | null = null;
    if (course.teacherId) {
      const teacher = await getUserByUserId(ctx, course.teacherId);
      teacherName = teacher?.name ?? null;
    }

    let coverImageUrl: string | null = null;
    if (course.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(course.coverImageId);
    }

    return {
      _id: course._id,
      title: course.title,
      description: course.description,
      content: course.content,
      categoryId: course.categoryId,
      categoryName: category?.name ?? "Uncategorized",
      coverImageId: course.coverImageId,
      coverImageUrl,
      isEnrollmentOpen: course.isEnrollmentOpen,
      enrollmentCode: course.enrollmentCode,
      teacherId: course.teacherId,
      teacherName,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  },
});

// NEW: Get public course modules with lesson count
export const getPublicCourseModules = query({
  args: {
    courseId: v.id("courses"),
  },
  returns: v.array(
    v.object({
      _id: v.id("modules"),
      title: v.string(),
      description: v.string(),
      order: v.number(),
      lessonCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const modules = await listContentByParent(
      ctx,
      "modules",
      "courseId",
      args.courseId,
      ["published"]
    );

    const modulesWithCounts = await enrichModulesWithLessonCounts(ctx, modules);

    return modulesWithCounts.map((module) => ({
      _id: module._id,
      title: module.title,
      description: module.description,
      order: module.order,
      lessonCount: module.lessonCount,
    }));
  },
});

// NEW: Get public stats for homepage
export const getPublicStats = query({
  args: {},
  returns: v.object({
    totalCourses: v.number(),
    totalLearners: v.number(),
  }),
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const enrollments = await ctx.db.query("enrollments").collect();

    // Count unique learners
    const uniqueLearners = new Set(enrollments.map((e) => e.userId));

    return {
      totalCourses: courses.length,
      totalLearners: uniqueLearners.size,
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

    const enrichedCourse = await enrichCourse(ctx, course, "public");

    return {
      _id: course._id,
      _creationTime: course._creationTime,
      title: enrichedCourse.title,
      description: enrichedCourse.description,
      content: enrichedCourse.content,
      categoryId: enrichedCourse.categoryId,
      categoryName: enrichedCourse.categoryName ?? "Unknown",
      teacherId: enrichedCourse.teacherId,
      teacherName: enrichedCourse.teacherName ?? undefined,
      coverImageId: course.coverImageId,
      isEnrollmentOpen: enrichedCourse.isEnrollmentOpen,
      createdAt: enrichedCourse.createdAt,
      updatedAt: enrichedCourse.updatedAt,
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

// NEW: Check if user is enrolled in a course
export const checkEnrollment = query({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
  },
  returns: v.union(
    v.object({
      _id: v.id("enrollments"),
      status: v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("dropped")
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first()

    if (!enrollment) {
      return null
    }

    return {
      _id: enrollment._id,
      status: enrollment.status,
    }
  },
})

// NEW: Enroll in a course
export const enrollInCourse = mutation({
  args: {
    courseId: v.id("courses"),
    enrollmentCode: v.optional(v.string()),
  },
  returns: v.id("enrollments"),
  handler: async (ctx, args) => {
    // Get authenticated user from Better Auth
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    // Check if course exists and is published
    const course = await ctx.db.get(args.courseId)
    if (!course || course.status !== "published") {
      throw new Error("Course not found or not available")
    }

    // Check if enrollment is open
    if (!course.isEnrollmentOpen) {
      throw new Error("Enrollment is closed for this course")
    }

    // Verify enrollment code if required
    if (course.enrollmentCode) {
      if (!args.enrollmentCode || args.enrollmentCode !== course.enrollmentCode) {
        throw new Error("Invalid enrollment code")
      }
    }

    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .first()

    if (existingEnrollment) {
      // If dropped, re-activate
      if (existingEnrollment.status === "dropped") {
        await ctx.db.patch(existingEnrollment._id, {
          status: "active",
        })
        return existingEnrollment._id
      }
      throw new Error("Already enrolled in this course")
    }

    // Create enrollment
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId,
      courseId: args.courseId,
      status: "active",
      enrolledAt: Date.now(),
    })

    return enrollmentId
  },
})

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
    // Validate course and code match
    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available");
    }
    if (!course.enrollmentCode || course.enrollmentCode !== args.code) {
      throw new Error("Invalid enrollment code");
    }

    // Use shared enrollment helper
    await enrollUserInCourse(ctx, ctx.user.userId, args.courseId);
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
    // Use shared helper
    await unenrollLib(ctx, ctx.user.userId, args.courseId);
    return null;
  },
});