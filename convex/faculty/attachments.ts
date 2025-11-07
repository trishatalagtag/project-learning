import { v } from "convex/values";
import { facultyMutation, facultyQuery } from "../lib/functions";

/**
 * List all attachments for a lesson
 * Faculty only
 */
export const listAttachmentsByLesson = facultyQuery({
  args: { lessonId: v.id("lessons") },
  returns: v.array(
    v.union(
      v.object({
        _id: v.id("lessonAttachments"),
        _creationTime: v.number(),
        type: v.literal("video"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.id("_storage"),
      }),
      v.object({
        _id: v.id("lessonAttachments"),
        _creationTime: v.number(),
        type: v.literal("resource"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.id("_storage"),
        fileType: v.string(),
        fileSize: v.number(),
      }),
      v.object({
        _id: v.id("lessonAttachments"),
        _creationTime: v.number(),
        type: v.literal("guide"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        introduction: v.optional(v.string()),
        conclusion: v.optional(v.string()),
        stepCount: v.number(),
      }),
      v.object({
        _id: v.id("lessonAttachments"),
        _creationTime: v.number(),
        type: v.literal("quiz"),
        lessonId: v.id("lessons"),
        order: v.number(),
        quizId: v.id("quizzes"),
        quizTitle: v.string(),
      }),
      v.object({
        _id: v.id("lessonAttachments"),
        _creationTime: v.number(),
        type: v.literal("assignment"),
        lessonId: v.id("lessons"),
        order: v.number(),
        assignmentId: v.id("assignments"),
        assignmentTitle: v.string(),
      })
    )
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    // Enrich attachments with additional data
    const enriched = await Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.type === "guide") {
          const steps = await ctx.db
            .query("guideSteps")
            .withIndex("by_guide_and_step", (q) =>
              q.eq("guideId", attachment._id)
            )
            .collect();

          return {
            ...attachment,
            stepCount: steps.length,
          };
        } else if (attachment.type === "quiz") {
          const quiz = await ctx.db.get(attachment.quizId);
          return {
            ...attachment,
            quizTitle: quiz?.title ?? "Unknown Quiz",
          };
        } else if (attachment.type === "assignment") {
          const assignment = await ctx.db.get(attachment.assignmentId);
          return {
            ...attachment,
            assignmentTitle: assignment?.title ?? "Unknown Assignment",
          };
        }
        return attachment;
      })
    );

    // Sort by order
    return enriched.sort((a, b) => a.order - b.order) as any;
  },
});

/**
 * Add video attachment to lesson
 * Faculty only
 */
export const addVideoAttachment = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    order: v.optional(v.number()),
  },
  returns: v.id("lessonAttachments"),
  handler: async (ctx, args) => {
    // Verify access
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify file exists
    const fileMetadata = await ctx.db.system.get(args.fileId);
    if (!fileMetadata) {
      throw new Error("File not found");
    }

    // Get next order number if not provided
    let order = args.order ?? 0;
    if (order === 0) {
      const existing = await ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
        .collect();
      order = existing.length;
    }

    const attachmentId = await ctx.db.insert("lessonAttachments", {
      type: "video",
      lessonId: args.lessonId,
      order,
      title: args.title,
      description: args.description,
      fileId: args.fileId,
    });

    return attachmentId;
  },
});

/**
 * Add resource (PDF, document) attachment to lesson
 * Faculty only
 */
export const addResourceAttachment = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    order: v.optional(v.number()),
  },
  returns: v.id("lessonAttachments"),
  handler: async (ctx, args) => {
    // Verify access (same as addVideoAttachment)
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify file exists and get metadata
    const fileMetadata = await ctx.db.system.get(args.fileId);
    if (!fileMetadata) {
      throw new Error("File not found");
    }

    // Get next order number
    let order = args.order ?? 0;
    if (order === 0) {
      const existing = await ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
        .collect();
      order = existing.length;
    }

    const attachmentId = await ctx.db.insert("lessonAttachments", {
      type: "resource",
      lessonId: args.lessonId,
      order,
      title: args.title,
      description: args.description,
      fileId: args.fileId,
      fileType: fileMetadata.contentType ?? "application/octet-stream",
      fileSize: fileMetadata.size,
    });

    return attachmentId;
  },
});

/**
 * Create step-by-step guide
 * Faculty only
 */
export const createGuide = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.string(),
    description: v.optional(v.string()),
    introduction: v.optional(v.string()),
    conclusion: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.id("lessonAttachments"),
  handler: async (ctx, args) => {
    // Verify access
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get next order number
    let order = args.order ?? 0;
    if (order === 0) {
      const existing = await ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
        .collect();
      order = existing.length;
    }

    const guideId = await ctx.db.insert("lessonAttachments", {
      type: "guide",
      lessonId: args.lessonId,
      order,
      title: args.title,
      description: args.description,
      introduction: args.introduction,
      conclusion: args.conclusion,
    });

    return guideId;
  },
});

/**
 * Add step to guide
 * Faculty only
 */
export const addGuideStep = facultyMutation({
  args: {
    guideId: v.id("lessonAttachments"),
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    stepNumber: v.optional(v.number()),
  },
  returns: v.id("guideSteps"),
  handler: async (ctx, args) => {
    // Verify guide exists and is a guide type
    const guide = await ctx.db.get(args.guideId);
    if (!guide) throw new Error("Guide not found");
    if (guide.type !== "guide") throw new Error("Attachment is not a guide");

    // Verify access
    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) throw new Error("Parent lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied.");
    }

    // Get next step number if not provided
    let stepNumber = args.stepNumber ?? 0;
    if (stepNumber === 0) {
      const existingSteps = await ctx.db
        .query("guideSteps")
        .withIndex("by_guide_and_step", (q) => q.eq("guideId", args.guideId))
        .collect();
      stepNumber = existingSteps.length + 1;
    }

    const stepId = await ctx.db.insert("guideSteps", {
      guideId: args.guideId,
      stepNumber,
      title: args.title,
      content: args.content,
      imageId: args.imageId,
      createdAt: Date.now(),
    });

    return stepId;
  },
});

/**
 * Update guide step
 * Faculty only
 */
export const updateGuideStep = facultyMutation({
  args: {
    stepId: v.id("guideSteps"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Guide step not found");

    // Verify access
    const guide = await ctx.db.get(step.guideId);
    if (!guide) throw new Error("Parent guide not found");

    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) throw new Error("Parent lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied.");
    }

    // Build update object
    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.imageId !== undefined) updates.imageId = args.imageId;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.stepId, updates);
    }

    return null;
  },
});

/**
 * Delete guide step
 * Faculty only
 */
export const deleteGuideStep = facultyMutation({
  args: { stepId: v.id("guideSteps") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Guide step not found");

    // Verify access
    const guide = await ctx.db.get(step.guideId);
    if (!guide) throw new Error("Parent guide not found");

    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) throw new Error("Parent lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied.");
    }

    await ctx.db.delete(args.stepId);

    return null;
  },
});

/**
 * Reorder guide steps
 * Faculty only
 */
export const reorderGuideSteps = facultyMutation({
  args: {
    guideId: v.id("lessonAttachments"),
    stepOrders: v.array(
      v.object({
        stepId: v.id("guideSteps"),
        stepNumber: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify guide exists
    const guide = await ctx.db.get(args.guideId);
    if (!guide) throw new Error("Guide not found");
    if (guide.type !== "guide") throw new Error("Attachment is not a guide");

    // Verify access
    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) throw new Error("Parent lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify all steps belong to this guide
    const steps = await Promise.all(
      args.stepOrders.map((so) => ctx.db.get(so.stepId))
    );

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) {
        throw new Error(`Step ${args.stepOrders[i].stepId} not found`);
      }
      if (step.guideId !== args.guideId) {
        throw new Error(`Step ${step._id} does not belong to this guide`);
      }
    }

    // Update step numbers
    for (const { stepId, stepNumber } of args.stepOrders) {
      await ctx.db.patch(stepId, { stepNumber });
    }

    return null;
  },
});

/**
 * Link quiz to lesson
 * Faculty only - creates quiz attachment reference
 */
export const linkQuizToLesson = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    quizId: v.id("quizzes"),
    order: v.optional(v.number()),
  },
  returns: v.id("lessonAttachments"),
  handler: async (ctx, args) => {
    // Verify access to lesson
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify quiz exists and belongs to same course
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");
    if (quiz.courseId !== module.courseId) {
      throw new Error("Quiz does not belong to the same course");
    }

    // Get next order number
    let order = args.order ?? 0;
    if (order === 0) {
      const existing = await ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
        .collect();
      order = existing.length;
    }

    const attachmentId = await ctx.db.insert("lessonAttachments", {
      type: "quiz",
      lessonId: args.lessonId,
      order,
      quizId: args.quizId,
    });

    return attachmentId;
  },
});

/**
 * Link assignment to lesson
 * Faculty only - creates assignment attachment reference
 */
export const linkAssignmentToLesson = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    assignmentId: v.id("assignments"),
    order: v.optional(v.number()),
  },
  returns: v.id("lessonAttachments"),
  handler: async (ctx, args) => {
    // Verify access to lesson
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify assignment exists and belongs to same course
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.courseId !== module.courseId) {
      throw new Error("Assignment does not belong to the same course");
    }

    // Get next order number
    let order = args.order ?? 0;
    if (order === 0) {
      const existing = await ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
        .collect();
      order = existing.length;
    }

    const attachmentId = await ctx.db.insert("lessonAttachments", {
      type: "assignment",
      lessonId: args.lessonId,
      order,
      assignmentId: args.assignmentId,
    });

    return attachmentId;
  },
});

/**
 * Delete attachment (any type)
 * Faculty only
 */
export const deleteAttachment = facultyMutation({
  args: { attachmentId: v.id("lessonAttachments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) throw new Error("Attachment not found");

    // Verify access
    const lesson = await ctx.db.get(attachment.lessonId);
    if (!lesson) throw new Error("Parent lesson not found");

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Parent module not found");

    const course = await ctx.db.get(module.courseId);
    if (!course) throw new Error("Parent course not found");

    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // If it's a guide, delete all steps first
    if (attachment.type === "guide") {
      const steps = await ctx.db
        .query("guideSteps")
        .withIndex("by_guide_and_step", (q) => q.eq("guideId", attachment._id))
        .collect();

      for (const step of steps) {
        await ctx.db.delete(step._id);
      }
    }

    // Delete the attachment
    await ctx.db.delete(args.attachmentId);

    return null;
  },
});