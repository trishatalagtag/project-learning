import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { createUserMap } from "../lib/auth";
import {
  approveContent,
  bulkApproveContent as bulkApprove,
  publishContent,
  rejectContent as rejectContentLib,
  unpublishContent
} from "../lib/content_operations";
import { adminMutation, adminQuery } from "../lib/functions";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper: Create audit log entry
 */
async function createAuditLog(
  ctx: any,
  contentType: "course" | "module" | "lesson" | "quiz" | "assignment",
  contentId: string,
  action: "created" | "submitted_for_review" | "approved" | "rejected" | "changes_requested" | "published" | "unpublished",
  previousStatus?: string,
  newStatus?: string,
  comments?: string
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return;

  await ctx.db.insert("auditLogs", {
    contentType,
    contentId,
    action,
    performedBy: identity.subject,
    performedByName: identity.name,
    previousStatus,
    newStatus,
    comments,
    timestamp: Date.now(),
  });
}

/**
 * Helper: Create notification for user
 */
async function createNotification(
  ctx: any,
  userId: string,
  type: "content_approved" | "content_rejected" | "content_published" | "pending_review",
  title: string,
  message: string,
  contentType?: string,
  contentId?: string,
  actionUrl?: string
) {
  await ctx.db.insert("notifications", {
    userId,
    type,
    title,
    message,
    contentType,
    contentId,
    actionUrl,
    isRead: false,
    createdAt: Date.now(),
  });
}

// ============================================================================
// APPROVAL FUNCTIONS (using new lib helpers)
// ============================================================================

export const approveModule = adminMutation({
  args: { moduleId: v.id("modules") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await approveContent(ctx, "modules", args.moduleId, "module", user!.subject);
    return null;
  },
});

export const approveLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await approveContent(ctx, "lessons", args.lessonId, "lesson", user!.subject);
    return null;
  },
});

export const approveQuiz = adminMutation({
  args: { 
    quizId: v.id("quizzes"),
    comments: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await approveContent(ctx, "quizzes", args.quizId, "quiz", user!.subject, args.comments);
    return null;
  },
});

export const approveAssignment = adminMutation({
  args: { 
    assignmentId: v.id("assignments"),
    comments: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await approveContent(ctx, "assignments", args.assignmentId, "assignment", user!.subject, args.comments);
    return null;
  },
});

// ============================================================================
// BULK OPERATIONS (using new lib helpers)
// ============================================================================

export const bulkApproveContent = adminMutation({
  args: {
    items: v.array(
      v.object({
        contentType: v.union(
          v.literal("module"),
          v.literal("lesson"),
          v.literal("quiz"),
          v.literal("assignment")
        ),
        contentId: v.string(),
      })
    ),
  },
  returns: v.object({
    succeeded: v.number(),
    failed: v.array(
      v.object({
        contentType: v.string(),
        contentId: v.string(),
        error: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    return await bulkApprove(ctx, args.items as any, user!.subject);
  },
});

// ============================================================================
// REJECTION FUNCTIONS (kept for backward compatibility)
// ============================================================================

export const rejectContent = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const table = `${args.contentType}s` as "modules" | "lessons" | "quizzes" | "assignments";
    await rejectContentLib(ctx, table, args.contentId as any, args.contentType, user!.subject, args.reason);
    return null;
  },
});

export const requestChanges = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const table = `${args.contentType}s` as "modules" | "lessons" | "quizzes" | "assignments";
    await rejectContentLib(ctx, table, args.contentId as any, args.contentType, user!.subject, args.reason);
    return null;
  },
});

// ============================================================================
// PUBLISHING FUNCTIONS (using new lib helpers)
// ============================================================================

export const publishLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await publishContent(ctx, "lessons", args.lessonId, "lesson", user!.subject);
    return null;
  },
});

export const unpublishLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    await unpublishContent(ctx, "lessons", args.lessonId, "lesson", user!.subject);
    return null;
  },
});

// ============================================================================
// LISTING FUNCTIONS (for admin dashboard)
// ============================================================================

export const getAllPendingContent = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    modules: v.array(v.any()),
    lessons: v.array(v.any()),
    quizzes: v.array(v.any()),
    assignments: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const [modules, lessons, quizzes, assignments] = await Promise.all([
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
    ]);

    // Enrich with creator names
    const allCreatorIds = [
      ...modules.map(m => m.createdBy),
      ...lessons.map(l => l.createdBy),
      ...quizzes.map(q => q.createdBy),
      ...assignments.map(a => a.createdBy),
    ];
    const userMap = await createUserMap(ctx, allCreatorIds);

    return {
      modules: modules.map(m => ({
        ...m,
        createdByName: userMap.get(m.createdBy)?.name ?? "Unknown",
      })),
      lessons: lessons.map(l => ({
        ...l,
        createdByName: userMap.get(l.createdBy)?.name ?? "Unknown",
      })),
      quizzes: quizzes.map(q => ({
        ...q,
        createdByName: userMap.get(q.createdBy)?.name ?? "Unknown",
      })),
      assignments: assignments.map(a => ({
        ...a,
        createdByName: userMap.get(a.createdBy)?.name ?? "Unknown",
      })),
    };
  },
});

export const getAllContentCounts = adminQuery({
  args: {},
  returns: v.object({
    pending: v.object({
      modules: v.number(),
      lessons: v.number(),
      quizzes: v.number(),
      assignments: v.number(),
      total: v.number(),
    }),
    approved: v.object({
      modules: v.number(),
      lessons: v.number(),
      quizzes: v.number(),
      assignments: v.number(),
      total: v.number(),
    }),
    published: v.object({
      modules: v.number(),
      lessons: v.number(),
      quizzes: v.number(),
      assignments: v.number(),
      total: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const [
      pendingModules,
      pendingLessons,
      pendingQuizzes,
      pendingAssignments,
      approvedModules,
      approvedLessons,
      approvedQuizzes,
      approvedAssignments,
      publishedModules,
      publishedLessons,
      publishedQuizzes,
      publishedAssignments,
    ] = await Promise.all([
      // Pending
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      // Approved
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      // Published
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "published")).collect(),
    ]);

    const pendingCount = {
      modules: pendingModules.length,
      lessons: pendingLessons.length,
      quizzes: pendingQuizzes.length,
      assignments: pendingAssignments.length,
      total: pendingModules.length + pendingLessons.length + pendingQuizzes.length + pendingAssignments.length,
    };

    const approvedCount = {
      modules: approvedModules.length,
      lessons: approvedLessons.length,
      quizzes: approvedQuizzes.length,
      assignments: approvedAssignments.length,
      total: approvedModules.length + approvedLessons.length + approvedQuizzes.length + approvedAssignments.length,
    };

    const publishedCount = {
      modules: publishedModules.length,
      lessons: publishedLessons.length,
      quizzes: publishedQuizzes.length,
      assignments: publishedAssignments.length,
      total: publishedModules.length + publishedLessons.length + publishedQuizzes.length + publishedAssignments.length,
    };

    return {
      pending: pendingCount,
      approved: approvedCount,
      published: publishedCount,
    };
  },
});

// ============================================================================
// STATUS UPDATE FUNCTION (unified interface for frontend)
// ============================================================================

export const updateContentStatus = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    action: v.union(
      v.literal("approve"),
      v.literal("reject"),
      v.literal("publish"),
      v.literal("unpublish")
    ),
    reason: v.optional(v.string()),
    comments: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const table = `${args.contentType}s` as "modules" | "lessons" | "quizzes" | "assignments";
    const contentId = args.contentId as any;

    switch (args.action) {
      case "approve":
        await approveContent(ctx, table, contentId, args.contentType, user!.subject, args.comments);
        break;
      case "reject":
        if (!args.reason) {
          throw new Error("Reason is required for rejection");
        }
        await rejectContentLib(ctx, table, contentId, args.contentType, user!.subject, args.reason);
        break;
      case "publish":
        await publishContent(ctx, table, contentId, args.contentType, user!.subject);
        break;
      case "unpublish":
        await unpublishContent(ctx, table, contentId, args.contentType, user!.subject);
        break;
    }

    return null;
  },
});

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * List content paginated by type and status
 * Kept for backward compatibility with existing frontend code
 */
export const listContentPaginated = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("changes_requested")
    ),
    contentType: v.union(
      v.literal("course"),
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
  },
  returns: v.object({
    page: v.array(v.any()),
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    let query;
    
    switch (args.contentType) {
      case "module":
        query = ctx.db.query("modules");
        break;
      case "lesson":
        query = ctx.db.query("lessons");
        break;
      case "quiz":
        query = ctx.db.query("quizzes");
        break;
      case "assignment":
        query = ctx.db.query("assignments");
        break;
      case "course":
        query = ctx.db.query("courses");
        break;
      default:
        throw new Error(`Unknown content type: ${args.contentType}`);
    }

    const results = await query
      .filter((q) => q.eq(q.field("status"), args.status))
      .paginate(args.paginationOpts);

    // Enrich with creator names
    const creatorIds = results.page.map((item: any) => item.createdBy);
    const userMap = await createUserMap(ctx, creatorIds);

    const enrichedPage = results.page.map((item: any) => ({
      ...item,
      type: args.contentType,
      createdByName: userMap.get(item.createdBy)?.name ?? "Unknown",
    }));

    return {
      page: enrichedPage,
      continueCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});

export const listApprovedContent = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    modules: v.array(v.any()),
    lessons: v.array(v.any()),
    quizzes: v.array(v.any()),
    assignments: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const [modules, lessons, quizzes, assignments] = await Promise.all([
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "approved")).take(limit),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "approved")).take(limit),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "approved")).take(limit),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "approved")).take(limit),
    ]);

    const allCreatorIds = [
      ...modules.map(m => m.createdBy),
      ...lessons.map(l => l.createdBy),
      ...quizzes.map(q => q.createdBy),
      ...assignments.map(a => a.createdBy),
    ];
    const userMap = await createUserMap(ctx, allCreatorIds);

    return {
      modules: modules.map(m => ({
        ...m,
        createdByName: userMap.get(m.createdBy)?.name ?? "Unknown",
      })),
      lessons: lessons.map(l => ({
        ...l,
        createdByName: userMap.get(l.createdBy)?.name ?? "Unknown",
      })),
      quizzes: quizzes.map(q => ({
        ...q,
        createdByName: userMap.get(q.createdBy)?.name ?? "Unknown",
      })),
      assignments: assignments.map(a => ({
        ...a,
        createdByName: userMap.get(a.createdBy)?.name ?? "Unknown",
      })),
    };
  },
});

export const listRejectedContent = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    modules: v.array(v.any()),
    lessons: v.array(v.any()),
    quizzes: v.array(v.any()),
    assignments: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const [modules, lessons, quizzes, assignments] = await Promise.all([
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "changes_requested")).take(limit),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "changes_requested")).take(limit),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "changes_requested")).take(limit),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "changes_requested")).take(limit),
    ]);

    const allCreatorIds = [
      ...modules.map(m => m.createdBy),
      ...lessons.map(l => l.createdBy),
      ...quizzes.map(q => q.createdBy),
      ...assignments.map(a => a.createdBy),
    ];
    const userMap = await createUserMap(ctx, allCreatorIds);

    return {
      modules: modules.map(m => ({
        ...m,
        createdByName: userMap.get(m.createdBy)?.name ?? "Unknown",
      })),
      lessons: lessons.map(l => ({
        ...l,
        createdByName: userMap.get(l.createdBy)?.name ?? "Unknown",
      })),
      quizzes: quizzes.map(q => ({
        ...q,
        createdByName: userMap.get(q.createdBy)?.name ?? "Unknown",
      })),
      assignments: assignments.map(a => ({
        ...a,
        createdByName: userMap.get(a.createdBy)?.name ?? "Unknown",
      })),
    };
  },
});

export const listPendingContent = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    modules: v.array(v.any()),
    lessons: v.array(v.any()),
    quizzes: v.array(v.any()),
    assignments: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const [modules, lessons, quizzes, assignments] = await Promise.all([
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "pending")).take(limit),
    ]);

    const allCreatorIds = [
      ...modules.map(m => m.createdBy),
      ...lessons.map(l => l.createdBy),
      ...quizzes.map(q => q.createdBy),
      ...assignments.map(a => a.createdBy),
    ];
    const userMap = await createUserMap(ctx, allCreatorIds);

    return {
      modules: modules.map(m => ({
        ...m,
        createdByName: userMap.get(m.createdBy)?.name ?? "Unknown",
      })),
      lessons: lessons.map(l => ({
        ...l,
        createdByName: userMap.get(l.createdBy)?.name ?? "Unknown",
      })),
      quizzes: quizzes.map(q => ({
        ...q,
        createdByName: userMap.get(q.createdBy)?.name ?? "Unknown",
      })),
      assignments: assignments.map(a => ({
        ...a,
        createdByName: userMap.get(a.createdBy)?.name ?? "Unknown",
      })),
    };
  },
});

export const getContentCounts = adminQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    // Use same logic as getAllContentCounts - inline it
    const [
      pendingModules,
      pendingLessons,
      pendingQuizzes,
      pendingAssignments,
      approvedModules,
      approvedLessons,
      approvedQuizzes,
      approvedAssignments,
      publishedModules,
      publishedLessons,
      publishedQuizzes,
      publishedAssignments,
    ] = await Promise.all([
      // Pending
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "pending")).collect(),
      // Approved
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "approved")).collect(),
      // Published
      ctx.db.query("modules").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("lessons").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("quizzes").filter((q) => q.eq(q.field("status"), "published")).collect(),
      ctx.db.query("assignments").filter((q) => q.eq(q.field("status"), "published")).collect(),
    ]);

    const pendingCount = {
      modules: pendingModules.length,
      lessons: pendingLessons.length,
      quizzes: pendingQuizzes.length,
      assignments: pendingAssignments.length,
      total: pendingModules.length + pendingLessons.length + pendingQuizzes.length + pendingAssignments.length,
    };

    const approvedCount = {
      modules: approvedModules.length,
      lessons: approvedLessons.length,
      quizzes: approvedQuizzes.length,
      assignments: approvedAssignments.length,
      total: approvedModules.length + approvedLessons.length + approvedQuizzes.length + approvedAssignments.length,
    };

    const publishedCount = {
      modules: publishedModules.length,
      lessons: publishedLessons.length,
      quizzes: publishedQuizzes.length,
      assignments: publishedAssignments.length,
      total: publishedModules.length + publishedLessons.length + publishedQuizzes.length + publishedAssignments.length,
    };

    return {
      pending: pendingCount,
      approved: approvedCount,
      published: publishedCount,
    };
  },
});

// ============================================================================
// AUDIT & HISTORY FUNCTIONS
// ============================================================================

export const getContentApprovalHistory = adminQuery({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment"),
      v.literal("course")
    ),
    contentId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const auditLogs = await ctx.db
      .query("auditLogs")
      .filter((q) =>
        q.and(
          q.eq(q.field("contentType"), args.contentType),
          q.eq(q.field("contentId"), args.contentId)
        )
      )
      .order("desc")
      .collect();

    return auditLogs;
  },
});

// ============================================================================
// FACULTY RESUBMIT FUNCTION (kept in admin namespace for now)
// ============================================================================

export const resubmitContent = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let content: any;
    
    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as any);
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as any);
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as any);
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as any);
        break;
    }
    
    if (!content) {
      throw new Error(`${args.contentType} not found`);
    }

    if (content.status !== "changes_requested" && content.status !== "draft") {
      throw new Error(`Only content with changes_requested or draft status can be resubmitted`);
    }

    await ctx.db.patch(args.contentId as any, {
      status: "pending" as any,
      updatedAt: Date.now(),
    });

    await createAuditLog(
      ctx,
      args.contentType,
      args.contentId,
      "submitted_for_review",
      content.status,
      "pending"
    );

    return null;
  },
});
