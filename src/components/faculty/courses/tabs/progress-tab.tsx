"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { LearnerProgressTable } from "../progress/learner-progress-table"
import { LearnerProgressTableSkeleton } from "../progress/learner-progress-table-skeleton"

interface FacultyProgressTabProps {
    courseId: Id<"courses">
}

export function FacultyProgressTab({ courseId }: FacultyProgressTabProps) {
    const progressData = useQuery(api.faculty.progress.getCourseProgress, {
        courseId,
    })

    if (progressData === undefined) {
        return <LearnerProgressTableSkeleton />
    }

    if (progressData === null) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Empty>
                        <EmptyMedia>
                            <Loader2 className="h-12 w-12 text-destructive" />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>Error Loading Progress</EmptyTitle>
                            <EmptyDescription>
                                Failed to load learner progress data. Please try again.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    if (progressData.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Empty>
                        <EmptyMedia>
                            <Loader2 className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>No Learners Enrolled</EmptyTitle>
                            <EmptyDescription>
                                No learners are enrolled in this course yet.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <LearnerProgressTable data={progressData} courseId={courseId} />
        </div>
    )
}

