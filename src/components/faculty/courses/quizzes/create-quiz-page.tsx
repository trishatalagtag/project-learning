"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const createQuizSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
})

type CreateQuizFormData = z.infer<typeof createQuizSchema>

export function CreateQuizPage() {
    const navigate = useNavigate()
    const { courseId } = useParams({ from: "/_authenticated/_faculty/f/courses/$courseId/quizzes/new" })
    const createQuiz = useMutation(api.faculty.quizzes.createQuiz)

    const form = useForm<CreateQuizFormData>({
        resolver: zodResolver(createQuizSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })

    const onSubmit = async (data: CreateQuizFormData) => {
        try {
            const quizId = await createQuiz({
                courseId: courseId as Id<"courses">,
                title: data.title,
                description: data.description || undefined,
            })

            toast.success("Quiz created successfully")
            navigate({
                to: "/f/courses/$courseId/quizzes/$quizId",
                params: { courseId, quizId: quizId as any },
            })
        } catch (error) {
            toast.error("Failed to create quiz")
            console.error(error)
        }
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
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

            <Card>
                <CardHeader>
                    <CardTitle>Create New Quiz</CardTitle>
                    <CardDescription>Create a new quiz for your course. You can add questions after creating the quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter quiz title" {...field} />
                                        </FormControl>
                                        <FormDescription>The title of your quiz</FormDescription>
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
                                        <FormDescription>A brief description of what this quiz covers</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        navigate({
                                            to: "/f/courses/$courseId",
                                            params: { courseId },
                                            search: { tab: "assessments" },
                                        })
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Quiz
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
