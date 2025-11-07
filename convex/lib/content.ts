import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { getUserByUserId, createUserMap } from "./auth";

/**
 * Enrich a single module with related data
 */
export async function enrichModule(
  ctx: QueryCtx,
  module: Doc<"modules">
): Promise<{
  _id: Id<"modules">;
  _creationTime: number;
  courseId: Id<"courses">;
  courseName: string;
  title: string;
  description: string;
  order: number;
  status: string;
  lessonCount: number;
  createdAt: number;
  updatedAt: number;
}> {
  const course = await ctx.db.get(module.courseId);

  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_module", (q) => q.eq("moduleId", module._id))
    .collect();

  return {
    _id: module._id,
    _creationTime: module._creationTime,
    courseId: module.courseId,
    courseName: course?.title ?? "Unknown",
    title: module.title,
    description: module.description,
    order: module.order,
    status: module.status,
    lessonCount: lessons.length,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  };
}

/**
 * Batch enrich modules
 */
export async function enrichModules(
  ctx: QueryCtx,
  modules: Doc<"modules">[]
): Promise<
  Array<{
    _id: Id<"modules">;
    _creationTime: number;
    courseId: Id<"courses">;
    courseName: string;
    title: string;
    description: string;
    order: number;
    status: string;
    lessonCount: number;
    createdAt: number;
    updatedAt: number;
  }>
> {
  if (modules.length === 0) return [];

  // Batch load courses
  const courseIds = [...new Set(modules.map((m) => m.courseId))];
  const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
  const courseMap = new Map(courses.filter(Boolean).map((c) => [c!._id, c!]));

  // Batch load lessons
  const moduleIds = modules.map((m) => m._id);
  const allLessons = await Promise.all(
    moduleIds.map((id) =>
      ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", id))
        .collect()
    )
  );

  return modules.map((module, idx) => ({
    _id: module._id,
    _creationTime: module._creationTime,
    courseId: module.courseId,
    courseName: courseMap.get(module.courseId)?.title ?? "Unknown",
    title: module.title,
    description: module.description,
    order: module.order,
    status: module.status,
    lessonCount: allLessons[idx].length,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  }));
}

/**
 * Enrich a single lesson with related data
 */
export async function enrichLesson(
  ctx: QueryCtx,
  lesson: Doc<"lessons">
): Promise<{
  _id: Id<"lessons">;
  _creationTime: number;
  moduleId: Id<"modules">;
  moduleName: string;
  title: string;
  description: string;
  order: number;
  status: string;
  attachmentCount: number;
  createdAt: number;
  updatedAt: number;
}> {
  const module = await ctx.db.get(lesson.moduleId);

  const attachments = await ctx.db
    .query("lessonAttachments")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
    .collect();

  return {
    _id: lesson._id,
    _creationTime: lesson._creationTime,
    moduleId: lesson.moduleId,
    moduleName: module?.title ?? "Unknown",
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    status: lesson.status,
    attachmentCount: attachments.length,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

/**
 * Batch enrich lessons
 */
export async function enrichLessons(
  ctx: QueryCtx,
  lessons: Doc<"lessons">[]
): Promise<
  Array<{
    _id: Id<"lessons">;
    _creationTime: number;
    moduleId: Id<"modules">;
    moduleName: string;
    title: string;
    description: string;
    order: number;
    status: string;
    attachmentCount: number;
    createdAt: number;
    updatedAt: number;
  }>
> {
  if (lessons.length === 0) return [];

  // Batch load modules
  const moduleIds = [...new Set(lessons.map((l) => l.moduleId))];
  const modules = await Promise.all(moduleIds.map((id) => ctx.db.get(id)));
  const moduleMap = new Map(modules.filter(Boolean).map((m) => [m!._id, m!]));

  // Batch load attachments
  const lessonIds = lessons.map((l) => l._id);
  const allAttachments = await Promise.all(
    lessonIds.map((id) =>
      ctx.db
        .query("lessonAttachments")
        .withIndex("by_lesson", (q) => q.eq("lessonId", id))
        .collect()
    )
  );

  return lessons.map((lesson, idx) => ({
    _id: lesson._id,
    _creationTime: lesson._creationTime,
    moduleId: lesson.moduleId,
    moduleName: moduleMap.get(lesson.moduleId)?.title ?? "Unknown",
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    status: lesson.status,
    attachmentCount: allAttachments[idx].length,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  }));
}

/**
 * Get next order number for modules in a course
 */
export async function getNextModuleOrder(
  ctx: QueryCtx | MutationCtx,
  courseId: Id<"courses">
): Promise<number> {
  const modules = await ctx.db
    .query("modules")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .collect();

  return modules.length;
}

/**
 * Get next order number for lessons in a module
 */
export async function getNextLessonOrder(
  ctx: QueryCtx | MutationCtx,
  moduleId: Id<"modules">
): Promise<number> {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
    .collect();

  return lessons.length;
}

/**
 * Get next order number for attachments in a lesson
 */
export async function getNextAttachmentOrder(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<"lessons">
): Promise<number> {
  const attachments = await ctx.db
    .query("lessonAttachments")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .collect();

  return attachments.length;
}

/**
 * Check if content belongs to a specific course
 */
export async function validateContentBelongsToCourse(
  ctx: QueryCtx | MutationCtx,
  content: { courseId: Id<"courses"> },
  expectedCourseId: Id<"courses">
): Promise<void> {
  if (content.courseId !== expectedCourseId) {
    throw new Error("Content does not belong to the specified course");
  }
}

/**
 * Batch enrich content with creator names
 */
export async function enrichWithCreators<
  T extends { createdBy: string }
>(
  ctx: QueryCtx,
  items: T[]
): Promise<Array<T & { createdByName: string }>> {
  if (items.length === 0) return [];

  const creatorIds = [...new Set(items.map((item) => item.createdBy))];
  const userMap = await createUserMap(ctx, creatorIds);

  return items.map((item) => ({
    ...item,
    createdByName: userMap.get(item.createdBy)?.name ?? "Unknown",
  }));
}