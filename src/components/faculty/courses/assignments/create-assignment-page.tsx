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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const createAssignmentSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    submissionType: z.enum(["file", "url", "text"]),
})

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>

export function CreateAssignmentPage() {
    const navigate = useNavigate()
    const { courseId } = useParams({ from: "/_authenticated/_faculty/f/courses/$courseId/assignments/new" })
    const createAssignment = useMutation(api.faculty.assignments.createAssignment)

    const form = useForm<CreateAssignmentFormData>({
        resolver: zodResolver(createAssignmentSchema),
        defaultValues: {
            title: "",
            description: "",
            submissionType: "file",
        },
    })

    const onSubmit = async (data: CreateAssignmentFormData) => {
        try {
            const assignmentId = await createAssignment({
                courseId: courseId as Id<"courses">,
                title: data.title,
                description: data.description,
                submissionType: data.submissionType,
                maxPoints: 100, // Default value
            })

            toast.success("Assignment created successfully")
            navigate({
                to: "/f/courses/$courseId/assignments/$assignmentId",
                params: { courseId, assignmentId: assignmentId as any },
            })
        } catch (error) {
            toast.error("Failed to create assignment")
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
                    <CardTitle>Create New Assignment</CardTitle>
                    <CardDescription>Create a new assignment for your course. You can configure more settings after creating the assignment.</CardDescription>
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
                                            <Input placeholder="Enter assignment title" {...field} />
                                        </FormControl>
                                        <FormDescription>The title of your assignment</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter assignment description"
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Describe what students need to do</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="submissionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Submission Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select submission type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="file">File Upload</SelectItem>
                                                <SelectItem value="url">URL Submission</SelectItem>
                                                <SelectItem value="text">Text Entry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>How students will submit their work</FormDescription>
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
                                    Create Assignment
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
