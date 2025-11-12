import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { getUserByUserId } from "./auth";
import { getEnrollmentCount } from "./enrollment";

type EnrichmentLevel = "public" | "faculty" | "admin";

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
 * Enrich a single course with related data based on visibility level.
 */
export async function enrichCourse(
  ctx: QueryCtx,
  course: Doc<"courses">,
  level: EnrichmentLevel = "public"
) {
  const category = course.categoryId ? await ctx.db.get(course.categoryId) : null;

  const teacher = course.teacherId
    ? await getUserByUserId(ctx, course.teacherId)
    : null;

  const coverImageUrl = course.coverImageId
    ? await ctx.storage.getUrl(course.coverImageId)
    : null;

  const baseEnrichment = {
    ...course,
    categoryName: category?.name ?? "Uncategorized",
    teacherName: teacher?.name,
    coverImageUrl,
  };

  if (level === "public") {
    return {
      _id: baseEnrichment._id,
      _creationTime: baseEnrichment._creationTime,
      title: baseEnrichment.title,
      description: baseEnrichment.description,
      content: baseEnrichment.content,
      categoryId: baseEnrichment.categoryId,
      categoryName: baseEnrichment.categoryName,
      teacherId: baseEnrichment.teacherId,
      teacherName: baseEnrichment.teacherName,
      coverImageUrl: baseEnrichment.coverImageUrl,
      status: baseEnrichment.status,
      isEnrollmentOpen: baseEnrichment.isEnrollmentOpen,
      createdAt: baseEnrichment.createdAt,
      updatedAt: baseEnrichment.updatedAt,
    };
  }

  const [enrollmentCount, moduleCount] = await Promise.all([
    getEnrollmentCount(ctx, course._id, "active"),
    ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect()
      .then((modules) => modules.length),
  ]);

  const facultyEnrichment = {
    ...baseEnrichment,
    enrollmentCount,
    moduleCount,
  };

  // Faculty level
  if (level === "faculty") {
    return facultyEnrichment;
  }

  // Admin level: add creator information
  const creator = course.createdBy
    ? await getUserByUserId(ctx, course.createdBy)
    : null;

  return {
    ...facultyEnrichment,
    createdByName: creator?.name,
  };
}

/**
 * Batch enrich courses efficiently (batched queries).
 */
export async function enrichCourses(
  ctx: QueryCtx,
  courses: Doc<"courses">[],
  level: EnrichmentLevel = "public"
) {
  if (courses.length === 0) return [];

  // Batch fetch categories
  const categoryIds = [...new Set(courses.map((c) => c.categoryId))];
  const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
  const categoryMap = new Map(
    categories.filter((c) => c !== null).map((c) => [c!._id, c!])
  );

  // Batch fetch teachers
  const teacherIds = [
    ...new Set(courses.map((c) => c.teacherId).filter((id) => id !== undefined)),
  ];
  const teachers = await Promise.all(
    teacherIds.map((userId) => getUserByUserId(ctx, userId!))
  );
  const teacherMap = new Map(
    teachers.filter((t) => t !== null).map((t) => [t!._id, t!])
  );

  // Batch fetch cover images
  const coverImageIds = courses
    .map((c) => c.coverImageId)
    .filter((id) => id !== undefined) as Id<"_storage">[];
  const coverImageUrls = await Promise.all(
    coverImageIds.map((id) => ctx.storage.getUrl(id))
  );
  const coverImageMap = new Map(
    coverImageIds.map((id, idx) => [id, coverImageUrls[idx]])
  );

  // For faculty/admin: get counts
  let enrollmentCounts: Map<Id<"courses">, number> | undefined;
  let moduleCounts: Map<Id<"courses">, number> | undefined;

  if (level === "faculty" || level === "admin") {
    const courseIds = courses.map((c) => c._id);

    const [allEnrollments, allModules] = await Promise.all([
      Promise.all(
        courseIds.map((courseId) => getEnrollmentCount(ctx, courseId, "active"))
      ),
      Promise.all(
        courseIds.map((courseId) =>
          ctx.db
            .query("modules")
            .withIndex("by_course", (q) => q.eq("courseId", courseId))
            .collect()
        )
      ),
    ]);

    enrollmentCounts = new Map(courseIds.map((id, idx) => [id, allEnrollments[idx]]));
    moduleCounts = new Map(courseIds.map((id, idx) => [id, allModules[idx].length]));
  }

  // For admin: get creators
  let creatorMap: Map<string, any> | undefined;
  if (level === "admin") {
    const creatorIds = [...new Set(courses.map((c) => c.createdBy))];
    const creators = await Promise.all(
      creatorIds.map((userId) => getUserByUserId(ctx, userId))
    );
    creatorMap = new Map(
      creators.filter((c) => c !== null).map((c) => [c!._id, c!])
    );
  }

  // Enrich each course
  return courses.map((course) => {
    const category = categoryMap.get(course.categoryId);
    const teacher = course.teacherId ? teacherMap.get(course.teacherId) : undefined;
    const coverImageUrl = course.coverImageId
      ? coverImageMap.get(course.coverImageId) ?? null
      : null;

    const base: any = {
      ...course,
      categoryName: category?.name ?? "Uncategorized",
      teacherName: teacher?.name,
      coverImageUrl,
    };

    if (level === "public") {
      return {
        _id: base._id,
        _creationTime: base._creationTime,
        title: base.title,
        description: base.description,
        content: base.content,
        categoryId: base.categoryId,
        categoryName: base.categoryName,
        teacherId: base.teacherId,
        teacherName: base.teacherName,
        coverImageUrl: base.coverImageUrl,
        status: base.status,
        isEnrollmentOpen: base.isEnrollmentOpen,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      };
    }

    if (level === "faculty" || level === "admin") {
      base.enrollmentCount = enrollmentCounts!.get(course._id) ?? 0;
      base.moduleCount = moduleCounts!.get(course._id) ?? 0;
    }

    if (level === "admin") {
      const creator = creatorMap!.get(course.createdBy);
      base.createdByName = creator?.name;
    }

    // For admin level, explicitly return only validated fields (no content)
    if (level === "admin") {
      return {
        _id: base._id,
        _creationTime: base._creationTime,
        title: base.title,
        description: base.description,
        categoryId: base.categoryId,
        categoryName: base.categoryName,
        teacherId: base.teacherId,
        teacherName: base.teacherName,
        status: base.status,
        enrollmentCount: base.enrollmentCount,
        moduleCount: base.moduleCount,
        isEnrollmentOpen: base.isEnrollmentOpen,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      };
    }

    // For faculty level, return base (which includes enrollmentCount and moduleCount)
    return base;
  });
}

/**
 * Generate unique enrollment code
 */
export function generateEnrollmentCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if a course is available for enrollment (deprecated - use enrollment.ts)
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
 * Get course progress for a user (deprecated - use progress.ts)
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