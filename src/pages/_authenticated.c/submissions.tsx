import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Id } from "@/convex/_generated/dataModel"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/c/submissions")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: MySubmissionsPage,
})

function MySubmissionsPage() {
    // Fetch all submissions across all assignments
    const submissions = useQuery(api.learner.assessments.getAllMySubmissions)

    if (submissions === undefined) {
        return <LoadingPage message="Loading your submissions..." />
    }

    // Group submissions by course
    const submissionsByCourse = submissions.reduce(
        (acc: any, sub: any) => {
            const courseId = sub.courseId
            if (!acc[courseId]) {
                acc[courseId] = {
                    courseId,
                    courseTitle: sub.courseTitle,
                    submissions: [],
                }
            }
            acc[courseId].submissions.push(sub)
            return acc
        },
        {} as Record<
            string,
            {
                courseId: Id<"courses">
                courseTitle: string
                submissions: any[]
            }
        >
    )

    const courseGroups = Object.values(submissionsByCourse)    return (
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 font-bold text-3xl">My Submissions</h1>
                    <p className="text-muted-foreground">
                        View all your assignment submissions and quiz attempts
                    </p>
                </div>

                {/* Submissions by Course */}
                {courseGroups.length > 0 ? (
                    <div className="space-y-8">
                        {courseGroups.map((group) => (
                            <div key={group.courseId}>
                                <h2 className="mb-4 font-semibold text-xl">{group.courseTitle}</h2>
                                <div className="space-y-4">
                                    {group.submissions.map((submission: any) => (
                                        <SubmissionCard
                                            key={submission._id}
                                            submission={submission}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    )
}

function SubmissionCard({
    submission,
}: {
    submission: {
        _id: Id<"assignmentSubmissions">
        assignmentId: Id<"assignments">
        assignmentTitle: string
        courseId: Id<"courses">
        courseTitle: string
        status: "draft" | "submitted" | "graded"
        score?: number
        feedback?: string
        submittedAt?: number
        gradedAt?: number
        _creationTime: number
    }
}) {
    const statusConfig = {
        draft: { variant: "secondary" as const, label: "Draft" },
        submitted: { variant: "outline" as const, label: "Submitted" },
        graded: { variant: "default" as const, label: "Graded" },
    }

    const config = statusConfig[submission.status]

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant={config.variant}>{config.label}</Badge>
                            {submission.status === "graded" && submission.score !== undefined && (
                                <Badge className="bg-blue-600 text-white">
                                    Score: {submission.score}%
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">{submission.assignmentTitle}</CardTitle>
                        <CardDescription className="mt-1">
                            {submission.status === "draft" && "Save and submit when ready"}
                            {submission.status === "submitted" &&
                                submission.submittedAt &&
                                `Submitted on ${new Date(submission.submittedAt).toLocaleDateString()}`}
                            {submission.status === "graded" &&
                                submission.gradedAt &&
                                `Graded on ${new Date(submission.gradedAt).toLocaleDateString()}`}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {submission.feedback && (
                    <div className="mb-4 rounded-md bg-muted p-4">
                        <p className="mb-1 font-medium text-sm">Instructor Feedback:</p>
                        <p className="text-muted-foreground text-sm">{submission.feedback}</p>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                        Created {new Date(submission._creationTime).toLocaleDateString()}
                    </span>
                    <Link
                        to="/c/$courseId/assignments/$assignmentId"
                        params={{
                            courseId: submission.courseId,
                            assignmentId: submission.assignmentId,
                        }}
                    >
                        <Button size="sm" variant="outline">
                            View Details
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                    <ClipboardDocumentListIcon className="size-8 text-muted-foreground" />
                </div>
                <CardTitle>No Submissions Yet</CardTitle>
                <CardDescription>
                    You haven't submitted any assignments yet. Complete assignments from your enrolled
                    courses to see them here.
                </CardDescription>
            </CardHeader>
        </Card>
    )
}
