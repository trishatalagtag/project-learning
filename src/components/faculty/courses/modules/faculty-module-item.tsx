"use client"

import { CreateLessonDialog } from "@/components/modules/create-lesson-dialog"
import { ModuleLessonList } from "@/components/modules/module-lesson-list"
import { StatusBadge } from "@/components/shared/status/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ROLE } from "@/lib/rbac/permissions"
import {
    ChevronDownIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    FolderIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/solid"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface FacultyModuleItemProps {
    module: Module
    courseId: Id<"courses">
    moduleNumber: number
    isExpanded: boolean
    onToggle: () => void
    onEdit: () => void
    onDelete: () => void
}

export function FacultyModuleItem({
    module,
    courseId,
    moduleNumber,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
}: FacultyModuleItemProps) {
    const lessons = useQuery(
        api.faculty.lessons.listLessonsByModule,
        isExpanded ? { moduleId: module._id } : "skip"
    )

    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <Card className="transition-all hover:border-primary/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="h-auto flex-1 justify-start gap-3 px-0 hover:bg-transparent">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    {isExpanded ? (
                                        <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    )}

                                    <div className="relative">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FolderIcon className="h-5 w-5" />
                                        </div>
                                        <div className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                                            {moduleNumber}
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate font-semibold text-base">{module.title}</h3>
                                            <StatusBadge status={module.status} className="shrink-0 capitalize" />
                                        </div>
                                        {module.description && (
                                            <p className="mt-1 line-clamp-1 text-muted-foreground text-sm">
                                                {module.description}
                                            </p>
                                        )}
                                        <div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
                                            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
                                                <DocumentTextIcon className="h-3.5 w-3.5" />
                                                <span className="font-medium">{module.lessonCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </CollapsibleTrigger>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit module</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-destructive">
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete module</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-4">
                        {module.description && (
                            <div className="mb-4 rounded-md bg-muted/50 p-3">
                                <p className="text-muted-foreground text-sm">{module.description}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Lessons</h4>
                                <CreateLessonDialog moduleId={module._id} />
                            </div>

                            {lessons === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-muted-foreground text-sm">Loading lessons...</p>
                                </div>
                            ) : (
                                <ModuleLessonList
                                    moduleId={module._id}
                                    courseId={courseId}
                                    lessons={lessons}
                                    userRole={ROLE.FACULTY}
                                />
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}

