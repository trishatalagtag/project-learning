import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { learnerMutation, learnerQuery } from "../lib/functions";

/**
 * Submit learner feedback (issue report/suggestion)
 * targetType: course | lesson | assignment | quiz
 */
export const submitLearnerFeedback = learnerMutation({
  args: {
    targetType: v.union(
      v.literal("course"),
      v.literal("lesson"),
      v.literal("assignment"),
      v.literal("quiz")
    ),
    targetId: v.string(),
    feedbackType: v.union(
      v.literal("broken_link"),
      v.literal("incorrect_info"),
      v.literal("not_loading"),
      v.literal("suggestion"),
      v.literal("other")
    ),
    message: v.string(),
  },
  returns: v.id("learnerFeedback"),
  handler: async (ctx, args) => {
    // Ensure access: require enrollment in the course holding the target
    let courseId: Id<"courses"> | null = null as any;

    switch (args.targetType) {
      case "course": {
        const course = await ctx.db.get(args.targetId as any);
        if (!course) throw new Error("Course not found");
        courseId = course._id as Id<"courses">;
        break;
      }
      case "lesson": {
        const lesson = await ctx.db.get(args.targetId as Id<"lessons">);
        if (!lesson) throw new Error("Lesson not found");
        const module = await ctx.db.get(lesson.moduleId as Id<"modules">);
        if (!module) throw new Error("Module not found");
        courseId = module.courseId as Id<"courses">;
        break;
      }
      case "assignment": {
        const assignment = await ctx.db.get(args.targetId as Id<"assignments">);
        if (!assignment) throw new Error("Assignment not found");
        courseId = assignment.courseId as Id<"courses">;
        break;
      }
      case "quiz": {
        const quiz = await ctx.db.get(args.targetId as Id<"quizzes">);
        if (!quiz) throw new Error("Quiz not found");
        courseId = quiz.courseId as Id<"courses">;
        break;
      }
    }

    const enrollment =
      courseId &&
      (await ctx.db
        .query("enrollments")
        .withIndex("by_user_and_course", (q) =>
          q.eq("userId", ctx.user.userId).eq("courseId", courseId!)
        )
        .first());

    if (!enrollment || enrollment.status !== "active") {
      throw new Error("You must be enrolled in the course to submit feedback");
    }

    const feedbackId = await ctx.db.insert("learnerFeedback", {
      userId: ctx.user.userId,
      targetType: args.targetType,
      targetId: args.targetId,
      feedbackType: args.feedbackType,
      message: args.message,
      status: "open",
      resolvedBy: undefined,
      resolvedAt: undefined,
      createdAt: Date.now(),
    });

    return feedbackId;
  },
});

/**
 * View my submitted feedback
 */
export const viewMyFeedback = learnerQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("learnerFeedback"),
      _creationTime: v.number(),
      targetType: v.string(),
      targetId: v.string(),
      feedbackType: v.string(),
      message: v.string(),
      status: v.string(),
      createdAt: v.number(),
      resolvedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const feedbacks = await ctx.db
      .query("learnerFeedback")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();

    return feedbacks
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((f) => ({
        _id: f._id,
        _creationTime: f._creationTime,
        targetType: f.targetType,
        targetId: f.targetId,
        feedbackType: f.feedbackType,
        message: f.message,
        status: f.status,
        createdAt: f.createdAt,
        resolvedAt: f.resolvedAt,
      }));
  },
});