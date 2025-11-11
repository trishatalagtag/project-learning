"use client"

import { LoadingSpinner } from "@/components/shared/loading/loading-spinner"
import type { Id } from "@/convex/_generated/dataModel"
import { useFileUrl } from "@/hooks/use-file"
import { PlayCircleIcon } from "@heroicons/react/24/outline"

interface VideoPlayerProps {
  fileId: Id<"_storage">
  title: string
  description?: string
}

export function VideoPlayer({ fileId, title, description }: VideoPlayerProps) {
  const { url: videoUrl, isLoading, isNotFound } = useFileUrl(fileId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isNotFound || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border border-dashed p-8">
        <PlayCircleIcon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Video not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <video
        controls
        className="w-full rounded-lg border border-border"
        src={videoUrl}
        title={title}
      >
        Your browser does not support the video tag.
      </video>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
    </div>
  )
}
