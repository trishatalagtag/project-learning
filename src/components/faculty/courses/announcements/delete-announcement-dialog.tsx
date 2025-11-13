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
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import type { FunctionReturnType } from "convex/server"

type Announcement = FunctionReturnType<typeof api.faculty.announcements.listAnnouncements>[number]

interface DeleteAnnouncementDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    announcement: Announcement
}

export function DeleteAnnouncementDialog({
    open,
    onOpenChange,
    announcement,
}: DeleteAnnouncementDialogProps) {
    const deleteAnnouncement = useMutationWithToast(api.faculty.announcements.deleteAnnouncement, {
        successMessage: "Announcement deleted successfully",
        errorMessage: "Failed to delete announcement",
    })

    const handleDelete = async () => {
        const result = await deleteAnnouncement.execute({
            announcementId: announcement._id,
        })
        if (result.success) {
            onOpenChange(false)
        }
    }

    const isDeleting = deleteAnnouncement.isPending

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{announcement.title}&quot;? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <span className="mr-2">Deleting...</span>
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

