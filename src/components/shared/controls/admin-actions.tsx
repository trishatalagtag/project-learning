import type { Id } from "@/convex/_generated/dataModel"

import {
  ApprovalButtonGroup,
  DeleteButtonGroup,
  EditButtonGroup,
  PublishButtonGroup,
  UnpublishButtonGroup,
} from "./action-button-groups"

interface AdminActionsProps {
  courseId: Id<"courses">
  moduleId: Id<"modules">
  lessonId: Id<"lessons">
  lessonStatus: string
  canEdit: boolean
  canApprove: boolean
  onEdit: () => void
  onApprove?: () => void
  onReject?: () => void
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
  isApproving: boolean
  isPublishing: boolean
}

export function AdminActions({
  courseId,
  moduleId,
  lessonId,
  lessonStatus,
  canEdit,
  canApprove,
  onEdit,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onDelete,
  isApproving,
  isPublishing,
}: AdminActionsProps) {
  const isPending = lessonStatus === "pending"
  const isApproved = lessonStatus === "approved"
  const isPublished = lessonStatus === "published"
  const isDraft = lessonStatus === "draft"

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Draft Status */}
      {isDraft && (
        <>
          {canEdit && <EditButtonGroup onEdit={onEdit} />}
          <DeleteButtonGroup onDelete={onDelete} />
        </>
      )}

      {/* Pending Status */}
      {isPending && (
        <>
          {canEdit && <EditButtonGroup onEdit={onEdit} />}
          {canApprove && onApprove && onReject && (
            <ApprovalButtonGroup
              onApprove={onApprove}
              onReject={onReject}
              isApproving={isApproving}
            />
          )}
          <DeleteButtonGroup onDelete={onDelete} />
        </>
      )}

      {/* Approved Status */}
      {isApproved && (
        <>
          {canEdit && <EditButtonGroup onEdit={onEdit} />}
          <PublishButtonGroup onPublish={onPublish} isPublishing={isPublishing} />
          <DeleteButtonGroup onDelete={onDelete} />
        </>
      )}

      {/* Published Status */}
      {isPublished && (
        <>
          <UnpublishButtonGroup
            onEdit={onEdit}
            onUnpublish={onUnpublish}
            isPublishing={isPublishing}
          />
          <DeleteButtonGroup onDelete={onDelete} />
        </>
      )}
    </div>
  )
}
