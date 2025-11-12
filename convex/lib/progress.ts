import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

/**
 * Calculate lesson completion progress for a single user in a course.
 */
export async function calculateLessonProgress(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<Array<{ 
  lessonId: Id<"lessons">; 
  lessonTitle: string;
  moduleTitle: string;
  completed: boolean;
  completedAt?: number;
}>> {
  const modules = await ctx.db
    .query("modules")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .filter((q) => q.eq(q.field("status"), "published"))
    .collect();

  const lessonProgressData = [];

  for (const module of modules) {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", module._id))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    for (const lesson of lessons) {
      const progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", userId).eq("lessonId", lesson._id)
        )
        .unique();

      lessonProgressData.push({
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        moduleTitle: module.title,
        completed: progress?.completed ?? false,
        completedAt: progress?.completedAt,
      });
    }
  }

  return lessonProgressData;
}

/**
 * Calculate quiz progress for a single user in a course.
 */
export async function calculateQuizProgress(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<Array<{ 
  quizId: Id<"quizzes">; 
  quizTitle: string;
  attempted: boolean; 
  bestScore: number | null;
  attemptCount: number;
}>> {
  const quizzes = await ctx.db
    .query("quizzes")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .filter((q) => q.eq(q.field("status"), "published"))
    .collect();

  const quizProgressData = [];

  for (const quiz of quizzes) {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_and_quiz", (q) =>
        q.eq("userId", userId).eq("quizId", quiz._id)
      )
      .collect();

    if (attempts.length === 0) {
      quizProgressData.push({
        quizId: quiz._id,
        quizTitle: quiz.title,
        attempted: false,
        bestScore: null,
        attemptCount: 0,
      });
    } else {
      const bestAttempt = attempts.reduce((best, current) =>
        current.percentage > best.percentage ? current : best
      );

      quizProgressData.push({
        quizId: quiz._id,
        quizTitle: quiz.title,
        attempted: true,
        bestScore: bestAttempt.percentage,
        attemptCount: attempts.length,
      });
    }
  }

  return quizProgressData;
}

/**
 * Calculate assignment progress for a single user in a course.
 */
export async function calculateAssignmentProgress(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<Array<{
  assignmentId: Id<"assignments">;
  assignmentTitle: string;
  submitted: boolean;
  grade: number | null;
  isLate: boolean;
}>> {
  const assignments = await ctx.db
    .query("assignments")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .filter((q) => q.eq(q.field("status"), "published"))
    .collect();

  const assignmentProgressData = [];

  for (const assignment of assignments) {
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user_and_assignment", (q) =>
        q.eq("userId", userId).eq("assignmentId", assignment._id)
      )
      .filter((q) => q.eq(q.field("status"), "graded"))
      .collect();

    if (submissions.length === 0) {
      assignmentProgressData.push({
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        submitted: false,
        grade: null,
        isLate: false,
      });
    } else {
      const latestSubmission = submissions.reduce((latest, current) =>
        current.submittedAt! > latest.submittedAt! ? current : latest
      );

      assignmentProgressData.push({
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        submitted: true,
        grade: latestSubmission.grade ?? null,
        isLate: latestSubmission.isLate,
      });
    }
  }

  return assignmentProgressData;
}

/**
 * Calculate aggregate course performance for a single user.
 */
export async function calculateCoursePerformance(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<{
  lessons: {
    total: number;
    completed: number;
    completionPercentage: number;
  };
  quizzes: {
    total: number;
    completed: number;
    averageScore: number | null;
  };
  assignments: {
    total: number;
    completed: number;
    averageGrade: number | null;
  };
  overallProgress: number;
}> {
  const [lessonProgress, quizProgress, assignmentProgress] = await Promise.all([
    calculateLessonProgress(ctx, userId, courseId),
    calculateQuizProgress(ctx, userId, courseId),
    calculateAssignmentProgress(ctx, userId, courseId),
  ]);

  // Lessons
  const totalLessons = lessonProgress.length;
  const completedLessons = lessonProgress.filter((l) => l.completed).length;
  const lessonCompletionPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Quizzes
  const totalQuizzes = quizProgress.length;
  const completedQuizzes = quizProgress.filter((q) => q.attempted).length;
  const averageQuizScore =
    completedQuizzes > 0
      ? quizProgress
          .filter((q) => q.attempted)
          .reduce((sum, q) => sum + (q.bestScore ?? 0), 0) / completedQuizzes
      : null;

  // Assignments
  const totalAssignments = assignmentProgress.length;
  const completedAssignments = assignmentProgress.filter((a) => a.submitted).length;
  const averageAssignmentGrade =
    completedAssignments > 0
      ? assignmentProgress
          .filter((a) => a.submitted)
          .reduce((sum, a) => sum + (a.grade ?? 0), 0) / completedAssignments
      : null;

  // Overall progress
  const quizCompletionPercentage =
    totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
  const assignmentCompletionPercentage =
    totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  const overallProgress =
    (lessonCompletionPercentage +
      quizCompletionPercentage +
      assignmentCompletionPercentage) / 3;

  return {
    lessons: {
      total: totalLessons,
      completed: completedLessons,
      completionPercentage: lessonCompletionPercentage,
    },
    quizzes: {
      total: totalQuizzes,
      completed: completedQuizzes,
      averageScore: averageQuizScore,
    },
    assignments: {
      total: totalAssignments,
      completed: completedAssignments,
      averageGrade: averageAssignmentGrade,
    },
    overallProgress,
  };
}

/**
 * Calculate detailed progress for faculty view (itemized).
 */
export async function calculateDetailedLearnerProgress(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
) {
  const [lessonProgress, quizProgress, assignmentProgress] = await Promise.all([
    calculateLessonProgress(ctx, userId, courseId),
    calculateQuizProgress(ctx, userId, courseId),
    calculateAssignmentProgress(ctx, userId, courseId),
  ]);
  
  return {
    lessons: lessonProgress,
    quizzes: quizProgress,
    assignments: assignmentProgress,
  };
}

/**
 * Calculate platform-wide progress for a user across all enrolled courses.
 */
export async function calculatePlatformProgress(
  ctx: QueryCtx,
  userId: string
): Promise<{
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overallCompletionPercentage: number;
}> {
  const enrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("status"), "active"))
    .collect();
  
  let totalProgress = 0;
  let completedCount = 0;
  
  for (const enrollment of enrollments) {
    const performance = await calculateCoursePerformance(ctx, userId, enrollment.courseId);
    totalProgress += performance.overallProgress;
    
    if (performance.overallProgress >= 100) {
      completedCount++;
    }
  }
  
  return {
    totalCourses: enrollments.length,
    completedCourses: completedCount,
    inProgressCourses: enrollments.length - completedCount,
    overallCompletionPercentage: enrollments.length > 0 ? totalProgress / enrollments.length : 0,
  };
}
