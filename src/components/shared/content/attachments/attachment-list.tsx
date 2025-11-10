"use client"

import { EmptyAttachments } from "@/components/shared/empty/empty-attachments"
import { LoadingSpinner } from "@/components/shared/loading/loading-spinner"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { FunctionReturnType } from "convex/server"
import { AttachmentItem } from "./attachment-item"
import { useAttachments } from "../hooks/use-attachments"

type Attachment = FunctionReturnType<typeof api.faculty.attachments.listAttachmentsByLesson>[number]

interface AttachmentListProps {
  lessonId: Id<"lessons">
}

export function AttachmentList({ lessonId }: AttachmentListProps) {
  const { attachments, isLoading, isEmpty } = useAttachments(lessonId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isEmpty) {
    return <EmptyAttachments />
  }

  return (
    <div className="space-y-3">
      {(attachments as Attachment[]).map((attachment) => (
        <AttachmentItem key={attachment._id} attachment={attachment} />
      ))}
    </div>
  )
}
