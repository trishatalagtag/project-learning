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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FunctionReturnType } from "convex/server"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const moduleSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface EditModuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    module: Module
}

export function EditModuleDialog({ open, onOpenChange, module }: EditModuleDialogProps) {
    const updateModule = useMutationWithToast(api.faculty.modules.updateModule, {
        successMessage: "Module updated successfully",
        errorMessage: "Failed to update module",
    })

    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            title: module.title,
            description: module.description,
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                title: module.title,
                description: module.description,
            })
        }
    }, [open, module, form])

    const onSubmit = async (values: ModuleFormValues) => {
        const result = await updateModule.execute({
            moduleId: module._id,
            title: values.title,
            description: values.description,
        })
        if (result.success) {
            onOpenChange(false)
        }
    }

    const isSubmitting = updateModule.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Module</DialogTitle>
                    <DialogDescription>Update module details</DialogDescription>
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
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Module"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

