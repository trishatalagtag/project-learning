"use client"

import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type Submission = NonNullable<
    FunctionReturnType<typeof api.faculty.grading.getSubmissionById>
>

interface GradingFormProps {
    submission: Submission
    courseId: Id<"courses">
    assignmentId: Id<"assignments">
}

const gradingFormSchema = z.object({
    grade: z
        .number()
        .min(0, "Grade cannot be negative")
        .max(1000, "Grade seems too high"),
    teacherFeedback: z.string().optional(),
})

type GradingFormValues = z.infer<typeof gradingFormSchema>

export function GradingForm({ submission, courseId, assignmentId }: GradingFormProps) {
    const navigate = useNavigate()
    const [markdown, setMarkdown] = useState(submission.teacherFeedback || "")

    const isAlreadyGraded = submission.grade !== undefined

    const gradeSubmission = useMutationWithToast(
        api.faculty.grading.gradeSubmission,
        {
            successMessage: "Grade submitted successfully",
            errorMessage: "Failed to submit grade",
        }
    )

    const updateGrade = useMutationWithToast(api.faculty.grading.updateGrade, {
        successMessage: "Grade updated successfully",
        errorMessage: "Failed to update grade",
    })

    const form = useForm<GradingFormValues>({
        resolver: zodResolver(gradingFormSchema),
        defaultValues: {
            grade: submission.grade ?? 0,
            teacherFeedback: submission.teacherFeedback || "",
        },
    })

    const onSubmit = async (values: GradingFormValues) => {
        const mutation = isAlreadyGraded ? updateGrade : gradeSubmission

        const result = await mutation.execute({
            submissionId: submission._id,
            grade: values.grade,
            teacherFeedback: markdown || values.teacherFeedback || "",
        })

        if (result.success) {
            // Optionally navigate back to submissions list
            // Or stay on page to see updated grade
            // For now, we'll stay on page and let the query refetch
        }
    }

    const isSubmitting = gradeSubmission.isPending || updateGrade.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">
                        Maximum points: {submission.assignmentMaxPoints}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    max={submission.assignmentMaxPoints}
                                    placeholder="Enter grade"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter a grade between 0 and {submission.assignmentMaxPoints}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="teacherFeedback"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teacher Feedback</FormLabel>
                            <FormControl>
                                <MarkdownEditor
                                    initialMarkdown={markdown || field.value}
                                    onUpdate={(md) => {
                                        setMarkdown(md)
                                        field.onChange(md)
                                    }}
                                    placeholder="Provide feedback to the student..."
                                    className="min-h-[200px] rounded-md border"
                                />
                            </FormControl>
                            <FormDescription>
                                Optional feedback for the student
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isAlreadyGraded ? "Updating..." : "Submitting..."}
                            </>
                        ) : (
                            isAlreadyGraded ? "Update Grade" : "Submit Grade"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            navigate({
                                to: "/f/courses/$courseId/assignments/$assignmentId/submissions" as any,
                                params: { courseId, assignmentId } as any,
                            })
                        }}
                        disabled={isSubmitting}
                    >
                        Back to Submissions
                    </Button>
                </div>
            </form>
        </Form>
    )
}

