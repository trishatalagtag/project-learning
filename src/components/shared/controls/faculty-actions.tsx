import { CheckCircleIcon, ClockIcon, GlobeAltIcon } from "@heroicons/react/24/solid"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { DeleteButtonGroup, SubmitReviewButtonGroup } from "./action-button-groups"

interface FacultyActionsProps {
  lessonStatus: string
  onEdit: () => void
  onSubmit: () => void
  onDelete: () => void
  isSubmitting: boolean
}

export function FacultyActions({
  lessonStatus,
  onEdit,
  onSubmit,
  onDelete,
  isSubmitting,
}: FacultyActionsProps) {
  const isPending = lessonStatus === "pending"
  const isApproved = lessonStatus === "approved"
  const isPublished = lessonStatus === "published"
  const isDraft = lessonStatus === "draft"

  return (
    <div className="space-y-4">
      {/* Status Alerts */}
      {isPending && (
        <Alert>
          <ClockIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Waiting for Admin Approval</strong>
            <p className="mt-1 text-muted-foreground text-sm">
              You cannot edit this lesson while it's pending review. If rejected, it will return to
              Draft status.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {isApproved && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            <strong>Approved by Admin</strong>
            <p className="mt-1 text-green-700 text-sm dark:text-green-300">
              Your lesson is approved and will be published soon. You cannot edit approved content.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {isPublished && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
          <GlobeAltIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Published</strong>
            <p className="mt-1 text-blue-700 text-sm dark:text-blue-300">
              This lesson is live and visible to learners. Contact admin if you need to make
              changes.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons - Only for Draft */}
      {isDraft && (
        <div className="flex flex-wrap items-center gap-3">
          <SubmitReviewButtonGroup
            onEdit={onEdit}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
          <DeleteButtonGroup onDelete={onDelete} />
        </div>
      )}
    </div>
  )
}
