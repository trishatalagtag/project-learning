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
import { useMutation } from "convex/react"
import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

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

  const handleDelete = async () => {
    if (!course) return

    setIsDeleting(true)
    try {
      await deleteCourse({ courseId: course._id })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete course:", error)
      alert(error instanceof Error ? error.message : "Failed to delete course")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{course?.title}"? This action cannot be undone.
            {course && course.enrollmentCount > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                Warning: This course has {course.enrollmentCount} active enrollment(s). You may need
                to unpublish it instead.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
