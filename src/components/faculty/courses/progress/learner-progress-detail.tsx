"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { Link, useParams } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { LearnerAssignmentsSection } from "./learner-assignments-section"
import { LearnerLessonsSection } from "./learner-lessons-section"
import { LearnerProgressDetailSkeleton } from "./learner-progress-detail-skeleton"
import { LearnerQuizzesSection } from "./learner-quizzes-section"

export function LearnerProgressDetail() {
    const { courseId, userId } = useParams({ strict: false })

    const progressData = useQuery(api.faculty.progress.getLearnerProgress, {
        courseId: courseId as Id<"courses">,
        userId: userId as string,
    })

    if (progressData === undefined) {
        return <LearnerProgressDetailSkeleton />
    }

    if (progressData === null) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to="/f/courses/$courseId"
                            params={{ courseId } as any}
                            search={{ tab: "progress" } as any}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Progress
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Empty>
                            <EmptyMedia>
                                <Loader2 className="h-12 w-12 text-destructive" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>Learner Progress Not Found</EmptyTitle>
                                <EmptyDescription>
                                    The learner progress data you're looking for doesn't exist or you
                                    don't have access to it.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { user, enrollment, lessons, quizzes, assignments } = progressData

    // Calculate overall progress
    const totalLessons = lessons.length
    const completedLessons = lessons.filter((l) => l.completed).length
    const overallProgress =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to="/f/courses/$courseId"
                            params={{ courseId } as any}
                            search={{ tab: "progress" } as any}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Progress
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-semibold text-2xl">{user.name}</h1>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Overview Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-muted-foreground text-sm">Overall Progress</p>
                            <p className="font-semibold text-2xl">{overallProgress}%</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Enrollment Status</p>
                            <p className="font-semibold text-lg capitalize">
                                {enrollment.status}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Enrolled Date</p>
                            <p className="font-semibold text-lg">
                                {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                            </p>
                        </div>
                        {enrollment.completedAt && (
                            <div>
                                <p className="text-muted-foreground text-sm">Completed Date</p>
                                <p className="font-semibold text-lg">
                                    {format(new Date(enrollment.completedAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Lessons Section */}
            <LearnerLessonsSection lessons={lessons} />

            {/* Quizzes Section */}
            <LearnerQuizzesSection quizzes={quizzes} />

            {/* Assignments Section */}
            <LearnerAssignmentsSection
                assignments={assignments}
                courseId={courseId as Id<"courses">}
            />
        </div>
    )
}

