import { useContentApproval } from "@/components/admin/courses/tabs/course-content-tab/hooks/use-content-approval"
import { RejectContentDialog } from "@/components/admin/courses/tabs/course-content-tab/reject-content-dialog"
import {
  useDeleteLesson,
  useSubmitLessonForReview,
} from "@/components/shared/content/hooks/use-lesson-mutations"
import { ContentActionBar } from "@/components/shared/controls/content-action-bar"
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
import { useLessonNavigation } from "@/hooks/use-lesson-navigation"
import type { ContentStatus } from "@/lib/constants/content-status"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { canViewUnpublishedContent, ROLE } from "@/lib/rbac/permissions"
import { useUserRole } from "@/lib/rbac/use-user-role"
import type { ModuleWithLessons } from "@/lib/types/navigation"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"
import { RoleActionBar } from "../shared/controls/role-action-bar"
import { PreviewBanner } from "../shared/preview-banner"

interface PreviewLayoutProps {
  courseId: Id<"courses">
  modules: ModuleWithLessons[]
  currentLessonId?: Id<"lessons">
  currentModuleId?: Id<"modules">
  contentStatus: string
  contentType: "lesson" | "module" | "course"
  breadcrumb: {
    courseTitle: string
    moduleTitle?: string
    lessonTitle?: string
  }
  children: ReactNode
  isEditMode?: boolean
  onSave?: () => void
  onCancel?: () => void
  isSaving?: boolean
  tableOfContents?: ReactNode
}

export function PreviewLayout({
  courseId,
  modules,
  currentLessonId,
  currentModuleId,
  contentStatus,
  contentType,
  breadcrumb,
  children,
  isEditMode = false,
  onSave,
  onCancel,
  isSaving = false,
  tableOfContents,
}: PreviewLayoutProps) {
  const userRole = useUserRole()
  const navigate = useNavigate()
  const showPreviewBanner = userRole ? canViewUnpublishedContent(userRole) : false

  // Mutations
  const { execute: deleteLesson, isPending: isDeleting } = useDeleteLesson()
  const { submitForReview } = useSubmitLessonForReview(currentLessonId!)
  const publishLesson = useMutation(api.admin.content.publishLesson)
  const unpublishLesson = useMutation(api.admin.content.unpublishLesson)
  const markLessonComplete = useMutation(api.learner.progress.markLessonComplete)

  // Approval hooks
  const { isApproving, showRejectDialog, setShowRejectDialog, handleApprove, handleReject } =
    useContentApproval({
      contentId: currentLessonId!,
      contentType: "lesson",
    })

  // Lesson progress
  const lessonProgress = useQuery(
    api.learner.progress.getLessonProgressByCourse,
    userRole === ROLE.LEARNER ? { courseId } : "skip",
  )

  const isLessonCompleted =
    lessonProgress?.find((p) => p.lessonId === currentLessonId)?.completed ?? false

  // Navigation
  const navigation = useLessonNavigation(modules, currentLessonId || ("" as Id<"lessons">))

  // State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublished = contentStatus === CONTENT_STATUS.PUBLISHED

  // Handlers
  const handleDelete = async () => {
    if (!currentLessonId) return

    const result = await deleteLesson({ lessonId: currentLessonId })
    if (result.success) {
      setShowDeleteDialog(false)
      navigate({
        to: "/c/$courseId/m/$moduleId",
        params: { courseId, moduleId: currentModuleId! },
      })
    }
  }

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
      await submitForReview()
      toast.success("Lesson submitted for review")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!currentLessonId) return

    setIsPublishing(true)
    try {
      await publishLesson({ lessonId: currentLessonId })
      toast.success("Lesson published - now visible to learners")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!currentLessonId) return

    setIsPublishing(true)
    try {
      await unpublishLesson({ lessonId: currentLessonId })
      toast.success("Lesson unpublished - hidden from learners")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unpublish")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleEdit = () => {
    if (!currentLessonId || !currentModuleId) return

    if (isPublished && userRole === ROLE.ADMIN) {
      setShowEditWarning(true)
    } else {
      navigate({
        to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
        params: { courseId, moduleId: currentModuleId, lessonId: currentLessonId },
        search: { editMode: true },
      })
    }
  }

  const confirmEdit = () => {
    if (!currentLessonId || !currentModuleId) return

    setShowEditWarning(false)
    navigate({
      to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
      params: { courseId, moduleId: currentModuleId, lessonId: currentLessonId },
      search: { editMode: true },
    })
  }

  const handleMarkComplete = async () => {
    if (!currentLessonId) return

    try {
      await markLessonComplete({
        lessonId: currentLessonId,
        completed: !isLessonCompleted,
      })
      toast.success(isLessonCompleted ? "Lesson marked as incomplete" : "Lesson marked as complete")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update progress")
    }
  }

  const canEdit =
    userRole === ROLE.ADMIN ||
    (userRole === ROLE.FACULTY && contentStatus !== CONTENT_STATUS.PUBLISHED)
  const canApprove = userRole === ROLE.ADMIN

  const actionBar =
    (currentLessonId || (onSave && onCancel)) &&
    (userRole && currentLessonId && currentModuleId ? (
      <RoleActionBar
        role={userRole}
        courseId={courseId}
        lessonId={currentLessonId}
        moduleId={currentModuleId}
        lessonStatus={contentStatus}
        isEditMode={isEditMode}
        canEdit={canEdit}
        canApprove={canApprove}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
        onApprove={handleApprove}
        onReject={() => handleReject()}
        onEdit={handleEdit}
        onSubmit={handleSubmitForReview}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDelete={() => setShowDeleteDialog(true)}
        onMarkComplete={handleMarkComplete}
        isApproving={isApproving}
        isSubmitting={isSubmitting}
        isPublishing={isPublishing}
        isLessonCompleted={isLessonCompleted}
        isProgressLoading={lessonProgress === undefined}
        navigation={{
          previous: navigation.previous,
          next: navigation.next,
          currentModuleTitle: breadcrumb.moduleTitle || "",
        }}
      />
    ) : onSave && onCancel ? (
      <ContentActionBar
        isEditMode={isEditMode}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    ) : null)

  return (
    <>
      {/* Main Container */}
      <div className="flex h-screen flex-col bg-background">
        {/* Preview Banner */}
        {showPreviewBanner && contentStatus !== CONTENT_STATUS.PUBLISHED && (
          <PreviewBanner status={contentStatus as ContentStatus} contentType={contentType} />
        )}

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div className="preview-scroll-container flex-1 space-y-4 overflow-y-auto px-6 pb-[50vh]">
              {/* Action Bar */}
              {actionBar && (
                <div className="border-b bg-background/95 px-0 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                  {actionBar}
                </div>
              )}
              {/* article contents */}
              {children}
            </div>
          </div>

          {/* Table of Contents Sidebar */}
          {tableOfContents && (
            <aside className="hidden w-64 shrink-0 border-l bg-muted/30 xl:block">
              <div className="h-full overflow-y-auto p-4">{tableOfContents}</div>
            </aside>
          )}
        </div>
      </div>

      {/* Edit Warning Dialog */}
      {userRole === ROLE.ADMIN && currentLessonId && (
        <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Published Content?</AlertDialogTitle>
              <AlertDialogDescription>
                This lesson is currently published and visible to learners. Changes will be visible
                immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmEdit}>Edit Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Content Dialog */}
      {userRole === ROLE.ADMIN && currentLessonId && (
        <RejectContentDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          contentId={currentLessonId}
          contentType="lesson"
          contentTitle={breadcrumb.lessonTitle || ""}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {(userRole === ROLE.ADMIN || userRole === ROLE.FACULTY) && (
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open)
            if (!open) setDeleteConfirmText("")
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isPublished ? "Delete Published Lesson?" : "Delete Lesson?"}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                {isPublished ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-destructive">
                      WARNING: This lesson is currently live!
                    </p>
                    <p>This will permanently delete:</p>
                    <ul className="list-inside list-disc text-sm">
                      <li>The lesson content</li>
                      <li>All attachments</li>
                      <li>All learner progress data</li>
                    </ul>
                    <p className="font-semibold">This action cannot be undone.</p>
                    <div>
                      <Input
                        type="text"
                        className="mt-1"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    This will permanently delete this lesson and all its attachments. This action
                    cannot be undone.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting || (isPublished && deleteConfirmText !== "DELETE")}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
