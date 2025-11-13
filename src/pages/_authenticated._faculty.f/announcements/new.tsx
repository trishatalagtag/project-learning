"use client"

import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    Form,
    FormControl,
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
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const announcementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    isPinned: z.boolean(),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

export const Route = createFileRoute("/_authenticated/_faculty/f/announcements/new")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Create Announcement",
        }
    },
    component: CreateFacultyAnnouncementPage,
})

function CreateFacultyAnnouncementPage() {
    const navigate = useNavigate()
    const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null)
    const [markdown, setMarkdown] = useState("")

    // Get all courses for this faculty member
    const myCourses = useQuery(api.faculty.courses.getMyCourses, {
        limit: 1000,
        offset: 0,
    })

    const createAnnouncement = useMutationWithToast(api.faculty.announcements.createAnnouncement, {
        successMessage: "Announcement created successfully",
        errorMessage: "Failed to create announcement",
    })

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
            isPinned: false,
        },
    })

    const onSubmit = async (values: AnnouncementFormValues) => {
        if (!selectedCourseId) {
            form.setError("root", { message: "Please select a course" })
            return
        }

        const result = await createAnnouncement.execute({
            courseId: selectedCourseId,
            title: values.title,
            content: markdown || values.content,
            isPinned: values.isPinned,
        })

        if (result.success) {
            navigate({ to: "/f/announcements" })
        }
    }

    const _isLoading = myCourses === undefined
    const hasError = myCourses === null
    const courses = myCourses?.courses ?? []
    const isSubmitting = createAnnouncement.isPending

    if (hasError) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <AcademicCapIcon className="h-12 w-12 text-destructive" />
                                </EmptyMedia>
                                <EmptyTitle>Failed to load courses</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching your courses. Please try again.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (courses.length === 0) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link to="/f/announcements">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back to Announcements
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <AcademicCapIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No courses available</EmptyTitle>
                                <EmptyDescription>
                                    You need to have at least one course to create an announcement.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button asChild>
                                    <Link to="/f/courses/new">Create Your First Course</Link>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link to="/f/announcements">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Announcements
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-medium text-sm">Select Course</label>
                                <Select
                                    value={selectedCourseId ?? ""}
                                    onValueChange={(value) => setSelectedCourseId(value as Id<"courses">)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a course for this announcement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-muted-foreground text-xs">
                                    Select the course where you want to post this announcement
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Welcome to the Course"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <MarkdownEditor
                                                initialMarkdown={markdown || field.value}
                                                onUpdate={(md) => {
                                                    setMarkdown(md)
                                                    field.onChange(md)
                                                }}
                                                placeholder="Write your announcement content here..."
                                                className="min-h-[300px] rounded-md border"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPinned"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="cursor-pointer">Pin this announcement</FormLabel>
                                            <p className="text-muted-foreground text-xs">
                                                Pinned announcements appear at the top of the list
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {form.formState.errors.root && (
                                <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: "/f/announcements" })}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || !selectedCourseId}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        "Post Announcement"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
