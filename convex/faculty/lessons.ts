import { v } from "convex/values";
import { requireContentModifyPermission } from "../lib/auth";
import { listContentByParent } from "../lib/content_retrieval";
import { facultyMutation, facultyQuery } from "../lib/functions";

/**
 * List lessons in a module
 * Faculty only - must be assigned teacher of parent course
 */
export const listLessonsByModule = facultyQuery({
  args: { moduleId: v.id("modules") },
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      description: v.string(),
      order: v.number(),
      status: v.string(),
      attachmentCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);

    if (!module) {
      throw new Error("Module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Use shared helper to get lessons
    const lessons = await listContentByParent(ctx, "lessons", "moduleId", args.moduleId);

    // Enrich with attachment counts
    const enrichedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        const attachments = await ctx.db
          .query("lessonAttachments")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .collect();

        return {
          _id: lesson._id,
          _creationTime: lesson._creationTime,
          moduleId: lesson.moduleId,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          status: lesson.status,
          attachmentCount: attachments.length,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        };
      })
    );

    // Sort by order
    return enrichedLessons.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get single lesson by ID
 * Faculty only
 */
export const getLessonById = facultyQuery({
  args: { lessonId: v.id("lessons") },
  returns: v.union(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      moduleName: v.string(),
      courseId: v.id("courses"),
      courseName: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      order: v.number(),
      status: v.string(),
      attachmentCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      return null;
    }

    const module = await ctx.db.get(lesson.moduleId);

    if (!module) {
      throw new Error("Parent module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    return {
      _id: lesson._id,
      _creationTime: lesson._creationTime,
      moduleId: lesson.moduleId,
      moduleName: module.title,
      courseId: module.courseId,
      courseName: course.title,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      order: lesson.order,
      status: lesson.status,
      attachmentCount: attachments.length,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      createdBy: lesson.createdBy,
    };
  },
});

/**
 * Create lesson
 * Faculty only - creates in draft, needs approval if faculty
 */
export const createLesson = facultyMutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    order: v.optional(v.number()),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);

    if (!module) {
      throw new Error("Module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get next order number if not provided
    let order = args.order ?? 0;
    if (order === 0) {
      const existingLessons = await ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
        .collect();
      order = existingLessons.length;
    }

    const now = Date.now();

    // Admin can create as approved, faculty creates as draft
    const initialStatus = ctx.user.role === "ADMIN" ? "approved" : "draft";

    const lessonId = await ctx.db.insert("lessons", {
      moduleId: args.moduleId,
      title: args.title,
      description: args.description,
      content: args.content,
      order,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.user.userId as string,
    });

    return lessonId;
  },
});

/**
 * Update lesson
 * Faculty only
 */
export const updateLesson = facultyMutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    order: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const module = await ctx.db.get(lesson.moduleId);

    if (!module) {
      throw new Error("Parent module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Permission check for modifying content
    await requireContentModifyPermission(ctx, lesson, course);

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.order !== undefined) updates.order = args.order;
    if (args.status !== undefined) updates.status = args.status;

    // If editing approved lesson, set back to draft on significant change (unless status is explicitly set)
    if (lesson.status === "approved" && args.status === undefined && Object.keys(updates).length > 1) {
      updates.status = "draft";
    }

    await ctx.db.patch(args.lessonId, updates);

    return null;
  },
});

/**
 * Delete lesson
 * Faculty only - cannot delete if has attachments
 */
export const deleteLesson = facultyMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const module = await ctx.db.get(lesson.moduleId);

    if (!module) {
      throw new Error("Parent module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Check for attachments
    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (attachments.length > 0) {
      throw new Error(
        `Cannot delete lesson with ${attachments.length} attachment(s). Delete attachments first.`
      );
    }

    await ctx.db.delete(args.lessonId);

    return null;
  },
});

/**
 * Reorder lessons within a module
 * Faculty only - updates order field for multiple lessons
 */
export const reorderLessons = facultyMutation({
  args: {
    moduleId: v.id("modules"),
    lessonOrders: v.array(
      v.object({
        lessonId: v.id("lessons"),
        order: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);

    if (!module) {
      throw new Error("Module not found");
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Verify all lessons belong to this module
    const lessons = await Promise.all(
      args.lessonOrders.map((lo) => ctx.db.get(lo.lessonId))
    );

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (!lesson) {
        throw new Error(`Lesson ${args.lessonOrders[i].lessonId} not found`);
      }
      if (lesson.moduleId !== args.moduleId) {
        throw new Error(`Lesson ${lesson._id} does not belong to this module`);
      }
    }

    // Update order for each lesson
    for (const { lessonId, order } of args.lessonOrders) {
      await ctx.db.patch(lessonId, {
        order,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});