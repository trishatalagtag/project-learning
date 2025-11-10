import { v } from "convex/values";
import { learnerMutation, learnerQuery } from "../lib/functions";
import { Id } from "../_generated/dataModel";


export const getLessonProgressByCourse = learnerQuery({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      lessonId: v.id("lessons"),
      completed: v.boolean(),
    })
  ),
  handler: async (ctx, { courseId }) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    const lessonIds = (
      await Promise.all(
        modules.map((m) =>
          ctx.db
            .query("lessons")
            .withIndex("by_module", (q) => q.eq("moduleId", m._id))
            .collect()
        )
      )
    )
      .flat()
      .map((l) => l._id);

    // Get progress for all lessons
    const progress = await Promise.all(
      lessonIds.map(async (lessonId) => {
        const record = await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", ctx.user.userId).eq("lessonId", lessonId)
          )
          .first();

        return {
          lessonId,
          completed: record?.completed || false,
        };
      })
    );

    return progress;
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

    const activeCourses = enrollments.filter((e) => e.status === "active");
    const completedCourses = enrollments.filter((e) => e.status === "completed");

    // Lessons completed
    const allLessonProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();

    const lessonsCompletedCount = allLessonProgress.filter((lp) => lp.completed).length;

    // Batch modules and lessons for enrolled courses
    const courseIds = activeCourses.map((e) => e.courseId);
    const allModulesArrays = await Promise.all(
      courseIds.map((courseId) =>
        ctx.db
          .query("modules")
          .withIndex("by_course", (q) => q.eq("courseId", courseId))
          .collect()
      )
    );
    const allModules = allModulesArrays.flat();
    const moduleIds = allModules.map((m) => m._id);
    const allLessonsArrays = await Promise.all(
      moduleIds.map((moduleId) =>
        ctx.db
          .query("lessons")
          .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
          .collect()
      )
    );
    const totalLessons = allLessonsArrays.flat().length;

    // Average quiz score
    const quizAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();
    const scored = quizAttempts.filter((a) => a.submittedAt);
    const avgQuiz =
      scored.length > 0
        ? scored.reduce((sum, a) => sum + a.percentage, 0) / scored.length
        : undefined;

    // Average assignment score (as percentage of max)
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();

    const graded = submissions.filter((s) => s.status === "graded" && s.grade !== undefined);

    let avgAssignment: number | undefined;
    if (graded.length > 0) {
      const percents: number[] = [];
      for (const s of graded) {
        const assignment = await ctx.db.get(s.assignmentId);
        if (assignment && s.grade !== undefined) {
          percents.push((s.grade / assignment.maxPoints) * 100);
        }
      }
      if (percents.length > 0) {
        avgAssignment = percents.reduce((a, b) => a + b, 0) / percents.length;
      }
    }

    return {
      coursesEnrolled: activeCourses.length,
      coursesCompleted: completedCourses.length,
      lessonsCompleted: lessonsCompletedCount,
      totalLessons,
      averageQuizScore: avgQuiz ? Math.round(avgQuiz * 100) / 100 : undefined,
      averageAssignmentScore: avgAssignment
        ? Math.round(avgAssignment * 100) / 100
        : undefined,
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

    // Lessons
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    const moduleIds = modules.map((m) => m._id);
    const allLessonsArrays = await Promise.all(
      moduleIds.map((moduleId) =>
        ctx.db
          .query("lessons")
          .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
          .collect()
      )
    );
    const allLessons = allLessonsArrays.flat();
    const totalLessons = allLessons.length;

    const lessonIds = allLessons.map((l) => l._id);
    const lessonProgressArray = await Promise.all(
      lessonIds.map((lessonId) =>
        ctx.db
          .query("lessonProgress")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", ctx.user.userId).eq("lessonId", lessonId)
          )
          .first()
      )
    );
    const completedCount = lessonProgressArray.filter((lp) => lp?.completed).length;

    // Quizzes
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();
    const quizAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();
    const attemptsInCourse = quizAttempts.filter((a) =>
      quizzes.some((qz) => qz._id === a.quizId)
    );
    const completedQuizzes = new Set(attemptsInCourse.map((a) => a.quizId)).size;
    const avgQuiz =
      attemptsInCourse.length > 0
        ? attemptsInCourse.reduce((sum, a) => sum + a.percentage, 0) /
          attemptsInCourse.length
        : undefined;

    // Assignments
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user.userId))
      .collect();
    const submissionsInCourse = submissions.filter((s) =>
      assignments.some((a) => a._id === s.assignmentId)
    );
    const submittedAssignments = submissionsInCourse.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    ).length;
    const gradedAssignments = submissionsInCourse.filter(
      (s) => s.status === "graded"
    );

    let avgAssignment: number | undefined;
    if (gradedAssignments.length > 0) {
      const percents: number[] = [];
      for (const s of gradedAssignments) {
        const a = await ctx.db.get(s.assignmentId);
        if (!a || s.grade === undefined) continue;
        percents.push((s.grade / a.maxPoints) * 100);
      }
      if (percents.length > 0) {
        avgAssignment = percents.reduce((a, b) => a + b, 0) / percents.length;
      }
    }

    // Overall progress (simple average)
    const lessonPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    const quizPct = quizzes.length > 0 ? (completedQuizzes / quizzes.length) * 100 : 0;
    const assignmentPct =
      assignments.length > 0 ? (submittedAssignments / assignments.length) * 100 : 0;
    const overall =
      (lessonPct + quizPct + assignmentPct) / 3;

    return {
      courseId: args.courseId,
      totalLessons,
      completedLessons: completedCount,
      totalQuizzes: quizzes.length,
      completedQuizzes,
      averageQuizScore: avgQuiz ? Math.round(avgQuiz * 100) / 100 : undefined,
      totalAssignments: assignments.length,
      submittedAssignments,
      gradedAssignments: gradedAssignments.length,
      averageAssignmentScore: avgAssignment
        ? Math.round(avgAssignment * 100) / 100
        : undefined,
      overallProgress: Math.round(overall * 100) / 100,
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