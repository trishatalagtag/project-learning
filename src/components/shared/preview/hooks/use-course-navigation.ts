import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

type ModulesWithLessons = FunctionReturnType<typeof api.faculty.navigation.getModulesWithLessons>;

/**
 * Get course navigation from a lessonId
 */
export function useCourseNavigation(lessonId: Id<"lessons">) {
  const lesson = useQuery(api.faculty.lessons.getLessonById, { lessonId });

  const modulesWithLessons = useQuery(
    api.faculty.navigation.getModulesWithLessons,
    lesson ? { courseId: lesson.courseId } : "skip"
  );

  return {
    lesson,
    modules: modulesWithLessons ?? [],
    isLoading: lesson === undefined || modulesWithLessons === undefined,
    courseTitle: lesson?.courseName ?? "",
    courseId: lesson?.courseId,
  } as const;
}

/**
 * Get course navigation from a moduleId
 */
export function useCourseNavigationByModule(moduleId: Id<"modules">) {
  const module = useQuery(api.faculty.modules.getModuleById, { moduleId });

  const modulesWithLessons = useQuery(
    api.faculty.navigation.getModulesWithLessons,
    module ? { courseId: module.courseId } : "skip"
  );

  return {
    module,
    modules: modulesWithLessons ?? [],
    isLoading: module === undefined || modulesWithLessons === undefined,
    courseTitle: module?.courseName ?? "",
    courseId: module?.courseId,
  } as const;
}

export type UseCourseNavigationReturn = ReturnType<typeof useCourseNavigation>;
export type UseCourseNavigationByModuleReturn = ReturnType<typeof useCourseNavigationByModule>;

