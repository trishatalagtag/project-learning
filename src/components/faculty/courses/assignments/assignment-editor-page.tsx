"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeftIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AssignmentSettingsForm } from "./assignment-settings-form"

export function AssignmentEditorPage() {
    const navigate = useNavigate()
    const { courseId, assignmentId } = useParams({
        from: "/_authenticated/_faculty/f/courses/$courseId/assignments/$assignmentId",
    })

    const assignment = useQuery(api.faculty.assignments.getAssignmentById, {
        assignmentId: assignmentId as Id<"assignments">,
    })
    const publishAssignment = useMutation(api.faculty.assignments.publishAssignment)

    const [isPublishing, setIsPublishing] = useState(false)

    const handlePublish = async () => {
        if (!assignment) return

        setIsPublishing(true)
        try {
            await publishAssignment({ assignmentId: assignmentId as Id<"assignments"> })
            toast.success("Assignment published successfully")
        } catch (error) {
            toast.error("Failed to publish assignment")
            console.error(error)
        } finally {
            setIsPublishing(false)
        }
    }

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

    const getPublishButtonLabel = (status: string) => {
        if (status === "published") return "Published"
        if (status === "pending") return "Pending Approval"
        return "Publish Assignment"
    }

    if (assignment === undefined) {
        return (
            <div className="container mx-auto py-8">
                <Skeleton className="mb-6 h-10 w-32" />
                <div className="space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (assignment === null || !assignment) {
        return (
            <div className="container mx-auto py-8">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Assignment not found</EmptyTitle>
                        <EmptyDescription>The assignment you're looking for doesn't exist.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            onClick={() =>
                                navigate({
                                    to: "/f/courses/$courseId",
                                    params: { courseId },
                                    search: { tab: "assessments" },
                                })
                            }
                        >
                            Back to Assessments
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    const isPublishDisabled = assignment.status === "published" || assignment.status === "pending" || isPublishing

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        navigate({
                            to: "/f/courses/$courseId",
                            params: { courseId },
                            search: { tab: "assessments" },
                        })
                    }
                >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Assessments
                </Button>
            </div>

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-3xl tracking-tight">{assignment.title}</h1>
                        <Badge variant={getStatusColor(assignment.status)} className="capitalize">
                            {assignment.status}
                        </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">{assignment.maxPoints} points</p>
                </div>
                <Button onClick={handlePublish} disabled={isPublishDisabled}>
                    {isPublishing && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                    {getPublishButtonLabel(assignment.status)}
                </Button>
            </div>

            {/* Assignment Settings Form */}
            <AssignmentSettingsForm assignment={assignment} />
        </div>
    )
}
