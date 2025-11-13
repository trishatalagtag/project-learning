import { LoadingPage } from "@/components/shared/loading/loading-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import {
    ArrowUpTrayIcon,
    ClockIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useState } from "react"

export const Route = createFileRoute(
    "/_authenticated/c/$courseId/assignments/$assignmentId"
)({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: AssignmentSubmissionPage,
})

function AssignmentSubmissionPage() {
    const { assignmentId } = Route.useParams()
    const navigate = useNavigate()
    const [textContent, setTextContent] = useState("")

    const assignment = useQuery(api.learner.assessments.getAssignmentDetails, {
        assignmentId: assignmentId as Id<"assignments">,
    })

    const submission = useQuery(api.learner.assessments.getMyAssignmentSubmission, {
        assignmentId: assignmentId as Id<"assignments">,
    })

    const saveDraft = useMutationWithToast(api.learner.assessments.saveAssignmentDraft, {
        successMessage: "Draft saved successfully",
    })

    const submitMutation = useMutationWithToast(api.learner.assessments.submitAssignment, {
        successMessage: "Assignment submitted successfully",
    })

    const handleSaveDraft = async () => {
        if (!submission) return

        await saveDraft.execute({
            assignmentId: assignmentId as Id<"assignments">,
            submissionType: assignment?.submissionType as "text" | "file" | "url",
            textContent,
        })
    }

    const handleSubmit = async () => {
        if (!submission) return

        await submitMutation.execute({
            submissionId: submission._id,
        })
        navigate({ to: "/c/submissions" })
    }

    if (assignment === undefined || submission === undefined) {
        return <LoadingPage message="Loading assignment..." />
    }

    if (!assignment) {
        return (
            <div className="container mx-auto py-6">
                <p className="text-muted-foreground">Assignment not found</p>
            </div>
        )
    }

    const isSubmitted = submission?.status === "submitted" || submission?.status === "graded"
    const displayContent = textContent || submission?.textContent || ""

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-2">
                        {submission?.status && (
                            <Badge
                                variant={
                                    submission.status === "graded"
                                        ? "default"
                                        : submission.status === "submitted"
                                            ? "outline"
                                            : "secondary"
                                }
                            >
                                {submission.status === "draft"
                                    ? "Draft"
                                    : submission.status === "submitted"
                                        ? "Submitted"
                                        : "Graded"}
                            </Badge>
                        )}
                    </div>
                    <h1 className="mb-2 font-bold text-3xl">{assignment.title}</h1>
                    {assignment.description && (
                        <p className="text-muted-foreground">{assignment.description}</p>
                    )}
                </div>

                {/* Assignment Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DocumentTextIcon className="size-5" />
                            Assignment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assignment.instructions && (
                            <div>
                                <h3 className="mb-2 font-medium">Instructions</h3>
                                <div className="rounded-md bg-muted p-4">
                                    <p className="whitespace-pre-wrap text-sm">
                                        {assignment.instructions}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                            {assignment.dueDate && (
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="size-4 text-muted-foreground" />
                                    <span>
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {assignment.totalPoints !== undefined && (
                                <div>
                                    <span className="text-muted-foreground">Max Points:</span>{" "}
                                    {assignment.totalPoints}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Graded Submission View */}
                {submission?.status === "graded" && (
                    <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                        <CardHeader>
                            <CardTitle className="text-green-900 dark:text-green-100">
                                Graded Submission
                            </CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-300">
                                Score: {submission.grade}%
                            </CardDescription>
                        </CardHeader>
                        {submission.teacherFeedback && (
                            <CardContent>
                                <h3 className="mb-2 font-medium text-green-900 dark:text-green-100">
                                    Instructor Feedback
                                </h3>
                                <p className="text-green-700 text-sm dark:text-green-300">
                                    {submission.teacherFeedback}
                                </p>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Submission Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Submission</CardTitle>
                        <CardDescription>
                            {isSubmitted
                                ? "Your submission has been recorded"
                                : "Write your response below"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="content">Response</Label>
                            <Textarea
                                id="content"
                                value={displayContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                disabled={isSubmitted}
                                rows={12}
                                placeholder="Type your answer here..."
                                className="mt-2"
                            />
                        </div>

                        {!isSubmitted && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-600 text-sm">
                                    <ExclamationCircleIcon className="size-4" />
                                    <span>Remember to save your draft regularly</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleSaveDraft}>
                                        Save Draft
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={!displayContent.trim()}>
                                        <ArrowUpTrayIcon className="mr-2 size-4" />
                                        Submit Assignment
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
