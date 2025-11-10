import { StatusBadge } from "@/components/shared/status/status-badge"
import type { ContentStatus } from "@/lib/constants/content-status"
import { EyeIcon } from "@heroicons/react/24/outline"

interface PreviewBannerProps {
  status: ContentStatus
  contentType: "lesson" | "module" | "course"
}

export function PreviewBanner({ status, contentType: _contentType }: PreviewBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-yellow-200 border-b bg-yellow-50 px-6 py-2 dark:border-yellow-900 dark:bg-yellow-950/20">
      <div className="flex items-center gap-2">
        <EyeIcon className="h-4 w-4 flex-shrink-0 text-yellow-700 dark:text-yellow-600" />
        <span className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
          Preview Mode
        </span>
        <span className="text-xs text-yellow-700 dark:text-yellow-300">
          · Not visible to learners
        </span>
      </div>
      <StatusBadge status={status} showIcon className="capitalize" />
    </div>
  )
}
