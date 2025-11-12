import { v } from "convex/values";
import { facultyMutation, facultyQuery } from "../lib/functions";
import { listContentByParent } from "../lib/content_retrieval";

/**
 * List assignments in a course
 * Faculty only - must be assigned teacher
 */
export const listAssignmentsByCourse = facultyQuery({
  args: {
    courseId: v.id("courses"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("published")
      )
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("assignments"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      linkedToLessonId: v.optional(v.id("lessons")),
      linkedToModuleId: v.optional(v.id("modules")),
      lessonTitle: v.optional(v.string()),
      moduleTitle: v.optional(v.string()),
      status: v.string(),
      submissionType: v.string(),
      maxPoints: v.number(),
      submissionCount: v.number(),
      dueDate: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Use shared helper to get assignments
    let assignments = await listContentByParent(ctx, "assignments", "courseId", args.courseId, args.status ? [args.status] : undefined);

    // Enrich with linked content info and submission counts
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let lessonTitle: string | undefined;
        let moduleTitle: string | undefined;

        if (assignment.linkedToLessonId) {
          const lesson = await ctx.db.get(assignment.linkedToLessonId);
          lessonTitle = lesson?.title;
        }

        if (assignment.linkedToModuleId) {
          const module = await ctx.db.get(assignment.linkedToModuleId);
          moduleTitle = module?.title;
        }

        const submissions = await ctx.db
          .query("assignmentSubmissions")
          .withIndex("by_assignment", (q) => q.eq("assignmentId", assignment._id))
          .collect();

        return {
          _id: assignment._id,
          _creationTime: assignment._creationTime,
          courseId: assignment.courseId,
          title: assignment.title,
          description: assignment.description,
          linkedToLessonId: assignment.linkedToLessonId,
          linkedToModuleId: assignment.linkedToModuleId,
          lessonTitle,
          moduleTitle,
          status: assignment.status,
          submissionType: assignment.submissionType,
          maxPoints: assignment.maxPoints,
          submissionCount: submissions.length,
          dueDate: assignment.dueDate,
          createdAt: assignment.createdAt,
        };
      })
    );

    // Sort by creation date descending
    return enrichedAssignments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get assignment by ID
 * Faculty only
 */
export const getAssignmentById = facultyQuery({
  args: { assignmentId: v.id("assignments") },
  returns: v.union(
    v.object({
      _id: v.id("assignments"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      courseName: v.string(),
      title: v.string(),
      description: v.string(),
      instructions: v.optional(v.string()),
      linkedToLessonId: v.optional(v.id("lessons")),
      linkedToModuleId: v.optional(v.id("modules")),
      submissionType: v.string(),
      allowedFileTypes: v.optional(v.array(v.string())),
      maxFileSize: v.optional(v.number()),
      allowMultipleAttempts: v.boolean(),
      maxAttempts: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      availableFrom: v.optional(v.number()),
      availableUntil: v.optional(v.number()),
      allowLateSubmissions: v.boolean(),
      lateSubmissionPenalty: v.optional(v.number()),
      maxPoints: v.number(),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      submissionCount: v.number(),
      gradedCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      return null;
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get submission stats
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
      .collect();

    const gradedSubmissions = submissions.filter((s) => s.status === "graded");

    return {
      _id: assignment._id,
      _creationTime: assignment._creationTime,
      courseId: assignment.courseId,
      courseName: course.title,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      linkedToLessonId: assignment.linkedToLessonId,
      linkedToModuleId: assignment.linkedToModuleId,
      submissionType: assignment.submissionType,
      allowedFileTypes: assignment.allowedFileTypes,
      maxFileSize: assignment.maxFileSize,
      allowMultipleAttempts: assignment.allowMultipleAttempts,
      maxAttempts: assignment.maxAttempts,
      dueDate: assignment.dueDate,
      availableFrom: assignment.availableFrom,
      availableUntil: assignment.availableUntil,
      allowLateSubmissions: assignment.allowLateSubmissions,
      lateSubmissionPenalty: assignment.lateSubmissionPenalty,
      maxPoints: assignment.maxPoints,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      submissionCount: submissions.length,
      gradedCount: gradedSubmissions.length,
    };
  },
});

/**
 * Create assignment
 * Faculty only - creates in draft, admin can create as approved
 */
export const createAssignment = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    instructions: v.optional(v.string()),
    linkedToLessonId: v.optional(v.id("lessons")),
    linkedToModuleId: v.optional(v.id("modules")),
    submissionType: v.union(v.literal("file"), v.literal("url"), v.literal("text")),
    allowedFileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()),
    allowMultipleAttempts: v.optional(v.boolean()),
    maxAttempts: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    allowLateSubmissions: v.optional(v.boolean()),
    lateSubmissionPenalty: v.optional(v.number()),
    maxPoints: v.optional(v.number()),
  },
  returns: v.id("assignments"),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Validate linked content belongs to course
    if (args.linkedToLessonId) {
      const lesson = await ctx.db.get(args.linkedToLessonId);
      if (!lesson) throw new Error("Linked lesson not found");

      const module = await ctx.db.get(lesson.moduleId);
      if (!module || module.courseId !== args.courseId) {
        throw new Error("Linked lesson does not belong to this course");
      }
    }

    if (args.linkedToModuleId) {
      const module = await ctx.db.get(args.linkedToModuleId);
      if (!module || module.courseId !== args.courseId) {
        throw new Error("Linked module does not belong to this course");
      }
    }

    const now = Date.now();

    // Admin creates as approved, faculty creates as draft
    const initialStatus = ctx.user.role === "ADMIN" ? "approved" : "draft";

    const assignmentId = await ctx.db.insert("assignments", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      instructions: args.instructions,
      linkedToLessonId: args.linkedToLessonId,
      linkedToModuleId: args.linkedToModuleId,
      submissionType: args.submissionType,
      allowedFileTypes: args.allowedFileTypes,
      maxFileSize: args.maxFileSize ?? 50 * 1024 * 1024, // 50MB default
      allowMultipleAttempts: args.allowMultipleAttempts ?? false,
      maxAttempts: args.maxAttempts,
      dueDate: args.dueDate,
      availableFrom: args.availableFrom,
      availableUntil: args.availableUntil,
      allowLateSubmissions: args.allowLateSubmissions ?? false,
      lateSubmissionPenalty: args.lateSubmissionPenalty,
      maxPoints: args.maxPoints ?? 100,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.user.userId as string,
    });

    return assignmentId;
  },
});

/**
 * Update assignment
 * Faculty only
 */
export const updateAssignment = facultyMutation({
  args: {
    assignmentId: v.id("assignments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    allowMultipleAttempts: v.optional(v.boolean()),
    maxAttempts: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    allowLateSubmissions: v.optional(v.boolean()),
    lateSubmissionPenalty: v.optional(v.number()),
    maxPoints: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.instructions !== undefined) updates.instructions = args.instructions;
    if (args.allowMultipleAttempts !== undefined)
      updates.allowMultipleAttempts = args.allowMultipleAttempts;
    if (args.maxAttempts !== undefined) updates.maxAttempts = args.maxAttempts;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.availableFrom !== undefined) updates.availableFrom = args.availableFrom;
    if (args.availableUntil !== undefined) updates.availableUntil = args.availableUntil;
    if (args.allowLateSubmissions !== undefined)
      updates.allowLateSubmissions = args.allowLateSubmissions;
    if (args.lateSubmissionPenalty !== undefined)
      updates.lateSubmissionPenalty = args.lateSubmissionPenalty;
    if (args.maxPoints !== undefined) updates.maxPoints = args.maxPoints;

    // If faculty editing approved assignment, set back to draft
    if (
      ctx.user.role === "FACULTY" &&
      assignment.status === "approved" &&
      Object.keys(updates).length > 1
    ) {
      updates.status = "draft";
    }

    await ctx.db.patch(args.assignmentId, updates);

    return null;
  },
});

/**
 * Publish assignment (request approval if faculty, directly publish if admin)
 * Faculty only
 */
export const publishAssignment = facultyMutation({
  args: { assignmentId: v.id("assignments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    if (assignment.status !== "draft" && assignment.status !== "approved") {
      throw new Error("Only draft or approved assignments can be published");
    }

    // If faculty, set to pending. If admin, set to published
    const newStatus = ctx.user.role === "ADMIN" ? "published" : "pending";

    await ctx.db.patch(args.assignmentId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete assignment
 * Faculty only - cannot delete if has submissions
 */
export const deleteAssignment = facultyMutation({
  args: { assignmentId: v.id("assignments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Check for submissions
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
      .collect();

    if (submissions.length > 0) {
      throw new Error(
        `Cannot delete assignment with ${submissions.length} submission(s). Unpublish it instead.`
      );
    }

    // Delete lesson attachment links (if any)
    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson")
      .collect();

    for (const attachment of attachments) {
      if (attachment.type === "assignment" && attachment.assignmentId === args.assignmentId) {
        await ctx.db.delete(attachment._id);
      }
    }

    // Delete the assignment
    await ctx.db.delete(args.assignmentId);

    return null;
  },
});