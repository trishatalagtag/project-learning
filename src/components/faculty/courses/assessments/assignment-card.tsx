"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { DocumentTextIcon, PencilIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"

type Assignment = FunctionReturnType<typeof api.faculty.assignments.listAssignmentsByCourse>[number]

interface AssignmentCardProps {
    assignment: Assignment
    courseId: Id<"courses">
}

export function AssignmentCard({ assignment, courseId }: AssignmentCardProps) {
    const navigate = useNavigate()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "default"
            case "draft":
                return "secondary"
            case "pending":
                return "outline"
            case "rejected":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const handleEdit = () => {
        navigate({
            to: "/f/courses/$courseId/assignments/$assignmentId",
            params: { courseId, assignmentId: assignment._id as any },
        })
    }

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DocumentTextIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="line-clamp-1 text-lg">{assignment.title}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                                {assignment.description || "No description provided"}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant={getStatusColor(assignment.status)} className="shrink-0 capitalize">
                        {assignment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    <div>
                        <span className="font-medium">{assignment.maxPoints}</span> points
                    </div>
                    {assignment.submissionCount !== undefined && (
                        <div>
                            <span className="font-medium">{assignment.submissionCount}</span> submissions
                        </div>
                    )}
                    {assignment.dueDate && (
                        <div>
                            <span className="text-xs">Due: {format(new Date(assignment.dueDate), "MMM d, yyyy h:mm a")}</span>
                        </div>
                    )}
                </div>

                <div className="mt-3 text-muted-foreground text-xs">
                    <div>Created: {format(new Date(assignment.createdAt), "MMM d, yyyy")}</div>
                    <div>Updated: {format(new Date(assignment._creationTime), "MMM d, yyyy")}</div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button onClick={handleEdit} size="sm" className="w-full">
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit Assignment
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
