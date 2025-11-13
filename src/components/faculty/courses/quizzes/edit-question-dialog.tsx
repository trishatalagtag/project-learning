"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const questionSchema = z.object({
    questionText: z.string().min(5, "Question text must be at least 5 characters"),
    options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty") })).min(2, "At least 2 options required"),
    correctIndex: z.number().min(0),
    points: z.number().min(0.5),
    explanation: z.string().optional(),
})

type QuestionFormData = z.infer<typeof questionSchema>
type Quiz = FunctionReturnType<typeof api.faculty.quizzes.getQuizById>
type Question = NonNullable<Quiz>["questions"][number]

interface EditQuestionDialogProps {
    question: Question | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditQuestionDialog({ question, open, onOpenChange }: EditQuestionDialogProps) {
    const updateQuestion = useMutation(api.faculty.quizzes.updateQuizQuestion)

    const form = useForm<QuestionFormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            questionText: "",
            options: [{ value: "" }, { value: "" }],
            correctIndex: 0,
            points: 1,
            explanation: "",
        },
    })

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "options",
    })

    // Update form when question changes
    useEffect(() => {
        if (question) {
            form.reset({
                questionText: question.questionText,
                options: question.options.map((opt) => ({ value: opt })),
                correctIndex: question.correctIndex,
                points: question.points,
                explanation: question.explanation || "",
            })
            replace(question.options.map((opt) => ({ value: opt })))
        }
    }, [question, form, replace])

    const onSubmit = async (data: QuestionFormData) => {
        if (!question) return

        try {
            await updateQuestion({
                questionId: question._id as Id<"quizQuestions">,
                questionText: data.questionText,
                options: data.options.map((opt) => opt.value),
                correctIndex: data.correctIndex,
                points: data.points,
                explanation: data.explanation || undefined,
            })

            toast.success("Question updated successfully")
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update question")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>Update the question details</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="questionText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your question"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Answer Options</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ value: "" })}
                                    disabled={fields.length >= 6}
                                >
                                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                                    Add Option
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="correctIndex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroup
                                                value={field.value.toString()}
                                                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                            >
                                                <div className="space-y-3">
                                                    {fields.map((item, index) => (
                                                        <div key={item.id} className="flex items-start gap-2">
                                                            <RadioGroupItem
                                                                value={index.toString()}
                                                                id={`option-${index}`}
                                                                className="mt-3"
                                                            />
                                                            <div className="flex-1">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`options.${index}.value`}
                                                                    render={({ field: optionField }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    placeholder={`Option ${index + 1}`}
                                                                                    {...optionField}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            {fields.length > 2 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        remove(index)
                                                                        // Adjust correctIndex if needed
                                                                        const currentCorrect = form.getValues("correctIndex")
                                                                        if (currentCorrect === index) {
                                                                            form.setValue("correctIndex", 0)
                                                                        } else if (currentCorrect > index) {
                                                                            form.setValue("correctIndex", currentCorrect - 1)
                                                                        }
                                                                    }}
                                                                >
                                                                    <MinusCircleIcon className="h-5 w-5 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormDescription>Select the correct answer</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Points</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0.5}
                                            step={0.5}
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>Points awarded for this question</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="explanation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Explanation (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Explain the correct answer"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Shown to students after they submit</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                Update Question
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
