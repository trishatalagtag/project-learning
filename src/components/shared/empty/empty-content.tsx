import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { DocumentTextIcon } from "@heroicons/react/24/solid"

interface EmptyContentProps {
  type?: "lesson" | "module" | "course"
  message?: string
}

const typeMessages = {
  lesson: "Lesson not found",
  module: "Module not found",
  course: "Course not found",
}

export function EmptyContent({ type = "lesson", message }: EmptyContentProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DocumentTextIcon />
        </EmptyMedia>
        <EmptyTitle>{message || typeMessages[type]}</EmptyTitle>
        <EmptyDescription>
          The {type} you're looking for doesn't exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
