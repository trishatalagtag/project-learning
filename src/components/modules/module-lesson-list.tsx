import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutationWithToast } from "@/lib/hooks/use-mutation-with-toast";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { FunctionReturnType } from "convex/server";

import { ROLE, type UserRole } from "@/lib/rbac/permissions";

import { EmptyLessons } from "@/components/shared/empty/empty-lessons";
import { CreateLessonDialog } from "./create-lesson-dialog";
import { LessonListItem } from "./lesson-list-item";

type CourseLesson = FunctionReturnType<
    typeof api.faculty.lessons.listLessonsByModule
>[number];

interface ModuleLessonListProps {
    moduleId: Id<"modules">;
    courseId: Id<"courses">;
    lessons: CourseLesson[];
    userRole: UserRole;
}

export function ModuleLessonList({ moduleId, courseId, lessons, userRole }: ModuleLessonListProps) {
    const { execute: reorderLessons } = useMutationWithToast(api.faculty.lessons.reorderLessons, {
        successMessage: "Lessons reordered",
        errorMessage: "Failed to reorder lessons",
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const canReorder = userRole === ROLE.ADMIN || userRole === ROLE.FACULTY;
    const canCreate = userRole === ROLE.ADMIN || userRole === ROLE.FACULTY;

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = lessons.findIndex((l) => l._id === active.id);
        const newIndex = lessons.findIndex((l) => l._id === over.id);

        const reordered = arrayMove(lessons, oldIndex, newIndex);
        const updates = reordered.map((lesson, index) => ({
            lessonId: lesson._id as Id<"lessons">,
            order: index + 1,
        }));

        await reorderLessons({ moduleId: moduleId as Id<"modules">, lessonOrders: updates });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    Lessons ({lessons.length})
                </h2>
                {canCreate && <CreateLessonDialog moduleId={moduleId} />}
            </div>

            {lessons.length === 0 ? (
                <EmptyLessons moduleId={moduleId} canCreate={canCreate} />
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={lessons.map((l) => l._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {lessons.map((lesson) => (
                                <LessonListItem
                                    key={lesson._id}
                                    lesson={lesson}
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
    );
}

