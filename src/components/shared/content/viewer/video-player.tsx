"use client"

import { LoadingSpinner } from "@/components/shared/loading/loading-spinner"
import type { Id } from "@/convex/_generated/dataModel"
import { useFileUrl } from "@/lib/hooks/use-file"
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
      <div className="flex items-center justify-center p-8 border border-border rounded-lg bg-muted/30">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isNotFound || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-lg">
        <PlayCircleIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Video not available</p>
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
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
