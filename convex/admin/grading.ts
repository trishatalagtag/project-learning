import { v } from "convex/values";
import { adminMutation } from "../lib/functions";
import { gradingConfigValidator, validateGradingConfig } from "../lib/validators";

/**
 * Update course grading configuration
 * Admin only - configure how the course is graded
 */
export const updateCourseGradingConfig = adminMutation({
  args: {
    courseId: v.id("courses"),
    gradingConfig: gradingConfigValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Validate grading config using extracted validator
    validateGradingConfig(args.gradingConfig);

    await ctx.db.patch(args.courseId, {
      gradingConfig: args.gradingConfig,
      updatedAt: Date.now(),
    });

    return null;
  },
});