import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"

export function useDeleteModule() {
  return useMutationWithToast(api.faculty.modules.deleteModule, {
    successMessage: "Module deleted",
    errorMessage: "Failed to delete module",
    onSuccess: () => {
      // Navigate back to course
      window.history.back()
    },
  })
}

export function useReorderModules(_courseId: Id<"courses">) {
  return useMutationWithToast(api.faculty.modules.reorderModules, {
    successMessage: "Modules reordered",
    errorMessage: "Failed to reorder modules",
  })
}
