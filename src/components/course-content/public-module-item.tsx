"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookOpenIcon, FolderIcon } from "@heroicons/react/24/solid"

interface PublicModuleItemProps {
    title: string
    description?: string | null
    lessonCount: number
    moduleNumber: number
    className?: string
}

export function PublicModuleItem({
    title,
    description,
    lessonCount,
    moduleNumber,
    className,
}: PublicModuleItemProps) {
    return (
        <Card className={cn("transition-all hover:border-primary/60", className)}>
            <div className="flex gap-3 px-4 py-4">
                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderIcon className="h-5 w-5" />
                    </div>
                    <div className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                        {moduleNumber}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-base">{title}</h3>
                    {description && (
                        <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{description}</p>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                            <BookOpenIcon className="h-3.5 w-3.5" />
                            <span className="font-medium">{lessonCount}</span>
                            <span>{lessonCount === 1 ? "Lesson" : "Lessons"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

