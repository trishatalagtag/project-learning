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
import { useCategoryMutations } from "@/hooks/use-category-mutations"
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import type { Category } from "./columns"

interface CategoryDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: Category
    onSuccess?: () => void
}

export function CategoryDeleteDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryDeleteDialogProps) {
    const mutations = useCategoryMutations()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await mutations.delete(category._id)
            if (result.success) {
                onOpenChange(false)
                onSuccess?.()
            }
        } catch (error) {
            console.error("Failed to delete category:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                        Delete Category
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the category &quot;{category.name}&quot;?
                        {category.courseCount > 0 && (
                            <span className="mt-2 block font-medium text-destructive">
                                This category has {category.courseCount} course(s) assigned. You must move or
                                remove these courses before deleting the category.
                            </span>
                        )}
                        {category.level < 3 && (
                            <span className="mt-2 block text-muted-foreground">
                                Make sure this category has no child categories before deleting.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting || category.courseCount > 0}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

