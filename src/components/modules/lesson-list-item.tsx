import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon, PlayIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";


import { StatusBadge } from "@/components/shared/status/status-badge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { canViewUnpublishedContent, type UserRole } from "@/lib/rbac/permissions";
import type { FunctionReturnType } from "convex/server";

type CourseLesson = FunctionReturnType<
    typeof api.faculty.lessons.listLessonsByModule
>[number];

interface LessonListItemProps {
    lesson: CourseLesson;
    moduleId: Id<"modules">;
    courseId: Id<"courses">;
    userRole: UserRole;
    isDraggable: boolean;
}

export function LessonListItem({
    lesson,
    moduleId,
    courseId,
    userRole,
    isDraggable,
}: LessonListItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: lesson._id,
        disabled: !isDraggable,
    });

    const showStatus = userRole ? canViewUnpublishedContent(userRole) : false;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
            {isDraggable && (
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing touch-none"
                >
                    <Bars3Icon className="h-5 w-5 text-muted-foreground" />
                </div>
            )}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {lesson.order}
            </div>

            <Link
                to="/c/$courseId/m/$moduleId/lessons/$lessonId"
                params={{ courseId, moduleId, lessonId: lesson._id }}
                className="flex-1 min-w-0"
            >
                <div className="flex items-center gap-2">
                    <PlayIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{lesson.title}</h3>
                    {showStatus && lesson.status !== CONTENT_STATUS.PUBLISHED && (
                        <StatusBadge status={lesson.status} className="text-xs shrink-0" />
                    )}
                </div>
                {lesson.description && (
                    <p className="text-xs text-muted-foreground truncate mt-1">{lesson.description}</p>
                )}
            </Link>
        </div>
    );
}

