import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutationWithToast } from "@/lib/hooks/use-mutation-with-toast";

export function useCreateLesson(moduleId: Id<"modules">) {
  const { execute: createLesson, isPending: isCreating } = useMutationWithToast(
    api.faculty.lessons.createLesson,
    {
      successMessage: "Lesson created",
      errorMessage: "Failed to create lesson",
    }
  );

  const create = async (data: { title: string; description: string }) => {
    const result = await createLesson({
      moduleId,
      title: data.title,
      description: data.description,
      content: "<p>Start writing your lesson content here...</p>",
    });

    if (result.success && result.data) {
      return { success: true, lessonId: result.data };
    }

    return { success: false, lessonId: null };
  };

  return { create, isCreating };
}

