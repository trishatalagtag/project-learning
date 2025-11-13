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
import { ClipboardDocumentListIcon, PlusIcon } from "@heroicons/react/24/solid"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { useState } from "react"
import { AddQuestionDialog } from "./add-question-dialog"
import { DeleteQuestionDialog } from "./delete-question-dialog"
import { EditQuestionDialog } from "./edit-question-dialog"
import { QuestionCard } from "./question-card"

type Quiz = FunctionReturnType<typeof api.faculty.quizzes.getQuizById>
type Question = NonNullable<Quiz>["questions"][number]

interface QuestionsSectionProps {
    quizId: Id<"quizzes">
}

export function QuestionsSection({ quizId }: QuestionsSectionProps) {
    const quiz = useQuery(api.faculty.quizzes.getQuizById, { quizId })

    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)

    // Note: Drag-and-drop reordering is disabled because the backend doesn't support updating question order
    // To enable this feature, add an 'order' field to the updateQuizQuestion mutation

    if (quiz === undefined) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        )
    }

    if (quiz === null || !quiz) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardDocumentListIcon className="h-12 w-12 text-destructive" />
                    </EmptyMedia>
                    <EmptyTitle>Failed to load quiz</EmptyTitle>
                    <EmptyDescription>An error occurred while fetching the quiz. Please try again.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </EmptyContent>
            </Empty>
        )
    }

    const questions = quiz.questions || []

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">Questions</h2>
                <Button onClick={() => setShowAddDialog(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {questions.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ClipboardDocumentListIcon className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No questions yet</EmptyTitle>
                        <EmptyDescription>
                            No questions yet. Add your first question to get started.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Question
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="space-y-3">
                    {questions.map((question, index) => (
                        <QuestionCard
                            key={question._id}
                            question={question}
                            index={index}
                            onEdit={setEditingQuestion}
                            onDelete={setDeletingQuestion}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <AddQuestionDialog quizId={quizId} open={showAddDialog} onOpenChange={setShowAddDialog} />
            <EditQuestionDialog
                question={editingQuestion}
                open={!!editingQuestion}
                onOpenChange={(open) => !open && setEditingQuestion(null)}
            />
            <DeleteQuestionDialog
                question={deletingQuestion}
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
            />
        </div>
    )
}
