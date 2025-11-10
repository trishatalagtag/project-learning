import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

type ContentType = "module" | "lesson";

interface UseContentApprovalProps {
  contentId: Id<"modules"> | Id<"lessons">;
  contentType: ContentType;
}

export function useContentApproval({
  contentId,
  contentType,
}: UseContentApprovalProps) {
  const approveModule = useMutation(api.admin.content.approveModule);
  const approveLesson = useMutation(api.admin.content.approveLesson);

  const [isApproving, setIsApproving] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      if (contentType === "module") {
        await approveModule({ moduleId: contentId as Id<"modules"> });
      } else {
        await approveLesson({ lessonId: contentId as Id<"lessons"> });
      }
      toast.success(`${contentType} approved`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to approve ${contentType}`;
      // Show validation errors for longer duration
      toast.error(message, { duration: 5000 });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  return {
    isApproving,
    showRejectDialog,
    setShowRejectDialog,
    handleApprove,
    handleReject,
  };
}

