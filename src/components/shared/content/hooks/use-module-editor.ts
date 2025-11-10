import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutationWithToast } from "@/lib/hooks/use-mutation-with-toast";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

export function useModuleEditor(
  moduleId: Id<"modules">,
  initialMarkdown?: string
) {
  const { execute: updateModule, isPending: isSavingMutation } = useMutationWithToast(
    api.faculty.modules.updateModule,
    {
      successMessage: "Module content updated",
      errorMessage: "Failed to update module content",
    }
  );

  const [markdown, setMarkdown] = useState(initialMarkdown ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialMarkdown !== undefined) {
      setMarkdown(initialMarkdown);
      setIsDirty(false);
    }
  }, [initialMarkdown]);

  const debouncedMarkdown = useDebounce(markdown, 600);

  useEffect(() => {
    if (!debouncedMarkdown || debouncedMarkdown === initialMarkdown || !isDirty) return;

    setIsSaving(true);
    updateModule({
      moduleId,
      content: debouncedMarkdown,
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
  }, [debouncedMarkdown, moduleId, initialMarkdown, isDirty, updateModule]);

  const save = async () => {
    const result = await updateModule({
      moduleId,
      content: markdown,
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

    if (initialMarkdown !== undefined) {
      setMarkdown(initialMarkdown);
      setIsDirty(false);
    }
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsDirty(newMarkdown !== (initialMarkdown ?? ""));
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

