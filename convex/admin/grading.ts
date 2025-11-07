import { v } from "convex/values";
import { adminMutation } from "../lib/functions";
import { gradingConfigValidator } from "../lib/validators";

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

    // Validate weighted components if using weighted grading
    if (args.gradingConfig.gradingMethod === "weighted") {
      if (!args.gradingConfig.components || args.gradingConfig.components.length === 0) {
        throw new Error("Weighted grading requires at least one component");
      }

      // Validate weights sum to 100
      const totalWeight = args.gradingConfig.components.reduce(
        (sum, component) => sum + component.weight,
        0
      );

      if (totalWeight !== 100) {
        throw new Error(
          `Component weights must sum to 100. Current total: ${totalWeight}`
        );
      }

      // Validate each component weight is positive
      for (const component of args.gradingConfig.components) {
        if (component.weight <= 0) {
          throw new Error("Component weights must be positive numbers");
        }
      }
    }

    // Validate passing score
    if (args.gradingConfig.passingScore < 0 || args.gradingConfig.passingScore > 100) {
      throw new Error("Passing score must be between 0 and 100");
    }

    await ctx.db.patch(args.courseId, {
      gradingConfig: args.gradingConfig,
      updatedAt: Date.now(),
    });

    return null;
  },
});