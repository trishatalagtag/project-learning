"use client"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { PlusIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const moduleSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface CreateModuleDialogProps {
    courseId: Id<"courses">
}

export function CreateModuleDialog({ courseId }: CreateModuleDialogProps) {
    const [open, setOpen] = useState(false)
    const createModule = useMutationWithToast(api.faculty.modules.createModule, {
        successMessage: "Module created successfully",
        errorMessage: "Failed to create module",
    })

    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })

    const onSubmit = async (values: ModuleFormValues) => {
        const result = await createModule.execute({
            courseId,
            title: values.title,
            description: values.description,
            content: "",
        })
        if (result.success) {
            setOpen(false)
            form.reset()
        }
    }

    const isSubmitting = createModule.isPending

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Module
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>Add a new module to organize your course content</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Introduction to Web Development" {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of what this module covers"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Module"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

