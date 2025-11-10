import type { api } from "@/convex/_generated/api"
import {
  BookOpenIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import type { FunctionReturnType } from "convex/server"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CONTENT_STATUS } from "@/lib/constants/content-status"

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface ContentStatsProps {
  modules: Module[]
}

export function ContentStats({ modules }: ContentStatsProps) {
  const stats = {
    total: modules.length,
    published: modules.filter((m) => m.status === CONTENT_STATUS.PUBLISHED).length,
    approved: modules.filter((m) => m.status === CONTENT_STATUS.APPROVED).length,
    pending: modules.filter((m) => m.status === CONTENT_STATUS.PENDING).length,
    draft: modules.filter((m) => m.status === CONTENT_STATUS.DRAFT).length,
    totalLessons: modules.reduce((sum, m) => sum + m.lessonCount, 0),
  }

  return (
    <div className="flex items-center gap-4 pt-4 border-t">
      <div className="flex items-center gap-2 text-sm">
        <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{stats.total}</span>
        <span className="text-muted-foreground">{stats.total === 1 ? "Module" : "Modules"}</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{stats.totalLessons}</span>
        <span className="text-muted-foreground">
          {stats.totalLessons === 1 ? "Lesson" : "Lessons"}
        </span>
      </div>

      {stats.published > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircleIcon className="h-4 w-4 text-primary" />
          <span className="font-medium">{stats.published}</span>
          <span className="text-muted-foreground">Published</span>
        </div>
      )}

      {stats.pending > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm cursor-help">
                <ExclamationCircleIcon className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-600">{stats.pending}</span>
                <span className="text-muted-foreground">Needs Review</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">These items require your approval</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
