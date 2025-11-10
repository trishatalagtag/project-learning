import type { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { useUpdateLesson } from "./use-lesson-mutations";

export function useLessonEditor(
  lessonId: Id<"lessons">,
  moduleId: Id<"modules">,
  courseId: Id<"courses">,
  initialMarkdown?: string
) {
  const navigate = useNavigate();
  const { execute: updateLesson, isPending: isSavingMutation } = useUpdateLesson();

  const [markdown, setMarkdown] = useState(initialMarkdown ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialMarkdown && !markdown) {
      setMarkdown(initialMarkdown);
    }
  }, [initialMarkdown, markdown]);

  const debouncedMarkdown = useDebounce(markdown, 600);

  useEffect(() => {
    if (!debouncedMarkdown || debouncedMarkdown === initialMarkdown || !isDirty) return;

    setIsSaving(true);
    updateLesson({
      lessonId,
      content: debouncedMarkdown,
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
  }, [debouncedMarkdown, lessonId, initialMarkdown, isDirty, updateLesson]);

  const save = async () => {
    const result = await updateLesson({
      lessonId,
      content: markdown,
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
        params: { courseId, moduleId: moduleId as Id<"modules">, lessonId },
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
      params: { courseId, moduleId: moduleId as Id<"modules">, lessonId },
    });
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsDirty(newMarkdown !== initialMarkdown);
  };

  return {
    markdown,
    setMarkdown: handleMarkdownChange,
    save,
    cancel,
    isSaving: isSaving || isSavingMutation,
    isDirty,
    lastSaved,
  };
}

