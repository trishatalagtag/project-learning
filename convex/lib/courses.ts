import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Get parent course for a module
 */
export async function getCourseForModule(
  ctx: QueryCtx | MutationCtx,
  moduleId: Id<"modules">
): Promise<Doc<"courses"> | null> {
  const module = await ctx.db.get(moduleId);
  if (!module) return null;
  return await ctx.db.get(module.courseId);
}

/**
 * Get parent course for a lesson
 */
export async function getCourseForLesson(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<"lessons">
): Promise<Doc<"courses"> | null> {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) return null;

  const module = await ctx.db.get(lesson.moduleId);
  if (!module) return null;

  return await ctx.db.get(module.courseId);
}

/**
 * Get parent course for a quiz
 */
export async function getCourseForQuiz(
  ctx: QueryCtx | MutationCtx,
  quizId: Id<"quizzes">
): Promise<Doc<"courses"> | null> {
  const quiz = await ctx.db.get(quizId);
  if (!quiz) return null;
  return await ctx.db.get(quiz.courseId);
}

/**
 * Get parent course for an assignment
 */
export async function getCourseForAssignment(
  ctx: QueryCtx | MutationCtx,
  assignmentId: Id<"assignments">
): Promise<Doc<"courses"> | null> {
  const assignment = await ctx.db.get(assignmentId);
  if (!assignment) return null;
  return await ctx.db.get(assignment.courseId);
}

/**
 * Enrich a single course with related data
 */
export async function enrichCourse(
  ctx: QueryCtx,
  course: Doc<"courses">
): Promise<{
  _id: Id<"courses">;
  _creationTime: number;
  title: string;
  description: string;
  categoryId: Id<"categories">;
  categoryName: string;
  status: string;
  enrollmentCount: number;
  moduleCount: number;
  isEnrollmentOpen: boolean;
  createdAt: number;
  updatedAt: number;
}> {
  const category = await ctx.db.get(course.categoryId);

  const [enrollments, modules] = await Promise.all([
    ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect(),
    ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect(),
  ]);

  return {
    _id: course._id,
    _creationTime: course._creationTime,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId,
    categoryName: category?.name ?? "Unknown",
    status: course.status,
    enrollmentCount: enrollments.length,
    moduleCount: modules.length,
    isEnrollmentOpen: course.isEnrollmentOpen,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

/**
 * Batch enrich courses (avoids N+1 queries)
 */
export async function enrichCourses(
  ctx: QueryCtx,
  courses: Doc<"courses">[]
): Promise<
  Array<{
    _id: Id<"courses">;
    _creationTime: number;
    title: string;
    description: string;
    categoryId: Id<"categories">;
    categoryName: string;
    status: string;
    enrollmentCount: number;
    moduleCount: number;
    isEnrollmentOpen: boolean;
    createdAt: number;
    updatedAt: number;
  }>
> {
  if (courses.length === 0) return [];

  // Batch load all categories
  const categoryIds = [...new Set(courses.map((c) => c.categoryId))];
  const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
  const categoryMap = new Map(
    categories.filter(Boolean).map((c) => [c!._id, c!])
  );

  // Batch load enrollments and modules for all courses
  const courseIds = courses.map((c) => c._id);
  const [allEnrollments, allModules] = await Promise.all([
    Promise.all(
      courseIds.map((id) =>
        ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", id))
          .collect()
      )
    ),
    Promise.all(
      courseIds.map((id) =>
        ctx.db
          .query("modules")
          .withIndex("by_course", (q) => q.eq("courseId", id))
          .collect()
      )
    ),
  ]);

  // Map results
  return courses.map((course, idx) => ({
    _id: course._id,
    _creationTime: course._creationTime,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId,
    categoryName: categoryMap.get(course.categoryId)?.name ?? "Unknown",
    status: course.status,
    enrollmentCount: allEnrollments[idx].length,
    moduleCount: allModules[idx].length,
    isEnrollmentOpen: course.isEnrollmentOpen,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  }));
}

/**
 * Generate unique enrollment code
 */
export async function generateEnrollmentCode(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const existing = await ctx.db
      .query("courses")
      .withIndex("by_enrollment_code", (q) => q.eq("enrollmentCode", code))
      .first();

    if (!existing) {
      return code;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique enrollment code");
}

/**
 * Check if a course is available for enrollment
 */
export function isCourseAvailableForEnrollment(
  course: Doc<"courses">
): boolean {
  return (
    course.status === "published" &&
    course.isEnrollmentOpen
  );
}

/**
 * Get course progress for a user
 */
export async function getCourseProgress(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<{
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}> {
  // Get all modules in course
  const modules = await ctx.db
    .query("modules")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .collect();

  // Get all lessons in those modules
  const allLessons = await Promise.all(
    modules.map((module) =>
      ctx.db
        .query("lessons")
        .withIndex("by_module", (q) => q.eq("moduleId", module._id))
        .collect()
    )
  );

  const lessons = allLessons.flat();
  const totalLessons = lessons.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0, progressPercentage: 0 };
  }

  // Get completed lessons for this user
  const lessonProgress = await Promise.all(
    lessons.map((lesson) =>
      ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", userId).eq("lessonId", lesson._id)
        )
        .filter((q) => q.eq(q.field("completed"), true))
        .first()
    )
  );

  const completedLessons = lessonProgress.filter(Boolean).length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  return {
    totalLessons,
    completedLessons,
    progressPercentage,
  };
}