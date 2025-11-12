import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

type ContentTable = "modules" | "lessons" | "quizzes" | "assignments";

/**
 * Generic content listing by parent (course or module).
 */
export async function listContentByParent<T extends ContentTable>(
  ctx: QueryCtx,
  table: T,
  parentField: "courseId" | "moduleId",
  parentId: Id<"courses"> | Id<"modules">,
  statusFilter?: string[]
): Promise<Doc<T>[]> {
  const indexName = parentField === "courseId" ? "by_course" : "by_module";
  
  let query = ctx.db
    .query(table)
    .withIndex(indexName as any, (q: any) => q.eq(parentField, parentId));
  
  let results = await query.collect();
  
  if (statusFilter && statusFilter.length > 0) {
    results = results.filter((item) => statusFilter.includes(item.status));
  }
  
  return results.sort((a, b) => a.order - b.order) as Doc<T>[];
}

/**
 * Get single content item by ID with validation.
 */
export async function getContentById<T extends ContentTable>(
  ctx: QueryCtx,
  table: T,
  contentId: Id<T>,
  allowedStatuses?: string[]
): Promise<Doc<T> | null> {
  const content = await ctx.db.get(contentId);
  
  if (!content) {
    return null;
  }
  
  if (allowedStatuses && !allowedStatuses.includes(content.status)) {
    return null;
  }
  
  return content as Doc<T>;
}

/**
 * Enrich module with lesson count.
 */
export async function enrichModuleWithLessonCount(
  ctx: QueryCtx,
  module: Doc<"modules">
): Promise<Doc<"modules"> & { lessonCount: number }> {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_module", (q) => q.eq("moduleId", module._id))
    .collect();
  
  return {
    ...module,
    lessonCount: lessons.length,
  };
}

/**
 * Enrich multiple modules with lesson counts (batched).
 */
export async function enrichModulesWithLessonCounts(
  ctx: QueryCtx,
  modules: Doc<"modules">[]
): Promise<Array<Doc<"modules"> & { lessonCount: number }>> {
  const lessonCounts = await Promise.all(
    modules.map(async (module) => {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", module._id))
        .collect();
      return lessons.length;
    })
  );
  
  return modules.map((module, idx) => ({
    ...module,
    lessonCount: lessonCounts[idx],
  }));
}

/**
 * Get hierarchical content tree: modules → lessons → attachments.
 * Used by shared navigation function.
 */
export async function getContentTree(
  ctx: QueryCtx,
  courseId: Id<"courses">,
  statusFilter?: string[],
  includeAttachments: boolean = false
) {
  const modules = await listContentByParent(ctx, "modules", "courseId", courseId, statusFilter);
  
  const enrichedModules = await Promise.all(
    modules.map(async (module) => {
      const lessons = await listContentByParent(ctx, "lessons", "moduleId", module._id, statusFilter);
      
      let enrichedLessons = lessons;
      
      if (includeAttachments) {
        enrichedLessons = await Promise.all(
          lessons.map(async (lesson) => {
            const attachments = await ctx.db
              .query("lessonAttachments")
              .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
              .collect();
            
            return { ...lesson, attachments };
          })
        );
      }
      
      return { ...module, lessons: enrichedLessons };
    })
  );
  
  return enrichedModules;
}
