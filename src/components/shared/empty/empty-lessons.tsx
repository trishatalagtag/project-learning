import { CreateLessonDialog } from "@/components/modules/create-lesson-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { Id } from "@/convex/_generated/dataModel"
import { BookOpenIcon } from "@heroicons/react/24/solid"

interface EmptyLessonsProps {
  moduleId: Id<"modules">
  canCreate: boolean
}

export function EmptyLessons({ moduleId, canCreate }: EmptyLessonsProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No Lessons Yet</EmptyTitle>
        <EmptyDescription>
          This module doesn't have any lessons.{" "}
          {canCreate && "Create your first lesson to get started."}
        </EmptyDescription>
      </EmptyHeader>
      {canCreate && (
        <EmptyContent>
          <CreateLessonDialog moduleId={moduleId} />
        </EmptyContent>
      )}
    </Empty>
  )
}
