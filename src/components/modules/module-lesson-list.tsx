import { EmptyLessons } from "@/components/shared/empty/empty-lessons"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ROLE, type UserRole } from "@/lib/rbac/permissions"
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { OptimisticLocalStore } from "convex/browser"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { toast } from "sonner"
import { CreateLessonDialog } from "./create-lesson-dialog"
import { LessonListItem } from "./lesson-list-item"

type CourseLesson = FunctionReturnType<typeof api.faculty.lessons.listLessonsByModule>[number]

interface ModuleLessonListProps {
  moduleId: Id<"modules">
  courseId: Id<"courses">
  lessons: CourseLesson[]
  userRole: UserRole
}

export function ModuleLessonList({ moduleId, courseId, lessons, userRole }: ModuleLessonListProps) {
  const reorderLessons = useMutation(api.faculty.lessons.reorderLessons).withOptimisticUpdate(
    (
      localStore: OptimisticLocalStore,
      args: {
        moduleId: Id<"modules">
        lessonOrders: { lessonId: Id<"lessons">; order: number }[]
      },
    ) => {
      // Get the current query result
      const currentLessons = localStore.getQuery(api.faculty.lessons.listLessonsByModule, {
        moduleId: args.moduleId,
      })

      if (!currentLessons) return

      // Create a map of lessonId to new order
      const orderMap = new Map(args.lessonOrders.map((lo) => [lo.lessonId, lo.order]))

      // Sort lessons by new order
      const reordered = [...currentLessons].sort((a, b) => {
        const orderA = orderMap.get(a._id) ?? a.order
        const orderB = orderMap.get(b._id) ?? b.order
        return orderA - orderB
      })

      // Update the query with reordered lessons
      localStore.setQuery(
        api.faculty.lessons.listLessonsByModule,
        { moduleId: args.moduleId },
        reordered,
      )
    },
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const canReorder = userRole === ROLE.ADMIN || userRole === ROLE.FACULTY
  const canCreate = userRole === ROLE.ADMIN || userRole === ROLE.FACULTY

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = lessons.findIndex((l) => l._id === active.id)
    const newIndex = lessons.findIndex((l) => l._id === over.id)

    const reordered = arrayMove(lessons, oldIndex, newIndex)
    const updates = reordered.map((lesson, index) => ({
      lessonId: lesson._id as Id<"lessons">,
      order: index + 1,
    }))

    try {
      await reorderLessons({
        moduleId: moduleId as Id<"modules">,
        lessonOrders: updates,
      })
      toast.success("Lessons reordered")
    } catch {
      toast.error("Failed to reorder lessons", { duration: 5000 })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Lessons ({lessons.length})</h2>
        {canCreate && <CreateLessonDialog moduleId={moduleId} />}
      </div>

      {lessons.length === 0 ? (
        <EmptyLessons moduleId={moduleId} canCreate={canCreate} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lessons.map((l) => l._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <LessonListItem
                  key={lesson._id}
                  lesson={lesson}
                  index={index}
                  moduleId={moduleId}
                  courseId={courseId}
                  userRole={userRole}
                  isDraggable={canReorder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
