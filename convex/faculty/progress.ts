import { v } from "convex/values";
import { getUsersByUserIds } from "../lib/auth";
import { facultyQuery } from "../lib/functions";
import {
  calculateCoursePerformance
} from "../lib/progress";

/**
 * Get overall course progress for all learners
 * Faculty only - summary stats per learner
 */
export const getCourseProgress = facultyQuery({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      userId: v.string(),
      userName: v.string(),
      userEmail: v.string(),
      enrolledAt: v.number(),
      enrollmentStatus: v.string(),
      completedLessons: v.number(),
      totalLessons: v.number(),
      lessonProgress: v.number(), // percentage
      completedQuizzes: v.number(),
      totalQuizzes: v.number(),
      averageQuizScore: v.optional(v.number()),
      submittedAssignments: v.number(),
      totalAssignments: v.number(),
      gradedAssignments: v.number(),
      averageAssignmentScore: v.optional(v.number()),
      overallProgress: v.number(), // percentage
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

    // Get all enrollments
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Build progress for each learner using shared helper
    const enrollmentUserIds = enrollments.map((e) => e.userId);
    const users = await getUsersByUserIds(ctx, enrollmentUserIds);
    const userMap = new Map(users.filter(Boolean).map((u: any) => [u.userId, u]));

    const progressData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = userMap.get(enrollment.userId);

        // Use shared progress calculation helper
        const performance = await calculateCoursePerformance(ctx, enrollment.userId, args.courseId);

        return {
          userId: enrollment.userId,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "Unknown",
          enrolledAt: enrollment.enrolledAt,
          enrollmentStatus: enrollment.status,
          completedLessons: performance.lessons.completed,
          totalLessons: performance.lessons.total,
          lessonProgress: Math.round(performance.lessons.completionPercentage * 100) / 100,
          completedQuizzes: performance.quizzes.completed,
          totalQuizzes: performance.quizzes.total,
          averageQuizScore: performance.quizzes.averageScore
            ? Math.round(performance.quizzes.averageScore * 100) / 100
            : undefined,
          submittedAssignments: performance.assignments.completed,
          totalAssignments: performance.assignments.total,
          gradedAssignments: performance.assignments.completed,
          averageAssignmentScore: performance.assignments.averageGrade
            ? Math.round(performance.assignments.averageGrade * 100) / 100
            : undefined,
          overallProgress: Math.round(performance.overallProgress * 100) / 100,
        };
      })
    );

    // Sort by overall progress descending
    return progressData.sort((a, b) => b.overallProgress - a.overallProgress);
  },
});

/**
 * Get detailed progress for a specific learner in a course
 * Faculty only
 */
export const getLearnerProgress = facultyQuery({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      user: v.object({
        id: v.string(),
        name: v.string(),
        email: v.string(),
      }),
      enrollment: v.object({
        enrolledAt: v.number(),
        status: v.string(),
        completedAt: v.optional(v.number()),
      }),
      lessons: v.array(
        v.object({
          lessonId: v.id("lessons"),
          lessonTitle: v.string(),
          moduleTitle: v.string(),
          completed: v.boolean(),
          completedAt: v.optional(v.number()),
        })
      ),
      quizzes: v.array(
        v.object({
          quizId: v.id("quizzes"),
          quizTitle: v.string(),
          attemptCount: v.number(),
          bestScore: v.optional(v.number()),
          latestScore: v.optional(v.number()),
          lastAttemptAt: v.optional(v.number()),
        })
      ),
      assignments: v.array(
        v.object({
          assignmentId: v.id("assignments"),
          assignmentTitle: v.string(),
          submitted: v.boolean(),
          graded: v.boolean(),
          grade: v.optional(v.number()),
          maxPoints: v.number(),
          submittedAt: v.optional(v.number()),
        })
      ),
    }),
    v.null()
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

    // Get enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .unique();

    if (!enrollment) {
      return null;
    }

    // Get user
    const user = await ctx.db
      .query("users" as any)
      .filter((q: any) => q.eq(q.field("_id"), args.userId))
      .first();

    if (!user) {
      return null;
    }

    // Get all lessons in course
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const lessonsData = [];
    for (const module of modules) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", module._id))
        .collect();

      for (const lesson of lessons) {
        const progress = await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", args.userId).eq("lessonId", lesson._id)
          )
          .unique();

        lessonsData.push({
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          moduleTitle: module.title,
          completed: progress?.completed ?? false,
          completedAt: progress?.completedAt,
        });
      }
    }

    // Get quiz attempts
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const quizzesData = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await ctx.db
          .query("quizAttempts")
          .withIndex("by_user_and_quiz", (q) =>
            q.eq("userId", args.userId).eq("quizId", quiz._id)
          )
          .collect();

        let bestScore: number | undefined;
        let latestScore: number | undefined;
        let lastAttemptAt: number | undefined;

        if (attempts.length > 0) {
          bestScore = Math.max(...attempts.map((a) => a.percentage));
          const latestAttempt = attempts.sort((a, b) => b.submittedAt - a.submittedAt)[0];
          latestScore = latestAttempt.percentage;
          lastAttemptAt = latestAttempt.submittedAt;
        }

        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          attemptCount: attempts.length,
          bestScore,
          latestScore,
          lastAttemptAt,
        };
      })
    );

    // Get assignment submissions
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const assignmentsData = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await ctx.db
          .query("assignmentSubmissions")
          .withIndex("by_user_and_assignment", (q) =>
            q.eq("userId", args.userId).eq("assignmentId", assignment._id)
          )
          .collect();

        const latestSubmission = submissions.sort(
          (a, b) => b.createdAt - a.createdAt
        )[0];

        return {
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          submitted: latestSubmission?.status === "submitted" || latestSubmission?.status === "graded",
          graded: latestSubmission?.status === "graded",
          grade: latestSubmission?.grade,
          maxPoints: assignment.maxPoints,
          submittedAt: latestSubmission?.submittedAt,
        };
      })
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        completedAt: enrollment.completedAt,
      },
      lessons: lessonsData,
      quizzes: quizzesData,
      assignments: assignmentsData,
    };
  },
});

/**
 * Get quiz statistics (overall performance analysis)
 * Faculty only
 */
export const getQuizStatistics = facultyQuery({
  args: { quizId: v.id("quizzes") },
  returns: v.object({
    quizId: v.id("quizzes"),
    quizTitle: v.string(),
    totalAttempts: v.number(),
    uniqueStudents: v.number(),
    averageScore: v.optional(v.number()),
    highestScore: v.optional(v.number()),
    lowestScore: v.optional(v.number()),
    passRate: v.optional(v.number()), // percentage of students who passed
    questionStats: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        questionText: v.string(),
        totalAnswers: v.number(),
        correctAnswers: v.number(),
        correctRate: v.number(), // percentage
      })
    ),
  }),
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const course = await ctx.db.get(quiz.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get all attempts
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const uniqueStudents = new Set(attempts.map((a) => a.userId)).size;

    let averageScore: number | undefined;
    let highestScore: number | undefined;
    let lowestScore: number | undefined;
    let passRate: number | undefined;

    if (attempts.length > 0) {
      const scores = attempts.map((a) => a.percentage);
      averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);

      if (quiz.passingScore !== undefined) {
        const passedCount = attempts.filter((a) => a.passed).length;
        passRate = (passedCount / uniqueStudents) * 100;
      }
    }

    // Get question statistics
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const questionStats = questions.map((question) => {
      let totalAnswers = 0;
      let correctAnswers = 0;

      for (const attempt of attempts) {
        const answer = attempt.answers.find(
          (a) => a.questionId === question._id
        );
        if (answer) {
          totalAnswers++;
          if (answer.selectedIndex === question.correctIndex) {
            correctAnswers++;
          }
        }
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        totalAnswers,
        correctAnswers,
        correctRate: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
      };
    });

    return {
      quizId: quiz._id,
      quizTitle: quiz.title,
      totalAttempts: attempts.length,
      uniqueStudents,
      averageScore: averageScore ? Math.round(averageScore * 100) / 100 : undefined,
      highestScore,
      lowestScore,
      passRate: passRate ? Math.round(passRate * 100) / 100 : undefined,
      questionStats,
    };
  },
});

/**
 * Get assignment statistics (overall performance analysis)
 * Faculty only
 */
export const getAssignmentStatistics = facultyQuery({
  args: { assignmentId: v.id("assignments") },
  returns: v.object({
    assignmentId: v.id("assignments"),
    assignmentTitle: v.string(),
    maxPoints: v.number(),
    totalSubmissions: v.number(),
    uniqueStudents: v.number(),
    gradedSubmissions: v.number(),
    averageGrade: v.optional(v.number()),
    highestGrade: v.optional(v.number()),
    lowestGrade: v.optional(v.number()),
    lateSubmissions: v.number(),
    onTimeSubmissions: v.number(),
  }),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get all submissions
    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
      .collect();

    const submittedSubmissions = submissions.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    );

    const uniqueStudents = new Set(submittedSubmissions.map((s) => s.userId)).size;
    const gradedSubmissions = submissions.filter((s) => s.status === "graded");
    const lateSubmissions = submittedSubmissions.filter((s) => s.isLate).length;
    const onTimeSubmissions = submittedSubmissions.length - lateSubmissions;

    let averageGrade: number | undefined;
    let highestGrade: number | undefined;
    let lowestGrade: number | undefined;

    if (gradedSubmissions.length > 0) {
      const grades = gradedSubmissions
        .filter((s) => s.grade !== undefined)
        .map((s) => s.grade!);

      if (grades.length > 0) {
        averageGrade = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        highestGrade = Math.max(...grades);
        lowestGrade = Math.min(...grades);
      }
    }

    return {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      maxPoints: assignment.maxPoints,
      totalSubmissions: submittedSubmissions.length,
      uniqueStudents,
      gradedSubmissions: gradedSubmissions.length,
      averageGrade: averageGrade ? Math.round(averageGrade * 100) / 100 : undefined,
      highestGrade,
      lowestGrade,
      lateSubmissions,
      onTimeSubmissions,
    };
  },
});