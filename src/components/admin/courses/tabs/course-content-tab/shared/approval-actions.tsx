import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ApprovalActionsProps {
  onApprove: () => void
  onReject: () => void
  onRequestChanges?: () => void
  isApproving: boolean
  canApprove?: boolean
  canReject?: boolean
  size?: "sm" | "default"
  layout?: "horizontal" | "vertical"
}

export function ApprovalActions({
  onApprove,
  onReject,
  onRequestChanges,
  isApproving,
  canApprove = true,
  canReject = true,
  size = "sm",
  layout = "horizontal",
}: ApprovalActionsProps) {
  return (
    <div className={`flex gap-2 ${layout === "vertical" ? "flex-col" : ""}`}>
      <Button
        size={size}
        onClick={(e) => {
          e.stopPropagation()
          onApprove()
        }}
        disabled={!canApprove || isApproving}
        className={`${layout === "vertical" ? "w-full" : "flex-1"} gap-2`}
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
      {onRequestChanges && (
        <Button
          size={size}
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onRequestChanges()
          }}
          disabled={isApproving}
          className={`${layout === "vertical" ? "w-full" : "flex-1"} gap-2`}
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          Request Changes
        </Button>
      )}
      <Button
        size={size}
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation()
          onReject()
        }}
        disabled={!canReject}
        className={`${layout === "vertical" ? "w-full" : "flex-1"} gap-2`}
      >
        <XCircleIcon className="h-4 w-4" />
        Reject
      </Button>
    </div>
  )
}
