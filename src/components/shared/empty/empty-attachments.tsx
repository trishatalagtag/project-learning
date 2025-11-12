import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PaperClipIcon } from "@heroicons/react/24/solid"

interface EmptyAttachmentsProps {
  message?: string
}

export function EmptyAttachments({
  message = "This lesson doesn't have any attachments yet.",
}: EmptyAttachmentsProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PaperClipIcon />
        </EmptyMedia>
        <EmptyTitle>No Attachments</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
