"use client"

import { CreateModuleDialog } from "@/components/faculty/courses/modules/create-module-dialog"
import { DeleteModuleDialog } from "@/components/faculty/courses/modules/delete-module-dialog"
import { EditModuleDialog } from "@/components/faculty/courses/modules/edit-module-dialog"
import { FacultyModuleItem } from "@/components/faculty/courses/modules/faculty-module-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
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
import { BookOpenIcon } from "@heroicons/react/24/solid"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface FacultyCourseContentTabProps {
    courseId: Id<"courses">
}

export function FacultyCourseContentTab({ courseId }: FacultyCourseContentTabProps) {
    const modules = useQuery(api.faculty.modules.listModulesByCourse, {
        courseId,
    })

    const reorderModules = useMutation(api.faculty.modules.reorderModules)

    const [expandedModules, setExpandedModules] = useState<Set<Id<"modules">>>(new Set())
    const [editingModule, setEditingModule] = useState<Module | null>(null)
    const [deletingModule, setDeletingModule] = useState<Module | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const toggleModule = (moduleId: Id<"modules">) => {
        setExpandedModules((prev) => {
            const next = new Set(prev)
            if (next.has(moduleId)) {
                next.delete(moduleId)
            } else {
                next.add(moduleId)
            }
            return next
        })
    }

    const expandAll = () => {
        if (modules) {
            setExpandedModules(new Set(modules.map((m) => m._id)))
        }
    }

    const collapseAll = () => {
        setExpandedModules(new Set())
    }

    const allExpanded = useMemo(() => {
        return modules && expandedModules.size === modules.length
    }, [modules, expandedModules])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id || !modules) return

        const oldIndex = modules.findIndex((m) => m._id === active.id)
        const newIndex = modules.findIndex((m) => m._id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const reordered = arrayMove(modules, oldIndex, newIndex)
        const updates = reordered.map((module, index) => ({
            moduleId: module._id,
            order: index,
        }))

        try {
            await reorderModules({
                courseId,
                moduleOrders: updates,
            })
            toast.success("Modules reordered")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to reorder modules"
            toast.error(message)
        }
    }

    // Loading state
    if (modules === undefined) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Loading course content...</p>
                </div>
            </div>
        )
    }

    // Empty state
    if (modules.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <BookOpenIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No modules yet</EmptyTitle>
                                <EmptyDescription>
                                    Create your first module to start building course content.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
                <div className="flex justify-center">
                    <CreateModuleDialog courseId={courseId} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-xl">Course Content</h2>
                    <p className="text-muted-foreground text-sm">
                        {modules.length} {modules.length === 1 ? "module" : "modules"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {modules.length > 1 && (
                        <Button variant="outline" size="sm" onClick={allExpanded ? collapseAll : expandAll}>
                            {allExpanded ? "Collapse All" : "Expand All"}
                        </Button>
                    )}
                    <CreateModuleDialog courseId={courseId} />
                </div>
            </div>

            {/* Modules List with Drag and Drop */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={modules.map((m) => m._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <FacultyModuleItem
                                key={module._id}
                                module={module}
                                courseId={courseId}
                                moduleNumber={index + 1}
                                isExpanded={expandedModules.has(module._id)}
                                onToggle={() => toggleModule(module._id)}
                                onEdit={() => setEditingModule(module)}
                                onDelete={() => setDeletingModule(module)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Edit Module Dialog */}
            {editingModule && (
                <EditModuleDialog
                    open={!!editingModule}
                    onOpenChange={(open) => !open && setEditingModule(null)}
                    module={editingModule}
                />
            )}

            {/* Delete Module Dialog */}
            {deletingModule && (
                <DeleteModuleDialog
                    open={!!deletingModule}
                    onOpenChange={(open) => !open && setDeletingModule(null)}
                    module={deletingModule}
                    courseId={courseId}
                />
            )}
        </div>
    )
}

