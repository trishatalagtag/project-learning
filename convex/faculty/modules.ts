import { v } from "convex/values";
import { requireContentModifyPermission } from "../lib/auth";
import { enrichModulesWithLessonCounts, listContentByParent } from "../lib/content_retrieval";
import { facultyMutation, facultyQuery } from "../lib/functions";

/**
 * List modules in a course
 * Faculty only - must be assigned teacher
 */
export const listModulesByCourse = facultyQuery({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("modules"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      order: v.number(),
      status: v.string(),
      lessonCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
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

    // Use shared helper to get modules
    const modules = await listContentByParent(ctx, "modules", "courseId", args.courseId);

    // Enrich with lesson counts via shared helper
    const enrichedModules = await enrichModulesWithLessonCounts(ctx, modules);

    // Map to expected return format
    const result = enrichedModules.map((module) => ({
      _id: module._id,
      _creationTime: module._creationTime,
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      order: module.order,
      status: module.status,
      lessonCount: module.lessonCount,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }));

    // Sort by order
    return result.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get single module by ID
 * Faculty only
 */
export const getModuleById = facultyQuery({
  args: { moduleId: v.id("modules") },
  returns: v.union(
    v.object({
      _id: v.id("modules"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      courseName: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      order: v.number(),
      status: v.string(),
      lessonCount: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);

    if (!module) {
      return null;
    }

    const course = await ctx.db.get(module.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get lessons count
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", module._id))
      .collect();

    return {
      _id: module._id,
      _creationTime: module._creationTime,
      courseId: module.courseId,
      courseName: course.title,
      title: module.title,
      description: module.description,
      content: module.content,
      order: module.order,
      status: module.status,
      lessonCount: lessons.length,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      createdBy: module.createdBy,
    };
  },
});

/**
 * Create module
 * Faculty only - creates in draft, needs approval if faculty
 */
export const createModule = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    order: v.optional(v.number()),
  },
  returns: v.id("modules"),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get next order number if not provided
    let order = args.order ?? 0;
    if (order === 0) {
      const existingModules = await ctx.db
        .query("modules")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect();
      order = existingModules.length;
    }

    const now = Date.now();

    // Admin can create as approved, faculty creates as draft
    const initialStatus = ctx.user.role === "ADMIN" ? "approved" : "draft";

    const moduleId = await ctx.db.insert("modules", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      content: args.content,
      order,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.user.userId as string,
    });

    return moduleId;
  },
});

/**
 * Update module
 * Faculty only
 */
export const updateModule = facultyMutation({
  args: {
    moduleId: v.id("modules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
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

    // Permission check for modifying content
    await requireContentModifyPermission(ctx, module, course);

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;

    // If editing approved module, set back to draft on significant change
    if (module.status === "approved" && Object.keys(updates).length > 1) {
      updates.status = "draft";
    }

    await ctx.db.patch(args.moduleId, updates);

    return null;
  },
});

/**
 * Delete module
 * Faculty only - cannot delete if has lessons
 */
export const deleteModule = facultyMutation({
  args: { moduleId: v.id("modules") },
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

    // Check for lessons
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    if (lessons.length > 0) {
      throw new Error(
        `Cannot delete module with ${lessons.length} lesson(s). Delete lessons first.`
      );
    }

    await ctx.db.delete(args.moduleId);

    return null;
  },
});

/**
 * Reorder modules within a course
 * Faculty only - updates order field for multiple modules
 */
export const reorderModules = facultyMutation({
  args: {
    courseId: v.id("courses"),
    moduleOrders: v.array(
      v.object({
        moduleId: v.id("modules"),
        order: v.number(),
      })
    ),
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

    // Verify all modules belong to this course
    const modules = await Promise.all(
      args.moduleOrders.map((mo) => ctx.db.get(mo.moduleId))
    );

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module) {
        throw new Error(`Module ${args.moduleOrders[i].moduleId} not found`);
      }
      if (module.courseId !== args.courseId) {
        throw new Error(`Module ${module._id} does not belong to this course`);
      }
    }

    // Update order for each module
    for (const { moduleId, order } of args.moduleOrders) {
      await ctx.db.patch(moduleId, {
        order,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});