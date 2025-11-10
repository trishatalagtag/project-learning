import { v } from "convex/values";
import { getUserByUserId, requireCourseAccess } from "../lib/auth";
import { facultyMutation, facultyQuery } from "../lib/functions";
import {
  getPaginationDefaults,
  getSortDefaults,
  gradingConfigValidator,
  listArgs,
  validateGradingConfig,
} from "../lib/validators";

/**
 * Get courses assigned to current faculty member
 * Faculty only
 */
export const getMyCourses = facultyQuery({
  args: {
    ...listArgs,
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
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
    const { sortBy, sortOrder } = getSortDefaults(args);

    // Get courses where current user is the teacher
    // Note: Admin can also use this, they'll see courses they're assigned to
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_teacher", (q) => q.eq("teacherId", ctx.user.userId as string))
      .collect();

    // Apply status filter
    let filteredCourses = allCourses;
    if (args.status) {
      filteredCourses = allCourses.filter((c) => c.status === args.status);
    }

    // Apply search
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredCourses = filteredCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort courses
    const sortedCourses = filteredCourses.sort((a, b) => {
      const aVal = (a as any)[sortBy] ?? 0;
      const bVal = (b as any)[sortBy] ?? 0;
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    // Apply pagination
    const paginatedCourses = sortedCourses.slice(offset, offset + limit);

    // Enrich with additional data
    const enrichedCourses = await Promise.all(
      paginatedCourses.map(async (course) => {
        const category = await ctx.db.get(course.categoryId);

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
          categoryId: course.categoryId,
          categoryName: category?.name ?? "Unknown",
          status: course.status,
          enrollmentCount: enrollments.length,
          moduleCount: modules.length,
          isEnrollmentOpen: course.isEnrollmentOpen,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      })
    );

    return {
      courses: enrichedCourses,
      total: sortedCourses.length,
      hasMore: offset + limit < sortedCourses.length,
    };
  },
});

/**
 * Get single course by ID (full details)
 * Faculty only - must be the assigned teacher (or admin)
 */
export const getCourseById = facultyQuery({
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return null;
    }

    // Check access using helper
    await requireCourseAccess(ctx, course);

    const category = await ctx.db.get(course.categoryId);

    let teacherName: string | undefined;
    if (course.teacherId) {
      const teacher = await getUserByUserId(ctx, course.teacherId);
      teacherName = teacher?.name;
    }

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
    };
  },
});

/**
 * Create new course
 * Faculty only - creates course in draft status
 * Admin can create and directly approve
 */
export const createCourse = facultyMutation({
  args: {
    title: v.string(),
    description: v.string(),
    content: v.string(),
    categoryId: v.id("categories"),
    coverImageId: v.optional(v.id("_storage")),
    isEnrollmentOpen: v.optional(v.boolean()),
    gradingConfig: v.optional(gradingConfigValidator),
  },
  returns: v.id("courses"),
  handler: async (ctx, args) => {
    // Verify category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Generate enrollment code
    const enrollmentCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Validate grading config if provided
    if (args.gradingConfig) {
      validateGradingConfig(args.gradingConfig);
    }

    // Default grading config
    const defaultGradingConfig = {
      passingScore: 85,
      gradingMethod: "numerical" as const,
    };

    const now = Date.now();

    // If admin, can create as approved. If faculty, starts as draft
    const initialStatus = ctx.user.role === "ADMIN" ? "approved" : "draft";

    const courseId = await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      content: args.content,
      categoryId: args.categoryId,
      teacherId: undefined, // Not assigned yet (admin will assign)
      coverImageId: args.coverImageId,
      status: initialStatus,
      enrollmentCode,
      isEnrollmentOpen: args.isEnrollmentOpen ?? false,
      gradingConfig: args.gradingConfig ?? defaultGradingConfig,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.user.userId as string,
    });

    return courseId;
  },
});

/**
 * Update course
 * Faculty only - can only update assigned courses
 */
export const updateCourse = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    coverImageId: v.optional(v.id("_storage")),
    isEnrollmentOpen: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // If course is published, faculty cannot edit (only admin can)
    if (course.status === "published" && ctx.user.role !== "ADMIN") {
      throw new Error(
        "Cannot edit published course. Request admin to unpublish first."
      );
    }

    // Verify category if changing
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.coverImageId !== undefined) updates.coverImageId = args.coverImageId;
    if (args.isEnrollmentOpen !== undefined)
      updates.isEnrollmentOpen = args.isEnrollmentOpen;

    // If faculty editing an approved course, set back to draft
    if (
      ctx.user.role === "FACULTY" &&
      course.status === "approved" &&
      Object.keys(updates).length > 1
    ) {
      updates.status = "draft";
    }

    await ctx.db.patch(args.courseId, updates);

    return null;
  },
});

/**
 * Partially update course fields
 * Faculty can only update their own courses
 * Admins can update any course
 */
export const patchCourse = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    coverImageId: v.optional(v.id("_storage")),
    isEnrollmentOpen: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Build updates object (only include provided fields)
    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.categoryId !== undefined) {
      // Verify category exists
      const category = await ctx.db.get(args.categoryId);
      if (!category) throw new Error("Category not found");
      updates.categoryId = args.categoryId;
    }
    if (args.coverImageId !== undefined) updates.coverImageId = args.coverImageId;
    if (args.isEnrollmentOpen !== undefined) updates.isEnrollmentOpen = args.isEnrollmentOpen;

    // If faculty editing approved course, reset to draft
    if (ctx.user.role === "FACULTY" && course.status === "approved" && Object.keys(updates).length > 1) {
      updates.status = "draft";
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 1) {
      await ctx.db.patch(args.courseId, updates);
    }

    return null;
  },
});

/**
 * Request course approval from admin
 * Faculty only - submits draft course for review
 */
export const requestCourseApproval = facultyMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    if (course.status !== "draft") {
      throw new Error("Only draft courses can be submitted for approval");
    }

    // Validate course has minimum content
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (modules.length === 0) {
      throw new Error(
        "Course must have at least one module before requesting approval"
      );
    }

    await ctx.db.patch(args.courseId, {
      status: "pending",
      updatedAt: Date.now(),
    });

    // TODO: In production, notify admin of pending approval

    return null;
  },
});

/**
 * Archive course (soft delete)
 * Faculty only - can only archive own courses
 */
export const archiveCourse = facultyMutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Cannot archive if has active enrollments
    const activeEnrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeEnrollments.length > 0) {
      throw new Error(
        `Cannot archive course with ${activeEnrollments.length} active enrollment(s)`
      );
    }

    await ctx.db.patch(args.courseId, {
      status: "archived",
      isEnrollmentOpen: false,
      updatedAt: Date.now(),
    });

    return null;
  },
});