import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { toast } from "sonner"

type MutationResult = { success: true } | { success: false; error: string }

export function useCategoryMutations() {
  const createCategory = useMutation(api.admin.categories.createCategory)
  const updateCategory = useMutation(api.admin.categories.updateCategory)
  const deleteCategory = useMutation(api.admin.categories.deleteCategory)

  const withErrorHandling = async <T extends unknown[]>(
    fn: (...args: T) => Promise<any>,
    successMessage: string,
    errorMessage: string,
    ...args: T
  ): Promise<MutationResult> => {
    try {
      await fn(...args)
      toast.success(successMessage)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const create = async (data: {
    name: string
    description: string
    level: number
    parentId?: Id<"categories">
    order?: number
  }): Promise<MutationResult> => {
    return withErrorHandling(
      createCategory,
      "Category created successfully",
      "Failed to create category",
      data,
    )
  }

  const update = async (data: {
    categoryId: Id<"categories">
    name?: string
    description?: string
    order?: number
    level?: number
    parentId?: Id<"categories"> | null
  }): Promise<MutationResult> => {
    return withErrorHandling(
      updateCategory,
      "Category updated successfully",
      "Failed to update category",
      data,
    )
  }

  const remove = async (categoryId: Id<"categories">): Promise<MutationResult> => {
    return withErrorHandling(
      deleteCategory,
      "Category deleted successfully",
      "Failed to delete category",
      { categoryId },
    )
  }

  return {
    create,
    update,
    delete: remove,
  }
}
