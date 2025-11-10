import { CalendarIcon } from "@heroicons/react/24/outline"
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
          <div className={`flex items-center gap-1 cursor-help ${className}`}>
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <p>Created: {new Date(createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(updatedAt).toLocaleDateString()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
