"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-time-picker"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const quizSettingsSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    instructions: z.string().optional(),
    allowMultipleAttempts: z.boolean(),
    maxAttempts: z.number().min(1).optional(),
    timeLimitMinutes: z.number().min(1).optional(),
    dueDate: z.number().optional(),
    availableFrom: z.number().optional(),
    availableUntil: z.number().optional(),
    gradingMethod: z.enum(["latest", "highest", "average"]),
    showCorrectAnswers: z.boolean(),
    shuffleQuestions: z.boolean(),
    passingScore: z.number().min(0).max(100).optional(),
})

type QuizSettingsFormData = z.infer<typeof quizSettingsSchema>

type Quiz = FunctionReturnType<typeof api.faculty.quizzes.getQuizById>

interface QuizSettingsFormProps {
    quiz: NonNullable<Quiz>
}

export function QuizSettingsForm({ quiz }: QuizSettingsFormProps) {
    const updateQuiz = useMutation(api.faculty.quizzes.updateQuiz)

    const form = useForm<QuizSettingsFormData>({
        resolver: zodResolver(quizSettingsSchema),
        defaultValues: {
            title: quiz.title,
            description: quiz.description || "",
            instructions: quiz.instructions || "",
            allowMultipleAttempts: quiz.allowMultipleAttempts ?? false,
            maxAttempts: quiz.maxAttempts,
            timeLimitMinutes: quiz.timeLimitMinutes,
            dueDate: quiz.dueDate,
            availableFrom: quiz.availableFrom,
            availableUntil: quiz.availableUntil,
            gradingMethod: (quiz.gradingMethod as "latest" | "highest" | "average") || "latest",
            showCorrectAnswers: quiz.showCorrectAnswers ?? true,
            shuffleQuestions: quiz.shuffleQuestions ?? false,
            passingScore: quiz.passingScore,
        },
    })

    const allowMultipleAttempts = form.watch("allowMultipleAttempts")

    // Reset maxAttempts when allowMultipleAttempts is disabled
    useEffect(() => {
        if (!allowMultipleAttempts) {
            form.setValue("maxAttempts", undefined)
        }
    }, [allowMultipleAttempts, form])

    const onSubmit = async (data: QuizSettingsFormData) => {
        try {
            await updateQuiz({
                quizId: quiz._id as Id<"quizzes">,
                title: data.title,
                description: data.description || undefined,
                instructions: data.instructions || undefined,
                allowMultipleAttempts: data.allowMultipleAttempts,
                maxAttempts: data.allowMultipleAttempts ? data.maxAttempts : undefined,
                timeLimitMinutes: data.timeLimitMinutes,
                dueDate: data.dueDate,
                availableFrom: data.availableFrom,
                availableUntil: data.availableUntil,
                gradingMethod: data.gradingMethod,
                showCorrectAnswers: data.showCorrectAnswers,
                shuffleQuestions: data.shuffleQuestions,
                passingScore: data.passingScore,
            })

            toast.success("Quiz settings saved successfully")
        } catch (error) {
            toast.error("Failed to save quiz settings")
            console.error(error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>Configure the settings for your quiz</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter quiz title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter quiz description"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter instructions for students"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Instructions will be shown to students before they start the quiz</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Attempts & Time */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Attempts & Time Limit</h3>

                            <FormField
                                control={form.control}
                                name="allowMultipleAttempts"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Allow Multiple Attempts</FormLabel>
                                            <FormDescription>Let students retake this quiz</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {allowMultipleAttempts && (
                                <FormField
                                    control={form.control}
                                    name="maxAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Attempts</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Unlimited"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Leave empty for unlimited attempts</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="timeLimitMinutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time Limit (minutes)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="No time limit"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Leave empty for no time limit</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Availability */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Availability</h3>

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select due date"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availableFrom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available From (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select start date"
                                            />
                                        </FormControl>
                                        <FormDescription>Quiz will be available starting from this date</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availableUntil"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Until (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select end date"
                                            />
                                        </FormControl>
                                        <FormDescription>Quiz will no longer be available after this date</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Grading */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Grading Options</h3>

                            <FormField
                                control={form.control}
                                name="gradingMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grading Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grading method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="latest">Latest Attempt</SelectItem>
                                                <SelectItem value="highest">Highest Score</SelectItem>
                                                <SelectItem value="average">Average Score</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>How to calculate the final grade when multiple attempts are allowed</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passingScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Passing Score (%) (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="e.g., 70"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Minimum score required to pass (0-100)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="showCorrectAnswers"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Show Correct Answers</FormLabel>
                                            <FormDescription>Display correct answers after submission</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shuffleQuestions"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Shuffle Questions</FormLabel>
                                            <FormDescription>Randomize question order for each student</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                <SaveIcon className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
