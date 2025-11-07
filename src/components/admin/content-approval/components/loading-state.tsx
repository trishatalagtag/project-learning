import { Loader } from "@/components/ui/loader"
import { memo } from "react"

interface LoadingStateProps {
  message?: string
}

export const LoadingState = memo(function LoadingState({
  message = "Loading content...",
}: LoadingStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader variant="spin" />
        <p className="text-muted-fg text-sm">{message}</p>
      </div>
    </div>
  )
})

