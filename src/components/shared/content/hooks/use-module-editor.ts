import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutationWithToast } from "@/lib/hooks/use-mutation-with-toast";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

export function useModuleEditor(
  moduleId: Id<"modules">,
  initialContent?: string
) {
  const { execute: updateModule, isPending: isSavingMutation } = useMutationWithToast(
    api.faculty.modules.updateModule,
    {
      successMessage: "Module content updated",
      errorMessage: "Failed to update module content",
    }
  );

  const [content, setContent] = useState(initialContent ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync content when module loads
  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
      setIsDirty(false);
    }
  }, [initialContent]);

  // NEW: Debounced auto-save
  const debouncedContent = useDebounce(content, 600);

  useEffect(() => {
    if (!debouncedContent || debouncedContent === initialContent || !isDirty) return;

    setIsSaving(true);
    updateModule({
      moduleId,
      content: debouncedContent,
      title: undefined,
      description: undefined,
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
  }, [debouncedContent, moduleId, initialContent, isDirty, updateModule]);

  const save = async () => {
    const result = await updateModule({
      moduleId,
      content,
      title: undefined,
      description: undefined,
    });

    if (result.success) {
      setIsDirty(false);
      setLastSaved(new Date());
    }

    return result.success;
  };

  const cancel = () => {
    if (isDirty) {
      const confirmCancel = window.confirm("You have unsaved changes. Discard them?");
      if (!confirmCancel) return;
    }

    // Reset to initial content
    if (initialContent !== undefined) {
      setContent(initialContent);
      setIsDirty(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(newContent !== (initialContent ?? ""));
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

