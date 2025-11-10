import type { LessonNavigation, ModuleWithLessons } from "@/lib/types/navigation";
import { useMemo } from "react";

export function useLessonNavigation(
  modules: ModuleWithLessons[],
  currentLessonId: string
): LessonNavigation {
  return useMemo(() => {
    // Flatten all lessons across modules
    const allLessons = modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        lessonId: lesson._id,
        moduleId: module._id,
        lessonTitle: lesson.title,
        moduleTitle: module.title,
        moduleOrder: module.order,
        lessonOrder: lesson.order,
      }))
    );

    // Sort by module order, then lesson order
    allLessons.sort((a, b) => {
      if (a.moduleOrder !== b.moduleOrder) {
        return a.moduleOrder - b.moduleOrder;
      }
      return a.lessonOrder - b.lessonOrder;
    });

    // Find current lesson index
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.lessonId === currentLessonId
    );

    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    const previous = currentIndex > 0 ? {
      lessonId: allLessons[currentIndex - 1].lessonId,
      moduleId: allLessons[currentIndex - 1].moduleId,
      lessonTitle: allLessons[currentIndex - 1].lessonTitle,
      moduleTitle: allLessons[currentIndex - 1].moduleTitle,
    } : null;

    const next = currentIndex < allLessons.length - 1 ? {
      lessonId: allLessons[currentIndex + 1].lessonId,
      moduleId: allLessons[currentIndex + 1].moduleId,
      lessonTitle: allLessons[currentIndex + 1].lessonTitle,
      moduleTitle: allLessons[currentIndex + 1].moduleTitle,
    } : null;

    return { previous, next };
  }, [modules, currentLessonId]);
}
