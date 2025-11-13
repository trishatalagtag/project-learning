"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Id } from "@/convex/_generated/dataModel"
import { EyeIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import { format } from "date-fns"

interface Assignment {
    assignmentId: Id<"assignments">
    assignmentTitle: string
    submitted: boolean
    graded: boolean
    grade?: number
    maxPoints: number
    submittedAt?: number
}

interface LearnerAssignmentsSectionProps {
    assignments: Assignment[]
    courseId: Id<"courses">
}

export function LearnerAssignmentsSection({
    assignments,
    courseId,
}: LearnerAssignmentsSectionProps) {
    if (assignments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        No assignments in this course.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {assignments.map((assignment) => (
                    <div
                        key={assignment.assignmentId}
                        className="flex items-center justify-between rounded-md border p-3"
                    >
                        <div className="flex-1">
                            <h3 className="font-medium">{assignment.assignmentTitle}</h3>
                            <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
                                {assignment.submitted ? (
                                    <Badge variant="outline">Submitted</Badge>
                                ) : (
                                    <Badge variant="secondary">Not Submitted</Badge>
                                )}
                                {assignment.graded && assignment.grade !== undefined && (
                                    <span>
                                        Grade: {assignment.grade} / {assignment.maxPoints}
                                    </span>
                                )}
                                {assignment.submittedAt && (
                                    <span>
                                        Submitted:{" "}
                                        {format(new Date(assignment.submittedAt), "MMM d, yyyy")}
                                    </span>
                                )}
                            </div>
                        </div>
                        {assignment.submitted && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    to={"/f/courses/$courseId/assignments/$assignmentId/submissions" as any}
                                    params={{ courseId, assignmentId: assignment.assignmentId } as any}
                                    search={{ userId: assignment.assignmentId } as any}
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    View Submission
                                </Link>
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

