import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_STATUS } from "@/lib/constants/content-status";

export function useLesson(lessonId: Id<"lessons">) {
  const lesson = useQuery(api.faculty.lessons.getLessonById, { lessonId });

  return {
    lesson, // Type is automatically Lesson | undefined
    isLoading: lesson === undefined,
    isNotFound: lesson === null,
    isPublished: lesson?.status === CONTENT_STATUS.PUBLISHED,
    isDraft: lesson?.status === CONTENT_STATUS.DRAFT,
    isPending: lesson?.status === CONTENT_STATUS.PENDING,
    isApproved: lesson?.status === CONTENT_STATUS.APPROVED,
  } as const;
}

// Export the return type for use in components
export type UseLessonReturn = ReturnType<typeof useLesson>;
