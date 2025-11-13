"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Quiz = FunctionReturnType<typeof api.faculty.quizzes.getQuizById>
type Question = NonNullable<Quiz>["questions"][number]

interface DeleteQuestionDialogProps {
    question: Question | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteQuestionDialog({ question, open, onOpenChange }: DeleteQuestionDialogProps) {
    const deleteQuestion = useMutation(api.faculty.quizzes.deleteQuizQuestion)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!question) return

        setIsDeleting(true)
        try {
            await deleteQuestion({ questionId: question._id as Id<"quizQuestions"> })
            toast.success("Question deleted successfully")
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to delete question")
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this question? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {question && (
                    <div className="rounded-md border bg-muted p-3">
                        <p className="line-clamp-3 text-sm">{question.questionText}</p>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
