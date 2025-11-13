"use client"

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
import { ClipboardDocumentListIcon, DocumentTextIcon, PlusIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { AssignmentCard } from "../assessments/assignment-card"
import { QuizCard } from "../assessments/quiz-card"

interface FacultyAssessmentsTabProps {
    courseId: Id<"courses">
}

export function FacultyAssessmentsTab({ courseId }: FacultyAssessmentsTabProps) {
    const navigate = useNavigate()

    const quizzes = useQuery(api.faculty.quizzes.listQuizzesByCourse, { courseId })
    const assignments = useQuery(api.faculty.assignments.listAssignmentsByCourse, { courseId })

    const isLoading = quizzes === undefined || assignments === undefined

    const handleCreateQuiz = () => {
        navigate({
            to: "/f/courses/$courseId/quizzes/new",
            params: { courseId },
        })
    }

    const handleCreateAssignment = () => {
        navigate({
            to: "/f/courses/$courseId/assignments/new",
            params: { courseId },
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Quizzes Section Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 w-full" />
                        ))}
                    </div>
                </div>

                {/* Assignments Section Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Error states
    if (quizzes === null || assignments === null) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardDocumentListIcon className="h-12 w-12 text-destructive" />
                    </EmptyMedia>
                    <EmptyTitle>Failed to load assessments</EmptyTitle>
                    <EmptyDescription>
                        An error occurred while fetching assessments. Please try again.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </EmptyContent>
            </Empty>
        )
    }

    return (
        <div className="space-y-8">
            {/* Quizzes Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-2xl tracking-tight">Quizzes</h2>
                    <Button onClick={handleCreateQuiz}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Quiz
                    </Button>
                </div>

                {quizzes.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ClipboardDocumentListIcon className="h-12 w-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No quizzes yet</EmptyTitle>
                            <EmptyDescription>
                                No quizzes have been created for this course yet. Create one to get started.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={handleCreateQuiz}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Quiz
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz._id} quiz={quiz} courseId={courseId} />
                        ))}
                    </div>
                )}
            </div>

            {/* Assignments Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-2xl tracking-tight">Assignments</h2>
                    <Button onClick={handleCreateAssignment}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                </div>

                {assignments.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <DocumentTextIcon className="h-12 w-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No assignments yet</EmptyTitle>
                            <EmptyDescription>
                                No assignments have been created for this course yet. Create one to get started.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={handleCreateAssignment}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Assignment
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {assignments.map((assignment) => (
                            <AssignmentCard key={assignment._id} assignment={assignment} courseId={courseId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
