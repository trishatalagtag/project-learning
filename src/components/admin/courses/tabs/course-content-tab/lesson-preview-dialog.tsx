"use client"

import { LessonViewer } from "@/components/shared/content/lesson-viewer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { CheckCircleIcon, EyeIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { Loader2 } from "lucide-react"

import { useContentApproval } from "./hooks/use-content-approval"
import { RejectContentDialog } from "./reject-content-dialog"

interface LessonPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: Id<"lessons">
  lessonTitle: string
  lessonStatus: string
}

export function LessonPreviewDialog({
  open,
  onOpenChange,
  lessonId,
  lessonTitle,
  lessonStatus,
}: LessonPreviewDialogProps) {
  const { isApproving, showRejectDialog, setShowRejectDialog, handleApprove, handleReject } =
    useContentApproval({
      contentId: lessonId,
      contentType: "lesson",
    })

  const isPending = lessonStatus === CONTENT_STATUS.PENDING

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="m-0 h-screen max-h-[calc(100dvh)] w-screen min-w-full max-w-screen overflow-auto rounded-none">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Preview Lesson</DialogTitle>
            </div>
            <DialogDescription>
              Review lesson content and attachments before approval
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <LessonViewer lessonId={lessonId} />
          </div>

          {isPending && (
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApproving}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleReject()
                }}
                disabled={isApproving}
              >
                <XCircleIcon className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Approve Lesson
                  </>
                )}
              </Button>
            </DialogFooter>
          )}

          {!isPending && (
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <RejectContentDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        contentId={lessonId}
        contentType="lesson"
        contentTitle={lessonTitle}
      />
    </>
  )
}
