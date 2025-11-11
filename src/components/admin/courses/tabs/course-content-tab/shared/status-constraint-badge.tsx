import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { api } from "@/convex/_generated/api"
import { STATUS_CONFIG } from "@/lib/constants/content-status"
import { InformationCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import type { FunctionReturnType } from "convex/server"

type Status = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]["status"]

interface StatusConstraintBadgeProps {
  moduleStatus: Status
  moduleTitle: string
}

export function StatusConstraintBadge({ moduleStatus, moduleTitle }: StatusConstraintBadgeProps) {
  const statusConfig = STATUS_CONFIG[moduleStatus as keyof typeof STATUS_CONFIG]
  const statusLabel = statusConfig?.label || moduleStatus

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="cursor-help gap-1.5 border-destructive/50 bg-destructive/5 text-destructive"
          >
            <LockClosedIcon className="h-3.5 w-3.5" />
            <span className="text-xs">Max: {statusLabel}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-xs">Status Constraint</p>
                <p className="text-muted-foreground text-xs">
                  This lesson cannot exceed the parent module's status.
                </p>
              </div>
            </div>
            <div className="rounded bg-muted/50 p-2 text-xs">
              <p className="mb-1 font-medium">Parent Module:</p>
              <p className="text-muted-foreground">{moduleTitle}</p>
              <p className="text-muted-foreground">
                Status: <span className="font-medium">{statusLabel}</span>
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              Update the module status first to unlock higher levels.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
