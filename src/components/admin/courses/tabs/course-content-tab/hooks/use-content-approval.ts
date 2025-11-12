import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"

type ContentType = "module" | "lesson" | "quiz" | "assignment"

interface UseContentApprovalProps {
  contentId: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
  contentType: ContentType
}

export function useContentApproval({ contentId, contentType }: UseContentApprovalProps) {
  const approveModule = useMutation(api.admin.content.approveModule)
  const approveLesson = useMutation(api.admin.content.approveLesson)
  const approveQuiz = useMutation(api.admin.content.approveQuiz)
  const approveAssignment = useMutation(api.admin.content.approveAssignment)

  const [isApproving, setIsApproving] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false)

  const handleApprove = async (comments?: string) => {
    setIsApproving(true)
    try {
      if (contentType === "module") {
        await approveModule({ moduleId: contentId as Id<"modules"> })
      } else if (contentType === "lesson") {
        await approveLesson({ lessonId: contentId as Id<"lessons"> })
      } else if (contentType === "quiz") {
        await approveQuiz({ quizId: contentId as Id<"quizzes">, comments })
      } else if (contentType === "assignment") {
        await approveAssignment({ assignmentId: contentId as Id<"assignments">, comments })
      }
      toast.success(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} approved`)
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to approve ${contentType}`
      toast.error(message, { duration: 5000 })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = () => {
    setShowRejectDialog(true)
  }

  const handleRequestChanges = () => {
    setShowRequestChangesDialog(true)
  }

  return {
    isApproving,
    showRejectDialog,
    setShowRejectDialog,
    showRequestChangesDialog,
    setShowRequestChangesDialog,
    handleApprove,
    handleReject,
    handleRequestChanges,
  }
}
