import type { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { useUpdateLesson } from "./use-lesson-mutations";

export function useLessonEditor(
  lessonId: Id<"lessons">,
  moduleId: string,
  courseId: Id<"courses">,
  initialContent?: string
) {
  const navigate = useNavigate();
  const { execute: updateLesson, isPending: isSavingMutation } = useUpdateLesson();

  const [content, setContent] = useState(initialContent ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync content when lesson loads
  useEffect(() => {
    if (initialContent && !content) {
      setContent(initialContent);
    }
  }, [initialContent, content]);

  // NEW: Debounced auto-save
  const debouncedContent = useDebounce(content, 600);

  useEffect(() => {
    // Don't auto-save if content hasn't changed or is empty
    if (!debouncedContent || debouncedContent === initialContent || !isDirty) return;

    setIsSaving(true);
    updateLesson({
      lessonId,
      content: debouncedContent,
      title: undefined,
      description: undefined,
      order: undefined,
      status: undefined,
    })
      .then((result) => {
        if (result.success) {
          setLastSaved(new Date());
          setIsDirty(false);
        }
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [debouncedContent, lessonId, initialContent, isDirty, updateLesson]);

  const save = async () => {
    const result = await updateLesson({
      lessonId,
      content,
      title: undefined,
      description: undefined,
      order: undefined,
      status: undefined,
    });

    if (result.success) {
      setIsDirty(false);
      setLastSaved(new Date());
      navigate({
        to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
        params: { courseId, moduleId, lessonId },
      });
    }

    return result.success;
  };

  const cancel = () => {
    if (isDirty) {
      const confirmCancel = window.confirm("You have unsaved changes. Discard them?");
      if (!confirmCancel) return;
    }

    navigate({
      to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
      params: { courseId, moduleId, lessonId },
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(newContent !== initialContent);
  };

  return { 
    content, 
    setContent: handleContentChange, 
    save, 
    cancel, 
    isSaving: isSaving || isSavingMutation,
    isDirty,
    lastSaved,
  };
}

