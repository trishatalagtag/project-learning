import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { useMutationWithToast } from "@/lib/hooks/use-mutation-with-toast"

export function useUpdateLesson() {
  return useMutationWithToast(api.faculty.lessons.updateLesson, {
    successMessage: "Lesson updated",
    errorMessage: "Failed to update lesson",
  })
}

export function useDeleteLesson() {
  return useMutationWithToast(api.faculty.lessons.deleteLesson, {
    successMessage: "Lesson deleted",
    errorMessage: "Failed to delete lesson",
  })
}

export function useSubmitLessonForReview(lessonId: Id<"lessons">) {
  const { execute: updateLesson } = useUpdateLesson()

  return {
    submitForReview: async () => {
      return await updateLesson({
        lessonId,
        title: undefined,
        description: undefined,
        content: undefined,
        order: undefined,
        status: CONTENT_STATUS.PENDING,
      })
    },
  }
}
