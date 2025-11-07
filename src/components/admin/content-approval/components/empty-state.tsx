import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { memo } from "react"

interface EmptyStateProps {
  title?: string
  description?: string
}

export const EmptyState = memo(function EmptyState({
  title = "All caught up!",
  description = "No content to review at this time.",
}: EmptyStateProps) {
  return (
    <Empty className="h-64 w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircleIcon className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
})

