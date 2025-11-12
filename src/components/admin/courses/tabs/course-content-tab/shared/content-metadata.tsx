import { ClockIcon } from "@heroicons/react/24/solid"
import { formatDistanceToNow } from "date-fns"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContentMetadataProps {
  createdAt: number
  updatedAt: number
  className?: string
}

export function ContentMetadata({ createdAt, updatedAt, className }: ContentMetadataProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex cursor-help items-center gap-1.5 ${className}`}>
            <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-3 w-3" />
              <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-3 w-3" />
              <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
