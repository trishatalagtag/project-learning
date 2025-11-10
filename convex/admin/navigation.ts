import { v } from "convex/values";
import { adminQuery } from "../lib/functions";

/**
 * Get all modules with their lessons for a course in ONE query
 * Admin version - can access any course without teacherId check
 * Replaces the N+1 pattern of listModulesByCourse + listLessonsByModule
 */
export const getModulesWithLessons = adminQuery({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("modules"),
      title: v.string(),
      description: v.string(),
      order: v.number(),
      status: v.string(),
      courseId: v.id("courses"),
      _creationTime: v.number(),
      lessonCount: v.number(),
      lessons: v.array(
        v.object({
          _id: v.id("lessons"),
          moduleId: v.id("modules"),
          title: v.string(),
          description: v.string(),
          order: v.number(),
          status: v.string(),
          _creationTime: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Get course (admin can access any course)
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    // Get all modules
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Get all lessons for all modules in ONE query
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_module", (q) => q.eq("moduleId", module._id))
          .collect();

        return {
          _id: module._id,
          title: module.title,
          description: module.description,
          order: module.order,
          status: module.status,
          courseId: module.courseId,
          _creationTime: module._creationTime,
          lessonCount: lessons.length,
          lessons: lessons
            .map((lesson) => ({
              _id: lesson._id,
              moduleId: lesson.moduleId,
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              status: lesson.status,
              _creationTime: lesson._creationTime,
            }))
            .sort((a, b) => a.order - b.order),
        };
      })
    );

    // Sort by order
    return modulesWithLessons.sort((a, b) => a.order - b.order);
  },
});

