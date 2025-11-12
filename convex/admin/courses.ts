import { v } from "convex/values";
import { createUserMap, getUserByUserId } from "../lib/auth";
import { enrichCourses } from "../lib/courses";
import { adminMutation, adminQuery } from "../lib/functions";
import {
    courseStatusFilter,
    getPaginationDefaults,
    getSortDefaults,
    listArgs
} from "../lib/validators";

/**
 * List all courses (any status) with pagination and filtering
 * Admin only
 */
export const listAllCourses = adminQuery({
  args: {
    ...listArgs,
    status: courseStatusFilter,
    categoryId: v.optional(v.id("categories")),
    teacherId: v.optional(v.string()),
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
        teacherId: v.optional(v.string()),
        teacherName: v.optional(v.string()),
        status: v.string(),
        enrollmentCount: v.number(),
        moduleCount: v.number(),
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
    let coursesQuery = ctx.db.query("courses");
    if (args.status) {
      coursesQuery = coursesQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }
    if (args.categoryId) {
      coursesQuery = coursesQuery
        .filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    if (args.teacherId) {
      coursesQuery = coursesQuery.filter((q) =>
        q.eq(q.field("teacherId"), args.teacherId)
      );
    }
    const allCourses = await coursesQuery.collect();

    let filteredCourses = allCourses;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredCourses = allCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    const { sortBy, sortOrder } = getSortDefaults(args);
    const sortedCourses = filteredCourses.sort((a, b) => {
      const aVal = (a as any)[sortBy] ?? 0;
      const bVal = (b as any)[sortBy] ?? 0;
      return sortOrder === "asc" 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });

    const paginatedCourses = sortedCourses.slice(offset, offset + limit);

    // Use optimized enrichment helper with admin level
    const enrichedCourses = await enrichCourses(ctx, paginatedCourses, "admin");

    return {
      courses: enrichedCourses,
      total: sortedCourses.length,
      hasMore: offset + limit < sortedCourses.length,
    };
  },
});

/**
 * Get courses pending approval
 * Admin only
 */
export const getPendingCourses = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      categoryName: v.string(),
      teacherName: v.optional(v.string()),
      createdBy: v.string(),
      createdByName: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const pendingCourses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(limit);

    // Batch fetch all categories
    const categoryIds = [...new Set(pendingCourses.map((c) => c.categoryId))];
    const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
    const categoryMap = new Map(
      categories.filter(Boolean).map((c) => [c!._id, c!])
    );

    // Batch fetch all teacher and creator user IDs
    const userIds = [
      ...pendingCourses.map((c) => c.teacherId).filter((id): id is string => !!id),
      ...pendingCourses.map((c) => c.createdBy),
    ];
    const userMap = await createUserMap(ctx, userIds);

    return pendingCourses.map((course) => {
      const category = categoryMap.get(course.categoryId);
      const teacher = course.teacherId ? userMap.get(course.teacherId) : null;
      const creator = userMap.get(course.createdBy);

      return {
        _id: course._id,
        _creationTime: course._creationTime,
        title: course.title,
        description: course.description,
        categoryName: category?.name ?? "Unknown",
        teacherName: teacher?.name,
        createdBy: course.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: course.createdAt,
      };
    });
  },
});

/**
 * Get approved courses
 * Admin only
 */
export const getApprovedCourses = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      categoryName: v.string(),
      teacherName: v.optional(v.string()),
      createdBy: v.string(),
      createdByName: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const approvedCourses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit);

    // Batch fetch all categories
    const categoryIds = [...new Set(approvedCourses.map((c) => c.categoryId))];
    const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
    const categoryMap = new Map(
      categories.filter(Boolean).map((c) => [c!._id, c!])
    );

    // Batch fetch all teacher and creator user IDs
    const userIds = [
      ...approvedCourses.map((c) => c.teacherId).filter((id): id is string => !!id),
      ...approvedCourses.map((c) => c.createdBy),
    ];
    const userMap = await createUserMap(ctx, userIds);

    return approvedCourses.map((course) => {
      const category = categoryMap.get(course.categoryId);
      const teacher = course.teacherId ? userMap.get(course.teacherId) : null;
      const creator = userMap.get(course.createdBy);

      return {
        _id: course._id,
        _creationTime: course._creationTime,
        title: course.title,
        description: course.description,
        categoryName: category?.name ?? "Unknown",
        teacherName: teacher?.name,
        createdBy: course.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });
  },
});

/**
 * Get rejected courses (draft courses that were updated after creation, indicating rejection)
 * Admin only
 */
export const getRejectedCourses = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("courses"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      categoryName: v.string(),
      teacherName: v.optional(v.string()),
      createdBy: v.string(),
      createdByName: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Get draft courses that were updated after creation (likely rejected)
    const allDraftCourses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();

    // Filter for courses that were updated after creation (indicating they were rejected)
    const rejectedCourses = allDraftCourses
      .filter((c) => c.updatedAt > c.createdAt)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);

    // Batch fetch all categories
    const categoryIds = [...new Set(rejectedCourses.map((c) => c.categoryId))];
    const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
    const categoryMap = new Map(
      categories.filter(Boolean).map((c) => [c!._id, c!])
    );

    // Batch fetch all teacher and creator user IDs
    const userIds = [
      ...rejectedCourses.map((c) => c.teacherId).filter((id): id is string => !!id),
      ...rejectedCourses.map((c) => c.createdBy),
    ];
    const userMap = await createUserMap(ctx, userIds);

    return rejectedCourses.map((course) => {
      const category = categoryMap.get(course.categoryId);
      const teacher = course.teacherId ? userMap.get(course.teacherId) : null;
      const creator = userMap.get(course.createdBy);

      return {
        _id: course._id,
        _creationTime: course._creationTime,
        title: course.title,
        description: course.description,
        categoryName: category?.name ?? "Unknown",
        teacherName: teacher?.name,
        createdBy: course.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });
  },
});

/**
 * Approve pending course
 * Admin only
 */
export const approveCourse = adminMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.status !== "pending") {
      throw new Error("Only pending courses can be approved");
    }

    await ctx.db.patch(args.courseId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Reject course with reason
 * Admin only
 */
export const rejectCourse = adminMutation({
  args: {
    courseId: v.id("courses"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.status !== "pending") {
      throw new Error("Only pending courses can be rejected");
    }

    await ctx.db.patch(args.courseId, {
      status: "draft",
      updatedAt: Date.now(),
    });

    // TODO: In production, send notification to creator with rejection reason
    // This could be done via email or in-app notification

    return null;
  },
});

/**
 * Publish approved course
 * Admin only - makes course visible to learners
 */
export const publishCourse = adminMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.status !== "approved") {
      throw new Error("Only approved courses can be published");
    }

    await ctx.db.patch(args.courseId, {
      status: "published",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Unpublish course
 * Admin only - hide course from learners
 */
export const unpublishCourse = adminMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.status !== "published") {
      throw new Error("Only published courses can be unpublished");
    }

    await ctx.db.patch(args.courseId, {
      status: "approved", // Back to approved, not draft
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Assign faculty to course
 * Admin only
 */
export const assignFaculty = adminMutation({
  args: {
    courseId: v.id("courses"),
    teacherId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Verify teacher exists and has FACULTY or ADMIN role
    const teacher = await getUserByUserId(ctx, args.teacherId);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const teacherRole = teacher.role ?? undefined;
    if (!teacherRole || !["FACULTY", "ADMIN"].includes(teacherRole)) {
      throw new Error("User must have FACULTY or ADMIN role");
    }

    await ctx.db.patch(args.courseId, {
      teacherId: args.teacherId,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Unassign faculty from course
 * Admin only
 */
export const unassignFaculty = adminMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    await ctx.db.patch(args.courseId, {
      teacherId: undefined,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Get single course by ID (full details for admin)
 * Admin only
 */
export const getCourseById = adminQuery({
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
      status: v.string(),
      enrollmentCode: v.optional(v.string()),
      isEnrollmentOpen: v.boolean(),
      gradingConfig: v.object({
        passingScore: v.number(),
        gradingMethod: v.string(),
        components: v.optional(
          v.array(
            v.object({
              name: v.string(),
              weight: v.number(),
            })
          )
        ),
      }),
      enrollmentCount: v.number(),
      moduleCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
      createdByName: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return null;
    }

    const category = await ctx.db.get(course.categoryId);

    let teacherName: string | undefined;
    if (course.teacherId) {
      const teacher = await getUserByUserId(ctx, course.teacherId);
      teacherName = teacher?.name;
    }

    const creator = await getUserByUserId(ctx, course.createdBy);

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();

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
      status: course.status,
      enrollmentCode: course.enrollmentCode,
      isEnrollmentOpen: course.isEnrollmentOpen,
      gradingConfig: course.gradingConfig,
      enrollmentCount: enrollments.length,
      moduleCount: modules.length,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      createdBy: course.createdBy,
      createdByName: creator?.name ?? "Unknown",
    };
  },
});

/**
 * Update course enrollment code
 * Admin only
 */
export const updateEnrollmentCode = adminMutation({
  args: {
    courseId: v.id("courses"),
    enrollmentCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Generate new code if not provided
    const newCode = args.enrollmentCode ?? Math.random().toString(36).substring(2, 8).toUpperCase();

    await ctx.db.patch(args.courseId, {
      enrollmentCode: newCode,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Update course enrollment settings
 * Admin only
 */
export const updateEnrollmentSettings = adminMutation({
  args: {
    courseId: v.id("courses"),
    isEnrollmentOpen: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    await ctx.db.patch(args.courseId, {
      isEnrollmentOpen: args.isEnrollmentOpen,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete course (hard delete)
 * Admin only - WARNING: This is destructive
 */
export const deleteCourse = adminMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check if course has enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (enrollments.length > 0) {
      throw new Error(
        "Cannot delete course with active enrollments. Unpublish it instead."
      );
    }

    // Delete all related data
    // 1. Delete modules and their lessons
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const module of modules) {
      // Delete lessons in this module
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", module._id))
        .collect();

      for (const lesson of lessons) {
        // Delete lesson attachments
        const attachments = await ctx.db
          .query("lessonAttachments")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .collect();

        for (const attachment of attachments) {
          await ctx.db.delete(attachment._id);
        }

        await ctx.db.delete(lesson._id);
      }

      await ctx.db.delete(module._id);
    }

    // 2. Delete quizzes and questions
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const quiz of quizzes) {
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
        .collect();

      for (const question of questions) {
        await ctx.db.delete(question._id);
      }

      await ctx.db.delete(quiz._id);
    }

    // 3. Delete assignments
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    // 4. Delete announcements
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const announcement of announcements) {
      await ctx.db.delete(announcement._id);
    }

    // Finally, delete the course
    await ctx.db.delete(args.courseId);

    return null;
  },
});