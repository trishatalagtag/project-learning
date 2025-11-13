"use client"

import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { api } from "@/convex/_generated/api"
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, PaperClipIcon } from "@heroicons/react/24/solid"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"

type Submission = NonNullable<
    FunctionReturnType<typeof api.faculty.grading.getSubmissionById>
>

interface SubmissionContentProps {
    submission: Submission
}

export function SubmissionContent({ submission }: SubmissionContentProps) {
    return (
        <div className="space-y-6">
            {/* Submission Metadata */}
            <div className="space-y-3 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{submission.userName}</p>
                        <p className="text-muted-foreground text-sm">{submission.userEmail}</p>
                    </div>
                    <Badge
                        variant={
                            submission.status === "graded"
                                ? "default"
                                : submission.status === "submitted"
                                    ? "outline"
                                    : "secondary"
                        }
                    >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Submitted Date</p>
                        <p className="font-medium">
                            {submission.submittedAt
                                ? format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")
                                : "Not submitted"}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Attempt Number</p>
                        <p className="font-medium">{submission.attemptNumber}</p>
                    </div>
                </div>

                {submission.isLate && (
                    <Badge variant="destructive" className="w-fit">
                        Late Submission
                    </Badge>
                )}

                {submission.grade !== undefined && (
                    <div>
                        <p className="text-muted-foreground text-sm">Current Grade</p>
                        <p className="font-semibold text-lg">
                            {submission.grade} / {submission.assignmentMaxPoints}
                        </p>
                    </div>
                )}
            </div>

            {/* Submission Content Based on Type */}
            <div className="space-y-4">
                {submission.submissionType === "file" && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <PaperClipIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">File Submission</span>
                        </div>
                        {submission.fileUrl ? (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={submission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                                        Download File
                                    </a>
                                </Button>
                                {/* Show image preview if it's an image */}
                                {submission.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                                    <div className="mt-4">
                                        <img
                                            src={submission.fileUrl}
                                            alt="Submission preview"
                                            className="max-h-96 rounded-md border"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                File URL not available
                            </p>
                        )}
                    </div>
                )}

                {submission.submissionType === "url" && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">URL Submission</span>
                        </div>
                        {submission.url ? (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={submission.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ArrowTopRightOnSquareIcon className="mr-2 h-4 w-4" />
                                    Open URL
                                </a>
                            </Button>
                        ) : (
                            <p className="text-muted-foreground text-sm">URL not provided</p>
                        )}
                    </div>
                )}

                {submission.submissionType === "text" && (
                    <div className="space-y-2">
                        <span className="font-medium">Text Submission</span>
                        {submission.textContent ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4">
                                <MarkdownViewer markdown={submission.textContent} />
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No text content provided
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Current Feedback (if already graded) */}
            {submission.teacherFeedback && (
                <div className="space-y-2 border-t pt-4">
                    <p className="font-medium">Current Feedback</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4">
                        <MarkdownViewer markdown={submission.teacherFeedback} />
                    </div>
                    {submission.gradedAt && submission.gradedByName && (
                        <p className="text-muted-foreground text-xs">
                            Graded by {submission.gradedByName} on{" "}
                            {format(new Date(submission.gradedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

