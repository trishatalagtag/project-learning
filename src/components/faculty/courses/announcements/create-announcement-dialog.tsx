"use client"

import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { PlusIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
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

interface CreateAnnouncementDialogProps {
    courseId: Id<"courses">
}

export function CreateAnnouncementDialog({ courseId }: CreateAnnouncementDialogProps) {
    const [open, setOpen] = useState(false)
    const [markdown, setMarkdown] = useState("")
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
        const result = await createAnnouncement.execute({
            courseId,
            title: values.title,
            content: markdown || values.content,
            isPinned: values.isPinned,
        })
        if (result.success) {
            setOpen(false)
            form.reset()
            setMarkdown("")
        }
    }

    const isSubmitting = createAnnouncement.isPending

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Announcement
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                    <DialogDescription>
                        Share important information with learners enrolled in this course
                    </DialogDescription>
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
                                        <FormLabel className="cursor-pointer">
                                            Pin this announcement
                                        </FormLabel>
                                        <p className="text-muted-foreground text-xs">
                                            Pinned announcements appear at the top of the list
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    "Post Announcement"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

