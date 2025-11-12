import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { api } from "@/convex/_generated/api"
import { DocumentTextIcon } from "@heroicons/react/24/outline"
import type { FunctionReturnType } from "convex/server"

import { STATUS_CONFIG } from "@/lib/constants/content-status"

type Status = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]["status"]

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

  // Fallback for unknown statuses
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        <DocumentTextIcon className="mr-1.5 h-3.5 w-3.5" />
        {status || "Unknown"}
      </Badge>
    )
  }

  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={className}>
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
