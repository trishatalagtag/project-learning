import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAuth } from "../lib/auth";
import { getContentTree } from "../lib/content_retrieval";
import { isUserEnrolledInCourse } from "../lib/enrollment";

/**
 * Get modules with lessons for a course.
 * 
 * Replaces:
 * - api.faculty.navigation.getModulesWithLessons
 * - api.admin.navigation.getModulesWithLessons
 * 
 * Works for all authenticated users with appropriate permissions.
 * Returns a hierarchical tree of modules containing their lessons.
 */
export const getModulesWithLessons = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      _id: v.id("modules"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      order: v.number(),
      status: v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("changes_requested"),
        v.literal("approved"),
        v.literal("published")
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
      lessonCount: v.number(),
      lessons: v.array(
        v.object({
          _id: v.id("lessons"),
          _creationTime: v.number(),
          moduleId: v.id("modules"),
          title: v.string(),
          description: v.string(),
          content: v.string(),
          order: v.number(),
          status: v.union(
            v.literal("draft"),
            v.literal("pending"),
            v.literal("changes_requested"),
            v.literal("approved"),
            v.literal("published")
          ),
          createdAt: v.number(),
          updatedAt: v.number(),
          createdBy: v.string(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Require authentication
    const user = await requireAuth(ctx);

    // Get course to check permissions
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Permission checks based on role
    if (user.role !== "ADMIN") {
      if (user.role === "FACULTY") {
        // Faculty can only view modules in courses they teach
        if (course.teacherId !== user._id && course.createdBy !== user._id) {
          throw new Error("You can only view modules in courses you teach");
        }
      } else if (user.role === "LEARNER") {
        // Learners must be enrolled
        const enrolled = await isUserEnrolledInCourse(ctx, user._id, args.courseId);
        if (!enrolled) {
          throw new Error("You must be enrolled in this course");
        }
      }
    }

    // Use the consolidated helper from lib/content_retrieval.ts
    const modulesWithLessons = await getContentTree(ctx, args.courseId, undefined, false);

    // Add lessonCount to match expected structure
    return modulesWithLessons.map((module) => ({
      ...module,
      lessonCount: module.lessons.length,
    }));
  },
});
