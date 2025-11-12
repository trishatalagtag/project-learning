import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // CATEGORIES 
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    parentId: v.optional(v.id("categories")),
    level: v.number(), // 1, 2, or 3
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_parent", ["parentId"])
    .index("by_level", ["level"]),

  // COURSES 
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    content: v.string(), // Rich text - course introduction
    categoryId: v.id("categories"),
    teacherId: v.optional(v.string()), // Better Auth user ID
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("archived")
    ),
    enrollmentCode: v.optional(v.string()),
    isEnrollmentOpen: v.boolean(),
    // Grading configuration
    gradingConfig: v.object({
      passingScore: v.number(), // e.g., 85
      gradingMethod: v.union(
        v.literal("numerical"), // 0-100 scores
        v.literal("competency"), // Competent/Not Competent
        v.literal("weighted") // Custom weighted components
      ),
      // For weighted method (TESDA-style)
      components: v.optional(
        v.array(
          v.object({
            name: v.string(), // "Written Test", "Demonstration", etc.
            weight: v.number(), // Must sum to 100
          })
        )
      ),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(), // User ID who created
  })
    .index("by_teacher", ["teacherId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_enrollment_code", ["enrollmentCode"])
    .index("by_teacher_and_status", ["teacherId", "status"]),

  // MODULES 
  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    content: v.string(), // Rich text - module overview
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
    .index("by_course", ["courseId"])
    .index("by_status", ["status"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  // LESSONS 
  lessons: defineTable({
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.string(),
    content: v.string(), // Rich text - main lesson article
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
    .index("by_module", ["moduleId"])
    .index("by_status", ["status"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  // LESSON ATTACHMENTS 
  lessonAttachments: defineTable(
    v.union(
      // Video attachment
      v.object({
        type: v.literal("video"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.id("_storage"),
      }),
      // Resource attachment (PDF, DOCX, etc.)
      v.object({
        type: v.literal("resource"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.id("_storage"),
        fileType: v.string(), // "application/pdf", etc.
        fileSize: v.number(),
      }),
      // Step-by-step guide
      v.object({
        type: v.literal("guide"),
        lessonId: v.id("lessons"),
        order: v.number(),
        title: v.string(),
        description: v.optional(v.string()),
        introduction: v.optional(v.string()),
        conclusion: v.optional(v.string()),
      }),
      // Quiz link
      v.object({
        type: v.literal("quiz"),
        lessonId: v.id("lessons"),
        order: v.number(),
        quizId: v.id("quizzes"),
      }),
      // Assignment link
      v.object({
        type: v.literal("assignment"),
        lessonId: v.id("lessons"),
        order: v.number(),
        assignmentId: v.id("assignments"),
      })
    )
  ).index("by_lesson", ["lessonId"]),

  // GUIDE STEPS 
  guideSteps: defineTable({
    guideId: v.id("lessonAttachments"), // Parent guide attachment
    stepNumber: v.number(),
    title: v.string(),
    content: v.string(), // Rich text instructions
    imageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_guide_and_step", ["guideId", "stepNumber"]),

  // QUIZZES 
  quizzes: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    linkedToLessonId: v.optional(v.id("lessons")),
    linkedToModuleId: v.optional(v.id("modules")),
    // Settings
    allowMultipleAttempts: v.boolean(),
    maxAttempts: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    gradingMethod: v.union(
      v.literal("latest"),
      v.literal("highest"),
      v.literal("average")
    ),
    showCorrectAnswers: v.boolean(),
    shuffleQuestions: v.boolean(),
    passingScore: v.optional(v.number()),
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
    .index("by_course", ["courseId"])
    .index("by_lesson", ["linkedToLessonId"])
    .index("by_module", ["linkedToModuleId"])
    .index("by_status", ["status"]),

  // QUIZ QUESTIONS 
  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    order: v.number(),
    type: v.literal("multiple-choice"), // Can extend later
    questionText: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    points: v.number(),
    explanation: v.optional(v.string()),
  }).index("by_quiz", ["quizId"]),

  // ASSIGNMENTS 
  assignments: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    instructions: v.optional(v.string()),
    linkedToLessonId: v.optional(v.id("lessons")),
    linkedToModuleId: v.optional(v.id("modules")),
    // Submission settings
    submissionType: v.union(
      v.literal("file"),
      v.literal("url"),
      v.literal("text")
    ),
    allowedFileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()), // in bytes
    allowMultipleAttempts: v.boolean(),
    maxAttempts: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    allowLateSubmissions: v.boolean(),
    lateSubmissionPenalty: v.optional(v.number()), // percentage
    maxPoints: v.number(),
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
    .index("by_course", ["courseId"])
    .index("by_lesson", ["linkedToLessonId"])
    .index("by_module", ["linkedToModuleId"])
    .index("by_status", ["status"]),

  // ENROLLMENTS 
  enrollments: defineTable({
    userId: v.string(), // Better Auth user ID
    courseId: v.id("courses"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("dropped")
    ),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_status", ["status"])
    .index("by_course_and_status", ["courseId", "status"]),

  // LESSON PROGRESS 
  lessonProgress: defineTable({
    userId: v.string(),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    lastViewedAt: v.number(),
  })
    .index("by_user_and_lesson", ["userId", "lessonId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user", ["userId"]),

  // GUIDE PROGRESS 
  guideProgress: defineTable({
    userId: v.string(),
    guideId: v.id("lessonAttachments"),
    completedSteps: v.array(v.number()), // Array of step numbers
    totalSteps: v.number(),
    lastViewedStep: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user_and_guide", ["userId", "guideId"])
    .index("by_guide", ["guideId"]),

  // QUIZ ATTEMPTS 
  quizAttempts: defineTable({
    userId: v.string(),
    quizId: v.id("quizzes"),
    attemptNumber: v.number(),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedIndex: v.number(),
      })
    ),
    score: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    passed: v.optional(v.boolean()),
    teacherFeedback: v.optional(v.string()), // Optional manual feedback
    startedAt: v.number(),
    submittedAt: v.number(),
    timeSpentSeconds: v.number(),
  })
    .index("by_user_and_quiz", ["userId", "quizId"])
    .index("by_quiz", ["quizId"])
    .index("by_user", ["userId"]),

  // ASSIGNMENT SUBMISSIONS 
  assignmentSubmissions: defineTable({
    userId: v.string(),
    assignmentId: v.id("assignments"),
    attemptNumber: v.number(),
    submissionType: v.union(
      v.literal("file"),
      v.literal("url"),
      v.literal("text")
    ),
    fileId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    textContent: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("graded")
    ),
    submittedAt: v.optional(v.number()),
    grade: v.optional(v.number()),
    teacherFeedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.string()),
    isLate: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_and_assignment", ["userId", "assignmentId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // COURSE PERFORMANCE 
  coursePerformance: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    // Lesson stats
    totalLessons: v.number(),
    completedLessons: v.number(),
    // Quiz stats
    totalQuizzes: v.number(),
    completedQuizzes: v.number(),
    averageQuizScore: v.optional(v.number()),
    // Assignment stats
    totalAssignments: v.number(),
    completedAssignments: v.number(),
    averageAssignmentScore: v.optional(v.number()),
    // Overall
    overallScore: v.optional(v.number()),
    isComplete: v.boolean(),
    lastUpdated: v.number(),
  })
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_course", ["courseId"]),

  // LEARNER FEEDBACK 
  learnerFeedback: defineTable({
    userId: v.string(),
    targetType: v.union(
      v.literal("course"),
      v.literal("lesson"),
      v.literal("assignment"),
      v.literal("quiz")
    ),
    targetId: v.string(), // ID of course/lesson/assignment/quiz
    feedbackType: v.union(
      v.literal("broken_link"),
      v.literal("incorrect_info"),
      v.literal("not_loading"),
      v.literal("suggestion"),
      v.literal("other")
    ),
    message: v.string(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_target", ["targetType", "targetId"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  // ANNOUNCEMENTS 
  announcements: defineTable({
    courseId: v.optional(v.id("courses")), // null = global announcement
    authorId: v.string(),
    title: v.string(),
    content: v.string(),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_author", ["authorId"])
    .index("by_pinned", ["isPinned"]),

  // MIGRATIONS - Track which migrations have been run
  migrations: defineTable({
    migrationId: v.string(),
    description: v.string(),
    runAt: v.number(),
  })
    .index("by_migration_id", ["migrationId"]),

  // AUDIT LOGS - Track all content approval actions
  auditLogs: defineTable({
    contentType: v.union(
      v.literal("course"),
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("submitted_for_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested"),
      v.literal("published"),
      v.literal("unpublished")
    ),
    performedBy: v.string(),
    performedByName: v.optional(v.string()),
    previousStatus: v.optional(v.string()),
    newStatus: v.optional(v.string()),
    comments: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_content", ["contentType", "contentId"])
    .index("by_content_and_action", ["contentType", "contentId", "action"])
    .index("by_user", ["performedBy"])
    .index("by_timestamp", ["timestamp"]),

  // NOTIFICATIONS - Notifications for approval/rejection events
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("content_approved"),
      v.literal("content_rejected"),
      v.literal("content_published"),
      v.literal("pending_review")
    ),
    title: v.string(),
    message: v.string(),
    contentType: v.optional(v.string()),
    contentId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_timestamp", ["createdAt"]),
});