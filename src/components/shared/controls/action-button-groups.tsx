import {
  CheckCircleIcon,
  GlobeAltIcon,
  NoSymbolIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

interface EditButtonGroupProps {
  onEdit: () => void
  disabled?: boolean
}

export function EditButtonGroup({ onEdit, disabled }: EditButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button variant="default" size="sm" className="gap-2" onClick={onEdit} disabled={disabled}>
        <PencilIcon className="h-4 w-4" />
        Edit
      </Button>
    </ButtonGroup>
  )
}

interface ApprovalButtonGroupProps {
  onApprove: () => void
  onReject: () => void
  isApproving: boolean
}

export function ApprovalButtonGroup({
  onApprove,
  onReject,
  isApproving,
}: ApprovalButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button
        variant="default"
        size="sm"
        className="gap-2 bg-green-600 hover:bg-green-700"
        onClick={onApprove}
        disabled={isApproving}
      >
        {isApproving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-4 w-4" />
            Approve
          </>
        )}
      </Button>
      <ButtonGroupSeparator />
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={onReject}
        disabled={isApproving}
      >
        <XCircleIcon className="h-4 w-4" />
        Reject
      </Button>
    </ButtonGroup>
  )
}

interface PublishButtonGroupProps {
  onPublish: () => void
  isPublishing: boolean
}

export function PublishButtonGroup({ onPublish, isPublishing }: PublishButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button
        variant="default"
        size="sm"
        className="gap-2 bg-blue-600 hover:bg-blue-700"
        onClick={onPublish}
        disabled={isPublishing}
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <GlobeAltIcon className="h-4 w-4" />
            Publish
          </>
        )}
      </Button>
    </ButtonGroup>
  )
}

interface UnpublishButtonGroupProps {
  onEdit: () => void
  onUnpublish: () => void
  isPublishing: boolean
}

export function UnpublishButtonGroup({
  onEdit,
  onUnpublish,
  isPublishing,
}: UnpublishButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button variant="default" size="sm" className="gap-2" onClick={onEdit}>
        <PencilIcon className="h-4 w-4" />
        Edit
      </Button>
      <ButtonGroupSeparator />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onUnpublish}
        disabled={isPublishing}
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Unpublishing...
          </>
        ) : (
          <>
            <NoSymbolIcon className="h-4 w-4" />
            Unpublish
          </>
        )}
      </Button>
    </ButtonGroup>
  )
}

interface DeleteButtonGroupProps {
  onDelete: () => void
  disabled?: boolean
}

export function DeleteButtonGroup({ onDelete, disabled }: DeleteButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={onDelete}
        disabled={disabled}
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </Button>
    </ButtonGroup>
  )
}

interface SubmitReviewButtonGroupProps {
  onEdit: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function SubmitReviewButtonGroup({
  onEdit,
  onSubmit,
  isSubmitting,
}: SubmitReviewButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button variant="default" size="sm" className="gap-2" onClick={onEdit}>
        <PencilIcon className="h-4 w-4" />
        Edit
      </Button>
      <ButtonGroupSeparator />
      <Button
        variant="default"
        size="sm"
        className="gap-2 bg-green-600 hover:bg-green-700"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-4 w-4" />
            Submit for Review
          </>
        )}
      </Button>
    </ButtonGroup>
  )
}

interface SaveCancelButtonGroupProps {
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

export function SaveCancelButtonGroup({ onSave, onCancel, isSaving }: SaveCancelButtonGroupProps) {
  return (
    <ButtonGroup>
      <Button onClick={onSave} disabled={isSaving} className="gap-2">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
    </ButtonGroup>
  )
}
