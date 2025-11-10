import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bars3Icon, PlayIcon } from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"

import { StatusBadge } from "@/components/shared/status/status-badge"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { canViewUnpublishedContent, type UserRole } from "@/lib/rbac/permissions"
import type { FunctionReturnType } from "convex/server"

type CourseLesson = FunctionReturnType<typeof api.faculty.lessons.listLessonsByModule>[number]

interface LessonListItemProps {
  lesson: CourseLesson
  index: number // ← Add this
  moduleId: Id<"modules">
  courseId: Id<"courses">
  userRole: UserRole
  isDraggable: boolean
}

export function LessonListItem({
  lesson,
  index, // ← Add this
  moduleId,
  courseId,
  userRole,
  isDraggable,
}: LessonListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson._id,
    disabled: !isDraggable,
  })

  const showStatus = userRole ? canViewUnpublishedContent(userRole) : false
  const displayOrder = index + 1 // ← Use index instead of lesson.order

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none active:cursor-grabbing"
        >
          <Bars3Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-all duration-500 ease-out animate-in fade-in zoom-in">
        {displayOrder}
      </div>

      <Link
        to="/c/$courseId/m/$moduleId/lessons/$lessonId"
        params={{ courseId, moduleId, lessonId: lesson._id }}
        className="min-w-0 flex-1"
      >
        <div className="flex items-center gap-2">
          <PlayIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold">{lesson.title}</h3>
          {showStatus && lesson.status !== CONTENT_STATUS.PUBLISHED && (
            <StatusBadge status={lesson.status} className="shrink-0 text-xs" />
          )}
        </div>
        {lesson.description && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{lesson.description}</p>
        )}
      </Link>
    </div>
  )
}
