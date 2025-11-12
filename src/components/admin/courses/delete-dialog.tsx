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
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useState } from "react"

type CourseForDelete = {
  _id: Id<"courses">
  title: string
  enrollmentCount: number
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: CourseForDelete | null
  onSuccess?: () => void
}

export function DeleteDialog({ open, onOpenChange, course, onSuccess }: DeleteDialogProps) {
  const deleteCourse = useMutation(api.admin.courses.deleteCourse)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!course) return

    setIsDeleting(true)
    setError(null)
    try {
      await deleteCourse({ courseId: course._id })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete course:", error)
      const message = error instanceof Error ? error.message : "Failed to delete course"
      setError(message)
      // Don't close dialog on error
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("")
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{course?.title}"? This action cannot be undone.
            {course && course.enrollmentCount > 0 && (
              <span className="mt-2 block font-medium text-destructive">
                Warning: This course has {course.enrollmentCount} active enrollment(s). You may need
                to unpublish it instead.
              </span>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">
                Type <strong>"{course?.title}"</strong> to confirm deletion:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={course?.title}
                disabled={isDeleting}
                className="font-mono"
              />
            </div>
            {error && (
              <div className="mt-2 rounded-md bg-destructive/10 p-2">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== course?.title}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
