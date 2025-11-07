import { v } from "convex/values";
import { learnerMutation, learnerQuery } from "../lib/functions";

/**
 * Start a quiz attempt (Flow B: Start -> Submit)
 * - Enforces availability windows and attempt limits
 */
export const startQuizAttempt = learnerMutation({
  args: { quizId: v.id("quizzes") },
  returns: v.object({
    attemptId: v.id("quizAttempts"),
    attemptNumber: v.number(),
    timeLimitMinutes: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    startedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz || quiz.status !== "published") {
      throw new Error("Quiz not available");
    }

    // Ensure enrollment in course
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", quiz.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("You must be enrolled in this course");
    }

    const now = Date.now();

    // Availability checks
    if (quiz.availableFrom && now < quiz.availableFrom) {
      throw new Error("Quiz is not yet available");
    }
    if (quiz.availableUntil && now > quiz.availableUntil) {
      throw new Error("Quiz is no longer available");
    }

    // Attempt limit checks
    const existingAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_and_quiz", (q) =>
        q.eq("userId", ctx.user.userId).eq("quizId", args.quizId)
      )
      .collect();

    const submittedAttempts = existingAttempts.filter((a) => a.submittedAt !== undefined);
    const attemptCount = submittedAttempts.length;

    if (!quiz.allowMultipleAttempts && attemptCount >= 1) {
      throw new Error("Only one attempt is allowed for this quiz");
    }
    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      throw new Error(`Maximum attempts (${quiz.maxAttempts}) reached`);
    }

    const attemptNumber = attemptCount + 1;

    const attemptId = await ctx.db.insert("quizAttempts", {
      userId: ctx.user.userId,
      quizId: args.quizId,
      attemptNumber,
      answers: [],
      score: 0,
      maxScore: 0,
      percentage: 0,
      passed: undefined,
      startedAt: now,
      submittedAt: 0,
      timeSpentSeconds: 0,
    });

    return {
      attemptId,
      attemptNumber,
      timeLimitMinutes: quiz.timeLimitMinutes ?? undefined,
      dueDate: quiz.dueDate ?? undefined,
      availableUntil: quiz.availableUntil ?? undefined,
      startedAt: now,
    };
  },
});

/**
 * Submit a quiz attempt
 * - Grades answers and computes score, percentage, and pass status
 */
export const submitQuizAttempt = learnerMutation({
  args: {
    attemptId: v.id("quizAttempts"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedIndex: v.number(),
      })
    ),
  },
  returns: v.object({
    score: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    passed: v.optional(v.boolean()),
    submittedAt: v.number(),
    timeSpentSeconds: v.number(),
  }),
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");
    if (attempt.userId !== ctx.user.userId) throw new Error("Not your attempt");
    if (attempt.submittedAt) throw new Error("Attempt already submitted");

    const quiz = await ctx.db.get(attempt.quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", quiz.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("You must be enrolled in this course");
    }

    // Load questions
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();

    const questionMap = new Map(questions.map((q) => [q._id, q]));

    // Grade
    let score = 0;
    let maxScore = 0;

    for (const q of questions) {
      maxScore += q.points;
    }
    for (const ans of args.answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      if (ans.selectedIndex === q.correctIndex) {
        score += q.points;
      }
    }

    const submittedAt = Date.now();
    const timeSpentSeconds = Math.max(0, Math.floor((submittedAt - attempt.startedAt) / 1000));

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed =
      quiz.passingScore !== undefined ? percentage >= quiz.passingScore : undefined;

    await ctx.db.patch(args.attemptId, {
      answers: args.answers,
      score,
      maxScore,
      percentage,
      passed,
      submittedAt,
      timeSpentSeconds,
    });

    return {
      score,
      maxScore,
      percentage,
      passed,
      submittedAt,
      timeSpentSeconds,
    };
  },
});

/**
 * Get my attempts for a quiz
 */
export const getMyQuizAttempts = learnerQuery({
  args: { quizId: v.id("quizzes") },
  returns: v.array(
    v.object({
      _id: v.id("quizAttempts"),
      _creationTime: v.number(),
      attemptNumber: v.number(),
      score: v.number(),
      maxScore: v.number(),
      percentage: v.number(),
      passed: v.optional(v.boolean()),
      startedAt: v.number(),
      submittedAt: v.optional(v.number()),
      timeSpentSeconds: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", quiz.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_and_quiz", (q) =>
        q.eq("userId", ctx.user.userId).eq("quizId", args.quizId)
      )
      .collect();

    return attempts
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))
      .map((a) => ({
        _id: a._id,
        _creationTime: a._creationTime,
        attemptNumber: a.attemptNumber,
        score: a.score,
        maxScore: a.maxScore,
        percentage: a.percentage,
        passed: a.passed,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        timeSpentSeconds: a.timeSpentSeconds,
      }));
  },
});

/**
 * Save assignment draft (idempotent for open draft, otherwise creates a new draft)
 */
export const saveAssignmentDraft = learnerMutation({
  args: {
    assignmentId: v.id("assignments"),
    submissionType: v.union(v.literal("file"), v.literal("url"), v.literal("text")),
    fileId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    textContent: v.optional(v.string()),
  },
  returns: v.id("assignmentSubmissions"),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.status !== "published") {
      throw new Error("Assignment not available");
    }

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", assignment.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("You must be enrolled in this course");
    }

    // Validate submission type
    if (assignment.submissionType !== args.submissionType) {
      throw new Error("Submission type does not match assignment requirement");
    }

    // Validate file constraints when applicable
    if (args.submissionType === "file") {
      if (!args.fileId) throw new Error("File is required");
      const meta = await ctx.db.system.get(args.fileId);
      if (!meta) throw new Error("Uploaded file not found");
      const maxSize = assignment.maxFileSize ?? 50 * 1024 * 1024; // default 50MB
      if (meta.size > maxSize) throw new Error("File exceeds maximum allowed size");
      if (assignment.allowedFileTypes && meta.contentType) {
        if (!assignment.allowedFileTypes.includes(meta.contentType)) {
          throw new Error("File type not allowed");
        }
      }
    }
    if (args.submissionType === "url" && !args.url) {
      throw new Error("URL is required");
    }
    if (args.submissionType === "text" && !args.textContent) {
      throw new Error("Text content is required");
    }

    // Check availability windows
    const now = Date.now();
    if (assignment.availableFrom && now < assignment.availableFrom) {
      throw new Error("Assignment is not yet available");
    }
    if (assignment.availableUntil && now > assignment.availableUntil) {
      throw new Error("Assignment is no longer available");
    }

    // Existing draft?
    const existingDraft = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user_and_assignment", (q) =>
        q.eq("userId", ctx.user.userId).eq("assignmentId", args.assignmentId)
      )
      .collect();

    const openDraft = existingDraft.find((s) => s.status === "draft");

    const baseFields = {
      userId: ctx.user.userId,
      assignmentId: args.assignmentId,
      submissionType: args.submissionType,
      fileId: args.fileId,
      url: args.url,
      textContent: args.textContent,
      status: "draft" as const,
      submittedAt: undefined,
      grade: undefined,
      teacherFeedback: undefined,
      gradedAt: undefined,
      gradedBy: undefined,
      isLate: false,
      createdAt: now,
    };

    if (openDraft) {
      await ctx.db.patch(openDraft._id, {
        ...baseFields,
        createdAt: openDraft.createdAt, // preserve initial createdAt
      });
      return openDraft._id;
    }

    // Compute next attempt number based on submitted/graded attempts
    const attempts = existingDraft.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    ).length;
    const attemptNumber = attempts + 1;

    const submissionId = await ctx.db.insert("assignmentSubmissions", {
      ...baseFields,
      attemptNumber,
    });

    return submissionId;
  },
});

/**
 * Submit assignment from a draft
 */
export const submitAssignment = learnerMutation({
  args: { submissionId: v.id("assignmentSubmissions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.userId !== ctx.user.userId) throw new Error("Not your submission");
    if (submission.status === "submitted" || submission.status === "graded") {
      throw new Error("Submission already submitted");
    }

    const assignment = await ctx.db.get(submission.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.status !== "published") throw new Error("Assignment not available");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", assignment.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("You must be enrolled in this course");
    }

    // Enforce attempts
    const existing = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user_and_assignment", (q) =>
        q.eq("userId", ctx.user.userId).eq("assignmentId", assignment._id)
      )
      .collect();

    const submittedAttempts = existing.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    ).length;

    if (!assignment.allowMultipleAttempts && submittedAttempts >= 1) {
      throw new Error("Only one submission allowed for this assignment");
    }
    if (assignment.maxAttempts && submittedAttempts >= assignment.maxAttempts) {
      throw new Error(`Maximum attempts (${assignment.maxAttempts}) reached`);
    }

    const now = Date.now();

    // Determine late
    const isLate =
      assignment.dueDate !== undefined ? now > assignment.dueDate : false;

    if (isLate && !assignment.allowLateSubmissions) {
      throw new Error("Late submissions are not allowed for this assignment");
    }

    await ctx.db.patch(args.submissionId, {
      status: "submitted",
      submittedAt: now,
      isLate,
    });

    return null;
  },
});

/**
 * Get my submissions for an assignment
 */
export const getMySubmissions = learnerQuery({
  args: { assignmentId: v.id("assignments") },
  returns: v.array(
    v.object({
      _id: v.id("assignmentSubmissions"),
      _creationTime: v.number(),
      attemptNumber: v.number(),
      status: v.string(),
      submittedAt: v.optional(v.number()),
      isLate: v.boolean(),
      grade: v.optional(v.number()),
      teacherFeedback: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    // Ensure enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", ctx.user.userId).eq("courseId", assignment.courseId)
      )
      .first();
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }

    const submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_user_and_assignment", (q) =>
        q.eq("userId", ctx.user.userId).eq("assignmentId", args.assignmentId)
      )
      .collect();

    return submissions
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))
      .map((s) => ({
        _id: s._id,
        _creationTime: s._creationTime,
        attemptNumber: s.attemptNumber,
        status: s.status,
        submittedAt: s.submittedAt,
        isLate: s.isLate,
        grade: s.grade,
        teacherFeedback: s.teacherFeedback,
        createdAt: s.createdAt,
      }));
  },
});