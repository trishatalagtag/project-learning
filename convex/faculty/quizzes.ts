import { v } from "convex/values";
import { listContentByParent } from "../lib/content_retrieval";
import { facultyMutation, facultyQuery } from "../lib/functions";

/**
 * List quizzes in a course
 * Faculty only - must be assigned teacher
 */
export const listQuizzesByCourse = facultyQuery({
  args: {
    courseId: v.id("courses"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("published")
      )
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("quizzes"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.optional(v.string()),
      linkedToLessonId: v.optional(v.id("lessons")),
      linkedToModuleId: v.optional(v.id("modules")),
      lessonTitle: v.optional(v.string()),
      moduleTitle: v.optional(v.string()),
      status: v.string(),
      questionCount: v.number(),
      allowMultipleAttempts: v.boolean(),
      maxAttempts: v.optional(v.number()),
      timeLimitMinutes: v.optional(v.number()),
      createdAt: v.number(),
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

    // Use shared helper to get quizzes
    let quizzes = await listContentByParent(ctx, "quizzes", "courseId", args.courseId, args.status ? [args.status] : undefined);

    // Enrich with linked content info and question counts
    const enrichedQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        let lessonTitle: string | undefined;
        let moduleTitle: string | undefined;

        if (quiz.linkedToLessonId) {
          const lesson = await ctx.db.get(quiz.linkedToLessonId);
          lessonTitle = lesson?.title;
        }

        if (quiz.linkedToModuleId) {
          const module = await ctx.db.get(quiz.linkedToModuleId);
          moduleTitle = module?.title;
        }

        const questions = await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
          .collect();

        return {
          _id: quiz._id,
          _creationTime: quiz._creationTime,
          courseId: quiz.courseId,
          title: quiz.title,
          description: quiz.description,
          linkedToLessonId: quiz.linkedToLessonId,
          linkedToModuleId: quiz.linkedToModuleId,
          lessonTitle,
          moduleTitle,
          status: quiz.status,
          questionCount: questions.length,
          allowMultipleAttempts: quiz.allowMultipleAttempts,
          maxAttempts: quiz.maxAttempts,
          timeLimitMinutes: quiz.timeLimitMinutes,
          createdAt: quiz.createdAt,
        };
      })
    );

    // Sort by creation date descending
    return enrichedQuizzes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get quiz by ID with all questions
 * Faculty only
 */
export const getQuizById = facultyQuery({
  args: { quizId: v.id("quizzes") },
  returns: v.union(
    v.object({
      _id: v.id("quizzes"),
      _creationTime: v.number(),
      courseId: v.id("courses"),
      courseName: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      instructions: v.optional(v.string()),
      linkedToLessonId: v.optional(v.id("lessons")),
      linkedToModuleId: v.optional(v.id("modules")),
      allowMultipleAttempts: v.boolean(),
      maxAttempts: v.optional(v.number()),
      timeLimitMinutes: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      availableFrom: v.optional(v.number()),
      availableUntil: v.optional(v.number()),
      gradingMethod: v.string(),
      showCorrectAnswers: v.boolean(),
      shuffleQuestions: v.boolean(),
      passingScore: v.optional(v.number()),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      questions: v.array(
        v.object({
          _id: v.id("quizQuestions"),
          order: v.number(),
          questionText: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
          points: v.number(),
          explanation: v.optional(v.string()),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      return null;
    }

    const course = await ctx.db.get(quiz.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get all questions
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Sort by order
    const sortedQuestions = questions.sort((a, b) => a.order - b.order);

    return {
      _id: quiz._id,
      _creationTime: quiz._creationTime,
      courseId: quiz.courseId,
      courseName: course.title,
      title: quiz.title,
      description: quiz.description,
      instructions: quiz.instructions,
      linkedToLessonId: quiz.linkedToLessonId,
      linkedToModuleId: quiz.linkedToModuleId,
      allowMultipleAttempts: quiz.allowMultipleAttempts,
      maxAttempts: quiz.maxAttempts,
      timeLimitMinutes: quiz.timeLimitMinutes,
      dueDate: quiz.dueDate,
      availableFrom: quiz.availableFrom,
      availableUntil: quiz.availableUntil,
      gradingMethod: quiz.gradingMethod,
      showCorrectAnswers: quiz.showCorrectAnswers,
      shuffleQuestions: quiz.shuffleQuestions,
      passingScore: quiz.passingScore,
      status: quiz.status,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: sortedQuestions.map((q) => ({
        _id: q._id,
        order: q.order,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        points: q.points,
        explanation: q.explanation,
      })),
    };
  },
});

/**
 * Create quiz
 * Faculty only - creates in draft, admin can create as approved
 */
export const createQuiz = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    linkedToLessonId: v.optional(v.id("lessons")),
    linkedToModuleId: v.optional(v.id("modules")),
    allowMultipleAttempts: v.optional(v.boolean()),
    maxAttempts: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    gradingMethod: v.optional(
      v.union(v.literal("latest"), v.literal("highest"), v.literal("average"))
    ),
    showCorrectAnswers: v.optional(v.boolean()),
    shuffleQuestions: v.optional(v.boolean()),
    passingScore: v.optional(v.number()),
  },
  returns: v.id("quizzes"),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Validate linked content belongs to course
    if (args.linkedToLessonId) {
      const lesson = await ctx.db.get(args.linkedToLessonId);
      if (!lesson) throw new Error("Linked lesson not found");

      const module = await ctx.db.get(lesson.moduleId);
      if (!module || module.courseId !== args.courseId) {
        throw new Error("Linked lesson does not belong to this course");
      }
    }

    if (args.linkedToModuleId) {
      const module = await ctx.db.get(args.linkedToModuleId);
      if (!module || module.courseId !== args.courseId) {
        throw new Error("Linked module does not belong to this course");
      }
    }

    const now = Date.now();

    // Admin creates as approved, faculty creates as draft
    const initialStatus = ctx.user.role === "ADMIN" ? "approved" : "draft";

    const quizId = await ctx.db.insert("quizzes", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      instructions: args.instructions,
      linkedToLessonId: args.linkedToLessonId,
      linkedToModuleId: args.linkedToModuleId,
      allowMultipleAttempts: args.allowMultipleAttempts ?? true,
      maxAttempts: args.maxAttempts,
      timeLimitMinutes: args.timeLimitMinutes,
      dueDate: args.dueDate,
      availableFrom: args.availableFrom,
      availableUntil: args.availableUntil,
      gradingMethod: args.gradingMethod ?? "latest",
      showCorrectAnswers: args.showCorrectAnswers ?? true,
      shuffleQuestions: args.shuffleQuestions ?? false,
      passingScore: args.passingScore,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.user.userId as string,
    });

    return quizId;
  },
});

/**
 * Update quiz
 * Faculty only
 */
export const updateQuiz = facultyMutation({
  args: {
    quizId: v.id("quizzes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    allowMultipleAttempts: v.optional(v.boolean()),
    maxAttempts: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    gradingMethod: v.optional(
      v.union(v.literal("latest"), v.literal("highest"), v.literal("average"))
    ),
    showCorrectAnswers: v.optional(v.boolean()),
    shuffleQuestions: v.optional(v.boolean()),
    passingScore: v.optional(v.number()),
  },
  returns: v.null(),
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

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.instructions !== undefined) updates.instructions = args.instructions;
    if (args.allowMultipleAttempts !== undefined)
      updates.allowMultipleAttempts = args.allowMultipleAttempts;
    if (args.maxAttempts !== undefined) updates.maxAttempts = args.maxAttempts;
    if (args.timeLimitMinutes !== undefined)
      updates.timeLimitMinutes = args.timeLimitMinutes;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.availableFrom !== undefined) updates.availableFrom = args.availableFrom;
    if (args.availableUntil !== undefined) updates.availableUntil = args.availableUntil;
    if (args.gradingMethod !== undefined) updates.gradingMethod = args.gradingMethod;
    if (args.showCorrectAnswers !== undefined)
      updates.showCorrectAnswers = args.showCorrectAnswers;
    if (args.shuffleQuestions !== undefined)
      updates.shuffleQuestions = args.shuffleQuestions;
    if (args.passingScore !== undefined) updates.passingScore = args.passingScore;

    // If faculty editing approved quiz, set back to draft
    if (
      ctx.user.role === "FACULTY" &&
      quiz.status === "approved" &&
      Object.keys(updates).length > 1
    ) {
      updates.status = "draft";
    }

    await ctx.db.patch(args.quizId, updates);

    return null;
  },
});

/**
 * Add question to quiz
 * Faculty only
 */
export const addQuizQuestion = facultyMutation({
  args: {
    quizId: v.id("quizzes"),
    questionText: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    points: v.optional(v.number()),
    explanation: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.id("quizQuestions"),
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

    // Validate options
    if (args.options.length < 2) {
      throw new Error("Question must have at least 2 options");
    }

    if (args.correctIndex < 0 || args.correctIndex >= args.options.length) {
      throw new Error("Invalid correct index");
    }

    // Get next order number if not provided
    let order = args.order ?? 0;
    if (order === 0) {
      const existingQuestions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
        .collect();
      order = existingQuestions.length;
    }

    const questionId = await ctx.db.insert("quizQuestions", {
      quizId: args.quizId,
      order,
      type: "multiple-choice",
      questionText: args.questionText,
      options: args.options,
      correctIndex: args.correctIndex,
      points: args.points ?? 1,
      explanation: args.explanation,
    });

    return questionId;
  },
});

/**
 * Update quiz question
 * Faculty only
 */
export const updateQuizQuestion = facultyMutation({
  args: {
    questionId: v.id("quizQuestions"),
    questionText: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctIndex: v.optional(v.number()),
    points: v.optional(v.number()),
    explanation: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const quiz = await ctx.db.get(question.quizId);

    if (!quiz) {
      throw new Error("Parent quiz not found");
    }

    const course = await ctx.db.get(quiz.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Build update object
    const updates: Record<string, any> = {};
    if (args.questionText !== undefined) updates.questionText = args.questionText;
    if (args.options !== undefined) {
      if (args.options.length < 2) {
        throw new Error("Question must have at least 2 options");
      }
      updates.options = args.options;
    }
    if (args.correctIndex !== undefined) {
      const options = args.options ?? question.options;
      if (args.correctIndex < 0 || args.correctIndex >= options.length) {
        throw new Error("Invalid correct index");
      }
      updates.correctIndex = args.correctIndex;
    }
    if (args.points !== undefined) updates.points = args.points;
    if (args.explanation !== undefined) updates.explanation = args.explanation;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.questionId, updates);
    }

    return null;
  },
});

/**
 * Delete quiz question
 * Faculty only
 */
export const deleteQuizQuestion = facultyMutation({
  args: { questionId: v.id("quizQuestions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const quiz = await ctx.db.get(question.quizId);

    if (!quiz) {
      throw new Error("Parent quiz not found");
    }

    const course = await ctx.db.get(quiz.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    await ctx.db.delete(args.questionId);

    return null;
  },
});

/**
 * Publish quiz (request approval if faculty, directly publish if admin)
 * Faculty only
 */
export const publishQuiz = facultyMutation({
  args: { quizId: v.id("quizzes") },
  returns: v.null(),
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

    if (quiz.status !== "draft" && quiz.status !== "approved") {
      throw new Error("Only draft or approved quizzes can be published");
    }

    // Validate quiz has at least one question
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    if (questions.length === 0) {
      throw new Error("Quiz must have at least one question before publishing");
    }

    // If faculty, set to pending. If admin, set to published
    const newStatus = ctx.user.role === "ADMIN" ? "published" : "pending";

    await ctx.db.patch(args.quizId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete quiz
 * Faculty only - cannot delete if has attempts
 */
export const deleteQuiz = facultyMutation({
  args: { quizId: v.id("quizzes") },
  returns: v.null(),
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

    // Check for attempts
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    if (attempts.length > 0) {
      throw new Error(
        `Cannot delete quiz with ${attempts.length} attempt(s). Unpublish it instead.`
      );
    }

    // Delete all questions first
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete lesson attachment links (if any)
    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson")
      .collect();

    for (const attachment of attachments) {
      if (attachment.type === "quiz" && attachment.quizId === args.quizId) {
        await ctx.db.delete(attachment._id);
      }
    }

    // Delete the quiz
    await ctx.db.delete(args.quizId);

    return null;
  },
});