"use client"

import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useFileUrl } from "@/hooks/use-file"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { CheckIcon, FolderIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FunctionReturnType } from "convex/server"
import { useMutation, useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

type Course = FunctionReturnType<typeof api.faculty.courses.getCourseById>

const titleSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
})

const descriptionSchema = z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
})

const categorySchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
})

interface FacultyCourseSettingsTabProps {
    course: NonNullable<Course>
}

export function FacultyCourseSettingsTab({ course }: FacultyCourseSettingsTabProps) {
    const updateCourse = useMutation(api.faculty.courses.updateCourse)
    const requestApproval = useMutation(api.faculty.courses.requestCourseApproval)
    const categories = useQuery(api.shared.categories.listAllCategories)

    const normalizedCategories = useMemo(
        () => (categories ? normalizeCategoryTree(categories) : []),
        [categories]
    )

    const flatCategories = useMemo(
        () => flattenCategoryTree(normalizedCategories),
        [normalizedCategories]
    )

    const [editingField, setEditingField] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isRequestingApproval, setIsRequestingApproval] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isPublished = course.status === CONTENT_STATUS.PUBLISHED
    const isDraft = course.status === CONTENT_STATUS.DRAFT
    const canEdit = !isPublished
    const canRequestApproval = isDraft && course.moduleCount > 0

    const titleForm = useForm<z.infer<typeof titleSchema>>({
        resolver: zodResolver(titleSchema),
        defaultValues: { title: course.title },
    })

    const descriptionForm = useForm<z.infer<typeof descriptionSchema>>({
        resolver: zodResolver(descriptionSchema),
        defaultValues: { description: course.description },
    })

    const categoryForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { categoryId: course.categoryId },
    })

    const handleSaveTitle = async (values: z.infer<typeof titleSchema>) => {
        if (!canEdit) return
        setIsSaving(true)
        setError(null)
        try {
            await updateCourse({
                courseId: course._id,
                title: values.title,
            })
            toast.success("Course title updated")
            setEditingField(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save"
            setError(message)
            toast.error(message)
        }
        setIsSaving(false)
    }

    const handleSaveDescription = async (values: z.infer<typeof descriptionSchema>) => {
        if (!canEdit) return
        setIsSaving(true)
        setError(null)
        try {
            await updateCourse({
                courseId: course._id,
                description: values.description,
            })
            toast.success("Course description updated")
            setEditingField(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save"
            setError(message)
            toast.error(message)
        }
        setIsSaving(false)
    }

    const handleSaveCategory = async (values: z.infer<typeof categorySchema>) => {
        if (!canEdit) return
        setIsSaving(true)
        setError(null)
        try {
            await updateCourse({
                courseId: course._id,
                categoryId: values.categoryId as Id<"categories">,
            })
            toast.success("Course category updated")
            setEditingField(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save"
            setError(message)
            toast.error(message)
        }
        setIsSaving(false)
    }

    const handleRequestApproval = async () => {
        if (!canRequestApproval) return
        setIsRequestingApproval(true)
        try {
            await requestApproval({ courseId: course._id })
            toast.success("Course submitted for approval")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to request approval"
            toast.error(message)
        }
        setIsRequestingApproval(false)
    }

    const handleCancel = (field: string) => {
        if (field === "title") titleForm.reset()
        if (field === "description") descriptionForm.reset()
        if (field === "category") categoryForm.reset()
        setEditingField(null)
        setError(null)
    }

    const _coverImageUrl = useFileUrl(course.coverImageId)

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Manage core details about this course</CardDescription>
                        {isPublished && (
                            <div className="mt-2 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    This course is published and cannot be edited. Contact an administrator to make
                                    changes.
                                </p>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ItemGroup className="space-y-2">
                            {/* TITLE */}
                            <Item variant="outline" className={editingField === "title" ? "bg-accent/50" : ""}>
                                {editingField === "title" ? (
                                    <div className="flex-1 space-y-3">
                                        <Form {...titleForm}>
                                            <form onSubmit={titleForm.handleSubmit(handleSaveTitle)} className="space-y-3">
                                                <FormField
                                                    control={titleForm.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-medium text-muted-foreground text-xs">
                                                                Course Title
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    autoFocus
                                                                    disabled={isSaving || !canEdit}
                                                                    placeholder="Enter course title"
                                                                    className="h-9"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {error && (
                                                    <div className="rounded-md bg-destructive/10 p-2">
                                                        <p className="text-destructive text-xs">{error}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button type="submit" size="sm" disabled={isSaving || !canEdit} className="gap-2">
                                                                    {isSaving ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                            Saving
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckIcon className="h-4 w-4" />
                                                                            Save
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Save changes</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleCancel("title")}
                                                                    disabled={isSaving}
                                                                    className="gap-2"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                    Cancel
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Discard changes</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                ) : (
                                    <>
                                        <ItemContent>
                                            <ItemTitle className="font-medium text-sm">Course Title</ItemTitle>
                                            <ItemDescription className="mt-1 font-semibold text-base text-foreground">
                                                {course.title}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            {canEdit && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditingField("title")}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                                <span className="sr-only">Edit title</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit title</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </ItemActions>
                                    </>
                                )}
                            </Item>

                            {/* DESCRIPTION */}
                            <Item variant="outline" className={editingField === "description" ? "bg-accent/50" : ""}>
                                {editingField === "description" ? (
                                    <div className="flex-1 space-y-3">
                                        <Form {...descriptionForm}>
                                            <form
                                                onSubmit={descriptionForm.handleSubmit(handleSaveDescription)}
                                                className="space-y-3"
                                            >
                                                <FormField
                                                    control={descriptionForm.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-medium text-muted-foreground text-xs">
                                                                Description
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    rows={4}
                                                                    autoFocus
                                                                    disabled={isSaving || !canEdit}
                                                                    placeholder="Enter course description"
                                                                    className="resize-none"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {error && (
                                                    <div className="rounded-md bg-destructive/10 p-2">
                                                        <p className="text-destructive text-xs">{error}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button type="submit" size="sm" disabled={isSaving || !canEdit} className="gap-2">
                                                                    {isSaving ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                            Saving
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckIcon className="h-4 w-4" />
                                                                            Save
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Save changes</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleCancel("description")}
                                                                    disabled={isSaving}
                                                                    className="gap-2"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                    Cancel
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Discard changes</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                ) : (
                                    <>
                                        <ItemContent>
                                            <ItemTitle className="font-medium text-sm">Description</ItemTitle>
                                            <ItemDescription className="mt-1 whitespace-pre-wrap text-foreground/80 text-sm">
                                                {course.description}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            {canEdit && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditingField("description")}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                                <span className="sr-only">Edit description</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit description</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </ItemActions>
                                    </>
                                )}
                            </Item>

                            {/* CATEGORY */}
                            <Item variant="outline" className={editingField === "category" ? "bg-accent/50" : ""}>
                                {editingField === "category" ? (
                                    <div className="flex-1 space-y-3">
                                        <Form {...categoryForm}>
                                            <form
                                                onSubmit={categoryForm.handleSubmit(handleSaveCategory)}
                                                className="space-y-3"
                                            >
                                                <FormField
                                                    control={categoryForm.control}
                                                    name="categoryId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-medium text-muted-foreground text-xs">
                                                                Category
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                value={field.value}
                                                                disabled={isSaving || !canEdit || categories === undefined}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="h-9">
                                                                        <SelectValue placeholder="Select a category" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {categories === undefined ? (
                                                                        <div className="flex items-center justify-center p-2">
                                                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                        </div>
                                                                    ) : (
                                                                        <SelectGroup>
                                                                            <SelectLabel className="py-1 font-normal text-muted-foreground text-xs">
                                                                                Available Categories
                                                                            </SelectLabel>
                                                                            {flatCategories.map((cat) => (
                                                                                <SelectItem key={cat._id} value={cat._id}>
                                                                                    <span className="flex items-center gap-2">
                                                                                        <FolderIcon className="h-4 w-4 opacity-60" />
                                                                                        <span>
                                                                                            {"\u00A0\u00A0".repeat(cat.level - 1)}
                                                                                            {cat.level > 1 && "└─ "}
                                                                                            {cat.name}
                                                                                        </span>
                                                                                    </span>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {error && (
                                                    <div className="rounded-md bg-destructive/10 p-2">
                                                        <p className="text-destructive text-xs">{error}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button type="submit" size="sm" disabled={isSaving || !canEdit} className="gap-2">
                                                                    {isSaving ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                            Saving
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckIcon className="h-4 w-4" />
                                                                            Save
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Save changes</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleCancel("category")}
                                                                    disabled={isSaving}
                                                                    className="gap-2"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                    Cancel
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Discard changes</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                ) : (
                                    <>
                                        <ItemContent>
                                            <ItemTitle className="font-medium text-sm">Category</ItemTitle>
                                            <ItemDescription className="mt-1 text-foreground/80 text-sm">
                                                {course.categoryName}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            {canEdit && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditingField("category")}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                                <span className="sr-only">Edit category</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit category</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </ItemActions>
                                    </>
                                )}
                            </Item>

                            {/* STATUS */}
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="font-medium text-sm">Status</ItemTitle>
                                    <div className="mt-1">
                                        <Badge
                                            variant={course.status === CONTENT_STATUS.PUBLISHED ? "default" : "secondary"}
                                            className="capitalize"
                                        >
                                            {course.status}
                                        </Badge>
                                    </div>
                                </ItemContent>
                            </Item>

                            {/* COURSE CONTENT */}
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="font-medium text-sm">Course Content</ItemTitle>
                                    <ItemDescription className="mt-2">
                                        {course.content ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <MarkdownViewer markdown={course.content} />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No content provided</span>
                                        )}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </ItemGroup>
                    </CardContent>
                </Card>

                {/* Enrollment Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Settings</CardTitle>
                        <CardDescription>Manage course enrollment access</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ItemGroup className="space-y-2">
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>Open Enrollment</ItemTitle>
                                    <ItemDescription>Allow students to enroll in this course</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Switch
                                        checked={course.isEnrollmentOpen}
                                        disabled={!canEdit}
                                        onCheckedChange={async (checked) => {
                                            try {
                                                await updateCourse({
                                                    courseId: course._id,
                                                    isEnrollmentOpen: checked,
                                                })
                                                toast.success(`Enrollment ${checked ? "opened" : "closed"}`)
                                            } catch (err) {
                                                const message = err instanceof Error ? err.message : "Failed to update enrollment"
                                                toast.error(message)
                                            }
                                        }}
                                    />
                                </ItemActions>
                            </Item>

                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>Enrollment Code</ItemTitle>
                                    <ItemDescription>
                                        {course.enrollmentCode ? (
                                            <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                                {course.enrollmentCode}
                                            </code>
                                        ) : (
                                            "No enrollment code set"
                                        )}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </ItemGroup>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
                {/* Course Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-muted-foreground text-xs">Modules</p>
                            <p className="font-semibold">{course.moduleCount}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Enrollments</p>
                            <p className="font-semibold">{course.enrollmentCount}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Created</p>
                            <p className="font-semibold">{new Date(course.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Last Updated</p>
                            <p className="font-semibold">{new Date(course.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Request Approval */}
                {isDraft && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit for Approval</CardTitle>
                            <CardDescription>
                                Submit your course for administrator review
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Button
                                                onClick={handleRequestApproval}
                                                disabled={!canRequestApproval || isRequestingApproval}
                                                className="w-full"
                                            >
                                                {isRequestingApproval ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    "Request Approval"
                                                )}
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!canRequestApproval && course.moduleCount === 0 && (
                                        <TooltipContent>
                                            <p>Add at least one module before requesting approval</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

