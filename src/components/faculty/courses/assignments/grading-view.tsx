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
import { Loader2 } from "lucide-react"
import { GradingForm } from "./grading-form"
import { GradingViewSkeleton } from "./grading-view-skeleton"
import { SubmissionContent } from "./submission-content"

export function GradingView() {
    const { courseId, assignmentId, submissionId } = useParams({ strict: false })

    const submission = useQuery(api.faculty.grading.getSubmissionById, {
        submissionId: submissionId as Id<"assignmentSubmissions">,
    })

    const isLoading = submission === undefined
    const isError = submission === null

    if (isLoading) {
        return <GradingViewSkeleton />
    }

    if (isError || !submission) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to={"/f/courses/$courseId/assignments/$assignmentId/submissions" as any}
                            params={{ courseId, assignmentId } as any}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Submissions
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
                                <EmptyTitle>Submission Not Found</EmptyTitle>
                                <EmptyDescription>
                                    The submission you're looking for doesn't exist or you don't have
                                    access to it.
                                </EmptyDescription>
                            </EmptyHeader>
                            <Button variant="outline" asChild>
                                <Link
                                    to="/f/courses/$courseId/assignments/$assignmentId/submissions" as any
                                    params={{ courseId, assignmentId } as any}
                                >
                                    Back to Submissions
                                </Link>
                            </Button>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to={"/f/courses/$courseId/assignments/$assignmentId/submissions" as any}
                            params={{ courseId, assignmentId } as any}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Submissions
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-semibold text-2xl">{submission.assignmentTitle}</h1>
                        <p className="text-muted-foreground text-sm">
                            Grading submission by {submission.userName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Left: Submission Content */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SubmissionContent submission={submission} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Grading Form */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grade & Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GradingForm
                                submission={submission}
                                courseId={courseId as Id<"courses">}
                                assignmentId={assignmentId as Id<"assignments">}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

