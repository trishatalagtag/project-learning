"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/convex/_generated/api"
import { ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import type { User } from "../columns"

interface DeactivateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function DeactivateUserDialog({ open, onOpenChange, user }: DeactivateUserDialogProps) {
  const deactivateUser = useMutation(api.admin.users.deactivateUser)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const handleDeactivate = async () => {
    setIsDeactivating(true)
    try {
      await deactivateUser({ authUserId: user._id })
      toast.success(`User ${user.name} has been deactivated`)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to deactivate user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to deactivate user")
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ExclamationTriangleIcon className="h-5 w-5" />
            Deactivate User
          </DialogTitle>
          <DialogDescription>
            This action will deactivate <strong>{user.name}</strong> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Warning:</strong> This will:
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>Prevent the user from logging in</li>
              <li>Automatically drop all active course enrollments</li>
              <li>Disable access to all course materials</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="mb-2 font-semibold text-sm">User Details</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name:</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role:</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Enrollments:</dt>
              <dd className="font-medium">{user.enrolledCoursesCount}</dd>
            </div>
          </dl>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeactivating}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
            {isDeactivating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <XCircleIcon className="mr-2 h-4 w-4" />
                Deactivate User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
