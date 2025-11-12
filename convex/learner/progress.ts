import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { learnerMutation, learnerQuery } from "../lib/functions";
import {
  calculateAssignmentProgress,
  calculateCoursePerformance,
  calculateLessonProgress,
} from "../lib/progress";


export const getLessonProgressByCourse = learnerQuery({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      lessonId: v.id("lessons"),
      completed: v.boolean(),
    })
  ),
  handler: async (ctx, { courseId }) => {
    const progress = await calculateLessonProgress(
      ctx,
      ctx.user.userId,
      courseId
    );

    return progress.map((lesson) => ({
      lessonId: lesson.lessonId,
      completed: lesson.completed,
    }));
  },
});

/**
 * Get my overall platform progress summary
 */
export const getMyProgress = learnerQuery({
  args: {},
  returns: v.object({
    coursesEnrolled: v.number(),
    coursesCompleted: v.number(),
    lessonsCompleted: v.number(),
    totalLessons: v.number(),
    averageQuizScore: v.optional(v.number()),
    averageAssignmentScore: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();

    const activeEnrollments = enrollments.filter((e) => e.status === "active");
    const completedEnrollments = enrollments.filter((e) => e.status === "completed");
    const relevantEnrollments = enrollments.filter((e) =>
      e.status === "active" || e.status === "completed"
    );

    const performances = await Promise.all(
      relevantEnrollments.map((enrollment) =>
        calculateCoursePerformance(ctx, ctx.user.userId, enrollment.courseId)
      )
    );

    let totalLessons = 0;
    let completedLessons = 0;
    const quizScores: number[] = [];
    const assignmentScores: number[] = [];

    for (const performance of performances) {
      totalLessons += performance.lessons.total;
      completedLessons += performance.lessons.completed;

      if (performance.quizzes.averageScore !== null) {
        quizScores.push(performance.quizzes.averageScore);
      }

      if (performance.assignments.averageGrade !== null) {
        assignmentScores.push(performance.assignments.averageGrade);
      }
    }

    const averageQuizScore =
      quizScores.length > 0
        ? Math.round(
          (quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) * 100
        ) / 100
        : undefined;

    const averageAssignmentScore =
      assignmentScores.length > 0
        ? Math.round(
          (assignmentScores.reduce((sum, score) => sum + score, 0) /
            assignmentScores.length) *
          100
        ) / 100
        : undefined;

    return {
      coursesEnrolled: activeEnrollments.length,
      coursesCompleted: completedEnrollments.length,
      lessonsCompleted: completedLessons,
      totalLessons,
      averageQuizScore,
      averageAssignmentScore,
    };
  },
});

/**
 * Get my performance for a single course (on-the-fly calculation)
 */
export const getCoursePerformance = learnerQuery({
  args: { courseId: v.id("courses") },
  returns: v.union(
    v.object({
      courseId: v.id("courses"),
      totalLessons: v.number(),
      completedLessons: v.number(),
      totalQuizzes: v.number(),
      completedQuizzes: v.number(),
      averageQuizScore: v.optional(v.number()),
      totalAssignments: v.number(),
      submittedAssignments: v.number(),
      gradedAssignments: v.number(),
      averageAssignmentScore: v.optional(v.number()),
      overallProgress: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", args.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") return null;
    const [performance, assignmentDetails] = await Promise.all([
      calculateCoursePerformance(ctx, ctx.user.userId, args.courseId),
      calculateAssignmentProgress(ctx, ctx.user.userId, args.courseId),
    ]);

    const gradedAssignments = assignmentDetails.filter((entry) => entry.grade !== null).length;
    const submittedAssignments = assignmentDetails.filter((entry) => entry.submitted).length;

    return {
      courseId: args.courseId,
      totalLessons: performance.lessons.total,
      completedLessons: performance.lessons.completed,
      totalQuizzes: performance.quizzes.total,
      completedQuizzes: performance.quizzes.completed,
      averageQuizScore: performance.quizzes.averageScore
        ? Math.round(performance.quizzes.averageScore * 100) / 100
        : undefined,
      totalAssignments: performance.assignments.total,
      submittedAssignments,
      gradedAssignments,
      averageAssignmentScore: performance.assignments.averageGrade
        ? Math.round(performance.assignments.averageGrade * 100) / 100
        : undefined,
      overallProgress: Math.round(performance.overallProgress * 100) / 100,
    };
  },
});

/**
 * Mark lesson complete/incomplete
 */
export const markLessonComplete = learnerMutation({
  args: {
    lessonId: v.id("lessons"),
    completed: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Module not found");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", module.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", ctx.user.userId).eq("lessonId", args.lessonId)
      )
      .first();

    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("lessonProgress", {
        userId: ctx.user.userId,
        lessonId: args.lessonId,
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        lastViewedAt: now,
      });
    } else {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        lastViewedAt: now,
      });
    }

    return null;
  },
});

/**
 * Update guide step progress (toggle/add a completed step)
 */
export const updateGuideProgress = learnerMutation({
  args: {
    guideId: v.id("lessonAttachments"),
    stepNumber: v.number(),
    completed: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide || guide.type !== "guide") throw new Error("Guide not found");

    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    const module = await ctx.db.get(lesson.moduleId);
    if (!module) throw new Error("Module not found");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", module.courseId as Id<"courses">)
      )
      .unique();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }

    // Validate step exists
    const steps = await ctx.db
      .query("guideSteps")
      .withIndex("by_guide_and_step", (q) => q.eq("guideId", guide._id))
      .collect();
    const totalSteps = steps.length;
    if (args.stepNumber < 1 || args.stepNumber > totalSteps) {
      throw new Error("Invalid step number");
    }

    const existing = await ctx.db
      .query("guideProgress")
      .withIndex("by_user_and_guide", (q) =>
        q.eq("userId", ctx.user.userId).eq("guideId", args.guideId)
      )
      .first();

    let completedSteps = existing?.completedSteps ?? [];
    const hasStep = completedSteps.includes(args.stepNumber);

    if (args.completed && !hasStep) {
      completedSteps = [...completedSteps, args.stepNumber].sort((a, b) => a - b);
    } else if (!args.completed && hasStep) {
      completedSteps = completedSteps.filter((n) => n !== args.stepNumber);
    }

    const isComplete = completedSteps.length === totalSteps;

    if (!existing) {
      await ctx.db.insert("guideProgress", {
        userId: ctx.user.userId,
        guideId: args.guideId,
        completedSteps,
        totalSteps,
        lastViewedStep: args.stepNumber,
        completed: isComplete,
        completedAt: isComplete ? Date.now() : undefined,
      });
    } else {
      await ctx.db.patch(existing._id, {
        completedSteps,
        totalSteps,
        lastViewedStep: args.stepNumber,
        completed: isComplete,
        completedAt: isComplete ? Date.now() : undefined,
      });
    }

    return null;
  },
});