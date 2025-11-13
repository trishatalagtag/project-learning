"use client"

import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor"
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FunctionReturnType } from "convex/server"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const announcementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

type Announcement = FunctionReturnType<typeof api.faculty.announcements.listAnnouncements>[number]

interface EditAnnouncementDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    announcement: Announcement
}

export function EditAnnouncementDialog({
    open,
    onOpenChange,
    announcement,
}: EditAnnouncementDialogProps) {
    const [markdown, setMarkdown] = useState(announcement.content)
    const updateAnnouncement = useMutationWithToast(api.faculty.announcements.updateAnnouncement, {
        successMessage: "Announcement updated successfully",
        errorMessage: "Failed to update announcement",
    })

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: announcement.title,
            content: announcement.content,
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                title: announcement.title,
                content: announcement.content,
            })
            setMarkdown(announcement.content)
        }
    }, [open, announcement, form])

    const onSubmit = async (values: AnnouncementFormValues) => {
        const result = await updateAnnouncement.execute({
            announcementId: announcement._id,
            title: values.title,
            content: markdown || values.content,
        })
        if (result.success) {
            onOpenChange(false)
        }
    }

    const isSubmitting = updateAnnouncement.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Announcement</DialogTitle>
                    <DialogDescription>Update the announcement details</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

