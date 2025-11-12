import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { ContentStatus, validateLessonStatus, validateModuleStatus } from "./status_validation";

type ContentTable = "modules" | "lessons" | "quizzes" | "assignments";
type ContentType = "module" | "lesson" | "quiz" | "assignment";

/**
 * Generic content approval across all content types.
 * Handles hierarchical validation and notifications.
 */
export async function approveContent(
  ctx: MutationCtx,
  table: ContentTable,
  contentId: Id<ContentTable>,
  contentType: ContentType,
  performedBy: string,
  comments?: string
): Promise<void> {
  const content = await ctx.db.get(contentId);
  
  if (!content) {
    throw new Error(`${capitalize(contentType)} not found`);
  }
  
  if (content.status !== "pending") {
    throw new Error(`Only pending ${contentType}s can be approved`);
  }
  
  // Hierarchical validation
  if (contentType === "module") {
    await validateModuleForApproval(ctx, content as Doc<"modules">);
  } else if (contentType === "lesson") {
    await validateLessonForApproval(ctx, content as Doc<"lessons">);
  }
  
  // Update status
  await ctx.db.patch(contentId, {
    status: "approved" as any,
    updatedAt: Date.now(),
  });
  
  // Audit log
  await createAuditLog(ctx, contentType, contentId, "approved", "pending", "approved", performedBy, comments);
  
  // Notifications for quizzes/assignments
  if (contentType === "quiz" || contentType === "assignment") {
    await createNotification(ctx, {
      userId: content.createdBy,
      type: "content_approved",
      title: `${capitalize(contentType)} Approved`,
      message: `Your ${contentType} "${content.title}" has been approved.`,
      contentType,
      contentId: contentId as string,
      actionUrl: `/faculty/${contentType}s/${contentId}`,
      isRead: false,
      createdAt: Date.now(),
    });
  }
}

/**
 * Generic content rejection across all content types.
 */
export async function rejectContent(
  ctx: MutationCtx,
  table: ContentTable,
  contentId: Id<ContentTable>,
  contentType: ContentType,
  performedBy: string,
  reason: string
): Promise<void> {
  const content = await ctx.db.get(contentId);
  
  if (!content) {
    throw new Error(`${capitalize(contentType)} not found`);
  }
  
  if (content.status !== "pending") {
    throw new Error(`Only pending ${contentType}s can be rejected`);
  }
  
  await ctx.db.patch(contentId, {
    status: "changes_requested" as any,
    updatedAt: Date.now(),
  });
  
  await createAuditLog(ctx, contentType, contentId, "rejected", "pending", "changes_requested", performedBy, reason);
  
  await createNotification(ctx, {
    userId: content.createdBy,
    type: "content_rejected",
    title: `${capitalize(contentType)} Needs Changes`,
    message: `Your ${contentType} "${content.title}" needs changes: ${reason}`,
    contentType,
    contentId: contentId as string,
    actionUrl: `/faculty/${contentType}s/${contentId}`,
    isRead: false,
    createdAt: Date.now(),
  });
}

/**
 * Generic content publishing across all content types.
 */
export async function publishContent(
  ctx: MutationCtx,
  table: ContentTable,
  contentId: Id<ContentTable>,
  contentType: ContentType,
  performedBy: string
): Promise<void> {
  const content = await ctx.db.get(contentId);
  
  if (!content) {
    throw new Error(`${capitalize(contentType)} not found`);
  }
  
  if (content.status !== "approved") {
    throw new Error(`Only approved ${contentType}s can be published`);
  }
  
  // Hierarchical validation
  if (contentType === "lesson") {
    await validateLessonForPublishing(ctx, content as Doc<"lessons">);
  }
  
  await ctx.db.patch(contentId, {
    status: "published" as any,
    updatedAt: Date.now(),
  });
  
  await createAuditLog(ctx, contentType, contentId, "published", "approved", "published", performedBy);
}

/**
 * Generic content unpublishing across all content types.
 */
export async function unpublishContent(
  ctx: MutationCtx,
  table: ContentTable,
  contentId: Id<ContentTable>,
  contentType: ContentType,
  performedBy: string
): Promise<void> {
  const content = await ctx.db.get(contentId);
  
  if (!content) {
    throw new Error(`${capitalize(contentType)} not found`);
  }
  
  if (content.status !== "published") {
    throw new Error(`Only published ${contentType}s can be unpublished`);
  }
  
  await ctx.db.patch(contentId, {
    status: "approved" as any,
    updatedAt: Date.now(),
  });
  
  await createAuditLog(ctx, contentType, contentId, "unpublished", "published", "approved", performedBy);
}

/**
 * Bulk approve multiple content items.
 */
export async function bulkApproveContent(
  ctx: MutationCtx,
  items: Array<{ contentType: ContentType; contentId: string }>,
  performedBy: string
): Promise<{ succeeded: number; failed: Array<{ contentType: string; contentId: string; error: string }> }> {
  const results = {
    succeeded: 0,
    failed: [] as Array<{ contentType: string; contentId: string; error: string }>,
  };

  for (const item of items) {
    try {
      const table = `${item.contentType}s` as ContentTable;
      await approveContent(ctx, table, item.contentId as any, item.contentType, performedBy);
      results.succeeded++;
    } catch (error) {
      results.failed.push({
        contentType: item.contentType,
        contentId: item.contentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// ============================================================================
// HELPERS
// ============================================================================

async function validateModuleForApproval(ctx: MutationCtx, module: Doc<"modules">): Promise<void> {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_module", (q) => q.eq("moduleId", module._id))
    .collect();
  
  validateModuleStatus(
    "approved" as ContentStatus,
    lessons, 
    module.title
  );
}

async function validateLessonForApproval(ctx: MutationCtx, lesson: Doc<"lessons">): Promise<void> {
  const module = await ctx.db.get(lesson.moduleId);
  
  if (!module) {
    throw new Error("Parent module not found");
  }
  
  validateLessonStatus("approved" as ContentStatus, module.status as ContentStatus, lesson.title);
}

async function validateLessonForPublishing(ctx: MutationCtx, lesson: Doc<"lessons">): Promise<void> {
  const module = await ctx.db.get(lesson.moduleId);
  
  if (!module) {
    throw new Error("Parent module not found");
  }
  
  if (module.status !== "published" && module.status !== "approved") {
    throw new Error(`Cannot publish lesson. Parent module must be published or approved (currently ${module.status})`);
  }
}

async function createAuditLog(
  ctx: MutationCtx,
  contentType: ContentType,
  contentId: Id<ContentTable>,
  action: string,
  previousStatus: string,
  newStatus: string,
  performedBy: string,
  comments?: string
): Promise<void> {
  await ctx.db.insert("auditLogs", {
    contentType,
    contentId: contentId as string,
    action: action as any,
    performedBy,
    previousStatus,
    newStatus,
    comments,
    timestamp: Date.now(),
  });
}

async function createNotification(
  ctx: MutationCtx,
  notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    contentType?: string;
    contentId?: string;
    actionUrl?: string;
    isRead: boolean;
    createdAt: number;
  }
): Promise<void> {
  await ctx.db.insert("notifications", notification as any);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
