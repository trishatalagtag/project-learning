import { v } from "convex/values";
import { getUserByUserId, getUsersByUserIds } from "../lib/auth";
import { facultyMutation, facultyQuery } from "../lib/functions";
import { getPaginationDefaults, listArgs } from "../lib/validators";

/**
 * List submissions for an assignment
 * Faculty only - with filtering and pagination
 */
export const listSubmissionsForAssignment = facultyQuery({
  args: {
    assignmentId: v.id("assignments"),
    ...listArgs,
    status: v.optional(
      v.union(v.literal("draft"), v.literal("submitted"), v.literal("graded"))
    ),
    userId: v.optional(v.string()), // Filter by specific learner
  },
  returns: v.object({
    submissions: v.array(
      v.object({
        _id: v.id("assignmentSubmissions"),
        _creationTime: v.number(),
        userId: v.string(),
        userName: v.string(),
        userEmail: v.string(),
        assignmentId: v.id("assignments"),
        attemptNumber: v.number(),
        submissionType: v.string(),
        status: v.string(),
        submittedAt: v.optional(v.number()),
        grade: v.optional(v.number()),
        teacherFeedback: v.optional(v.string()),
        gradedAt: v.optional(v.number()),
        gradedBy: v.optional(v.string()),
        isLate: v.boolean(),
        createdAt: v.number(),
      })
    ),
    total: v.number(),
    hasMore: v.boolean(),
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

    const { limit, offset } = getPaginationDefaults(args);

    // Get all submissions for this assignment
    let submissions = await ctx.db
      .query("assignmentSubmissions")
      .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
      .collect();

    // Apply filters
    if (args.status) {
      submissions = submissions.filter((s) => s.status === args.status);
    }

    if (args.userId) {
      submissions = submissions.filter((s) => s.userId === args.userId);
    }

    if (args.search) {
      // Filter by user name/email (batch fetch Better Auth users)
      const searchLower = args.search.toLowerCase();
      const uniqueUserIds = Array.from(new Set(submissions.map((s) => s.userId)));
      const users = await getUsersByUserIds(ctx, uniqueUserIds);
      const userMap = new Map(users.filter(Boolean).map((u: any) => [u.userId, u]));
      submissions = submissions.filter((s) => {
        const u = userMap.get(s.userId);
        if (!u) return false;
        return (
          (u.name ?? "").toLowerCase().includes(searchLower) ||
          (u.email ?? "").toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by submission time (most recent first)
    const sortedSubmissions = submissions.sort((a, b) => {
      const aTime = a.submittedAt ?? a.createdAt;
      const bTime = b.submittedAt ?? b.createdAt;
      return bTime - aTime;
    });

    // Apply pagination
    const paginatedSubmissions = sortedSubmissions.slice(offset, offset + limit);

    // Enrich with user info (batched)
    const pageUserIds = Array.from(new Set(paginatedSubmissions.map((s) => s.userId)));
    const pageUsers = await getUsersByUserIds(ctx, pageUserIds);
    const pageUserMap = new Map(pageUsers.filter(Boolean).map((u: any) => [u.userId, u]));

    const enrichedSubmissions = paginatedSubmissions.map((submission) => {
      const user = pageUserMap.get(submission.userId);
      return {
        _id: submission._id,
        _creationTime: submission._creationTime,
        userId: submission.userId,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "Unknown",
        assignmentId: submission.assignmentId,
        attemptNumber: submission.attemptNumber,
        submissionType: submission.submissionType,
        status: submission.status,
        submittedAt: submission.submittedAt,
        grade: submission.grade,
        teacherFeedback: submission.teacherFeedback,
        gradedAt: submission.gradedAt,
        gradedBy: submission.gradedBy,
        isLate: submission.isLate,
        createdAt: submission.createdAt,
      };
    });

    return {
      submissions: enrichedSubmissions,
      total: sortedSubmissions.length,
      hasMore: offset + limit < sortedSubmissions.length,
    };
  },
});

/**
 * Get single submission by ID (with full details)
 * Faculty only
 */
export const getSubmissionById = facultyQuery({
  args: { submissionId: v.id("assignmentSubmissions") },
  returns: v.union(
    v.object({
      _id: v.id("assignmentSubmissions"),
      _creationTime: v.number(),
      userId: v.string(),
      userName: v.string(),
      userEmail: v.string(),
      assignmentId: v.id("assignments"),
      assignmentTitle: v.string(),
      assignmentMaxPoints: v.number(),
      courseId: v.id("courses"),
      courseName: v.string(),
      attemptNumber: v.number(),
      submissionType: v.string(),
      fileId: v.optional(v.id("_storage")),
      fileUrl: v.optional(v.string()),
      url: v.optional(v.string()),
      textContent: v.optional(v.string()),
      status: v.string(),
      submittedAt: v.optional(v.number()),
      grade: v.optional(v.number()),
      teacherFeedback: v.optional(v.string()),
      gradedAt: v.optional(v.number()),
      gradedBy: v.optional(v.string()),
      gradedByName: v.optional(v.string()),
      isLate: v.boolean(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      return null;
    }

    const assignment = await ctx.db.get(submission.assignmentId);

    if (!assignment) {
      throw new Error("Parent assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Get user info (Better Auth)
    const user = await getUserByUserId(ctx, submission.userId);

    // Get grader info if graded
    let gradedByName: string | undefined;
    if (submission.gradedBy) {
      const grader = await getUserByUserId(
        ctx,
        submission.gradedBy
      );
      gradedByName = grader?.name;
    }

    // Get file URL if file submission
    let fileUrl: string | undefined;
    if (submission.fileId) {
      fileUrl = (await ctx.storage.getUrl(submission.fileId)) ?? undefined;
    }

    return {
      _id: submission._id,
      _creationTime: submission._creationTime,
      userId: submission.userId,
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "Unknown",
      assignmentId: submission.assignmentId,
      assignmentTitle: assignment.title,
      assignmentMaxPoints: assignment.maxPoints,
      courseId: assignment.courseId,
      courseName: course.title,
      attemptNumber: submission.attemptNumber,
      submissionType: submission.submissionType,
      fileId: submission.fileId,
      fileUrl,
      url: submission.url,
      textContent: submission.textContent,
      status: submission.status,
      submittedAt: submission.submittedAt,
      grade: submission.grade,
      teacherFeedback: submission.teacherFeedback,
      gradedAt: submission.gradedAt,
      gradedBy: submission.gradedBy,
      gradedByName,
      isLate: submission.isLate,
      createdAt: submission.createdAt,
    };
  },
});

/**
 * Grade submission
 * Faculty only - add score and feedback
 */
export const gradeSubmission = facultyMutation({
  args: {
    submissionId: v.id("assignmentSubmissions"),
    grade: v.number(),
    teacherFeedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    const assignment = await ctx.db.get(submission.assignmentId);

    if (!assignment) {
      throw new Error("Parent assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Validate submission is submitted (not draft)
    if (submission.status !== "submitted" && submission.status !== "graded") {
      throw new Error("Can only grade submitted submissions");
    }

    // Validate grade is within range
    if (args.grade < 0 || args.grade > assignment.maxPoints) {
      throw new Error(
        `Grade must be between 0 and ${assignment.maxPoints} (max points for this assignment)`
      );
    }

    await ctx.db.patch(args.submissionId, {
      grade: args.grade,
      teacherFeedback: args.teacherFeedback,
      status: "graded",
      gradedAt: Date.now(),
      gradedBy: ctx.user.userId ?? undefined,
    });

    // TODO: Update course performance stats for this learner
    // This would recalculate their overall assignment average, etc.

    return null;
  },
});

/**
 * Update grade (modify existing grade)
 * Faculty only
 */
export const updateGrade = facultyMutation({
  args: {
    submissionId: v.id("assignmentSubmissions"),
    grade: v.optional(v.number()),
    teacherFeedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    const assignment = await ctx.db.get(submission.assignmentId);

    if (!assignment) {
      throw new Error("Parent assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);

    if (!course) {
      throw new Error("Parent course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    // Validate submission is graded
    if (submission.status !== "graded") {
      throw new Error("Can only update grades on graded submissions");
    }

    // Build update object
    const updates: Record<string, any> = {};
    if (args.grade !== undefined) {
      // Validate grade is within range
      if (args.grade < 0 || args.grade > assignment.maxPoints) {
        throw new Error(
          `Grade must be between 0 and ${assignment.maxPoints} (max points for this assignment)`
        );
      }
      updates.grade = args.grade;
    }
    if (args.teacherFeedback !== undefined) {
      updates.teacherFeedback = args.teacherFeedback;
    }

    if (Object.keys(updates).length > 0) {
      updates.gradedAt = Date.now();
      updates.gradedBy = ctx.user.userId;
      await ctx.db.patch(args.submissionId, updates);
    }

    return null;
  },
});