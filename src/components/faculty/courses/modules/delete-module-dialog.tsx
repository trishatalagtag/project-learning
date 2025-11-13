"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import type { FunctionReturnType } from "convex/server"

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface DeleteModuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    module: Module
    courseId?: Id<"courses">
}

export function DeleteModuleDialog({ open, onOpenChange, module }: DeleteModuleDialogProps) {
    const deleteModule = useMutationWithToast(api.faculty.modules.deleteModule, {
        successMessage: "Module deleted successfully",
        errorMessage: "Failed to delete module",
    })

    const handleDelete = async () => {
        const result = await deleteModule.execute({ moduleId: module._id })
        if (result.success) {
            onOpenChange(false)
        }
    }

    const hasLessons = module.lessonCount > 0

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Module</AlertDialogTitle>
                    <AlertDialogDescription>
                        {hasLessons ? (
                            <>
                                This module contains {module.lessonCount} {module.lessonCount === 1 ? "lesson" : "lessons"}. You
                                must delete all lessons before deleting this module.
                            </>
                        ) : (
                            <>
                                Are you sure you want to delete &quot;{module.title}&quot;? This action cannot be undone.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {!hasLessons && (
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Module
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

