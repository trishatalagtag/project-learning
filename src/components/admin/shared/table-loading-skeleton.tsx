"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { JSX } from "react"

export function TableLoadingSkeleton(): JSX.Element {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-6" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  )
}
