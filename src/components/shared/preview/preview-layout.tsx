import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useContentApproval } from "@/components/admin/courses/tabs/course-content-tab/hooks/use-content-approval";
import { RejectContentDialog } from "@/components/admin/courses/tabs/course-content-tab/reject-content-dialog";
import { useDeleteLesson, useSubmitLessonForReview } from "@/components/shared/content/hooks/use-lesson-mutations";
import { TableOfContents } from "@/components/shared/content/table-of-contents";
import type { ContentStatus } from "@/lib/constants/content-status";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useLessonNavigation } from "@/lib/hooks/use-lesson-navigation";
import { useActiveTocId, useToc } from "@/lib/hooks/use-toc";
import { canViewUnpublishedContent, ROLE } from "@/lib/rbac/permissions";
import { useUserRole } from "@/lib/rbac/use-user-role";
import type { ModuleWithLessons } from "@/lib/types/navigation";

import { CourseSidebar } from "@/components/shared/learning/course-sidebar";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { PreviewBanner } from "./preview-banner";
import { RoleActionBar } from "./role-action-bar";

interface PreviewLayoutProps {
    courseId: Id<"courses">;
    courseTitle: string;
    modules: ModuleWithLessons[];
    currentLessonId?: Id<"lessons">;
    currentModuleId?: Id<"modules">;
    contentTitle: string;
    contentStatus: string;
    contentType: "lesson" | "module" | "course";
    breadcrumb: {
        courseTitle: string;
        moduleTitle?: string;
        lessonTitle?: string;
    };
    children: ReactNode;
    // Edit mode props (optional)
    isEditMode?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    isSaving?: boolean;
    contentHtml?: string;
    showToc?: boolean;
}

export function PreviewLayout({
    courseId,
    courseTitle,
    modules,
    currentLessonId,
    currentModuleId,
    contentTitle,
    contentStatus,
    contentType,
    breadcrumb,
    children,
    isEditMode = false,
    onSave,
    onCancel,
    isSaving = false,
    contentHtml,
    showToc = false,
}: PreviewLayoutProps) {
    const userRole = useUserRole();
    const navigate = useNavigate();
    const showPreviewBanner = userRole ? canViewUnpublishedContent(userRole) : false;

    const tocAnchors = useToc(contentHtml || "");
    const activeId = useActiveTocId(tocAnchors.map(a => a.id));

    // Mutations
    const { execute: deleteLesson, isPending: isDeleting } = useDeleteLesson();
    const { submitForReview } = useSubmitLessonForReview(currentLessonId!);
    const publishLesson = useMutation(api.admin.content.publishLesson);
    const unpublishLesson = useMutation(api.admin.content.unpublishLesson);
    const markLessonComplete = useMutation(api.learner.progress.markLessonComplete);

    // Approval hooks
    const {
        isApproving,
        showRejectDialog,
        setShowRejectDialog,
        handleApprove,
        handleReject,
    } = useContentApproval({
        contentId: currentLessonId!,
        contentType: "lesson",
    });

    // Lesson progress for learners
    const lessonProgress = useQuery(
        api.learner.progress.getLessonProgressByCourse,
        userRole === ROLE.LEARNER ? { courseId } : "skip"
    );

    const isLessonCompleted =
        lessonProgress?.find((p) => p.lessonId === currentLessonId)?.completed ?? false;

    // Navigation
    const navigation = useLessonNavigation(modules, currentLessonId || ("" as Id<"lessons">));

    // State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditWarning, setShowEditWarning] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const isPublished = contentStatus === CONTENT_STATUS.PUBLISHED;

    // Handlers
    const handleDelete = async () => {
        if (!currentLessonId) return;

        const result = await deleteLesson({ lessonId: currentLessonId });
        if (result.success) {
            setShowDeleteDialog(false);
            navigate({
                to: "/c/$courseId/m/$moduleId",
                params: { courseId, moduleId: currentModuleId! },
            });
        }
    };

    const handleSubmitForReview = async () => {
        setIsSubmitting(true);
        try {
            await submitForReview();
            toast.success("Lesson submitted for review");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        if (!currentLessonId) return;

        setIsPublishing(true);
        try {
            await publishLesson({ lessonId: currentLessonId });
            toast.success("Lesson published - now visible to learners");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to publish");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (!currentLessonId) return;

        setIsPublishing(true);
        try {
            await unpublishLesson({ lessonId: currentLessonId });
            toast.success("Lesson unpublished - hidden from learners");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to unpublish");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleEdit = () => {
        if (!currentLessonId || !currentModuleId) return;

        if (isPublished && userRole === ROLE.ADMIN) {
            setShowEditWarning(true);
        } else {
            navigate({
                to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
                params: { courseId, moduleId: currentModuleId, lessonId: currentLessonId },
                search: { editMode: true },
            });
        }
    };

    const confirmEdit = () => {
        if (!currentLessonId || !currentModuleId) return;

        setShowEditWarning(false);
        navigate({
            to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
            params: { courseId, moduleId: currentModuleId, lessonId: currentLessonId },
            search: { editMode: true },
        });
    };

    const handleMarkComplete = async () => {
        if (!currentLessonId) return;

        try {
            await markLessonComplete({
                lessonId: currentLessonId,
                completed: !isLessonCompleted,
            });
            toast.success(
                isLessonCompleted ? "Lesson marked as incomplete" : "Lesson marked as complete"
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update progress");
        }
    };

    const statusConfig = {
        draft: { variant: "secondary" as const, label: "Draft" },
        pending: { variant: "outline" as const, label: "Pending Review" },
        approved: { variant: "default" as const, label: "Approved" },
        published: { variant: "default" as const, label: "Published" },
    };

    const config = statusConfig[contentStatus as keyof typeof statusConfig] || statusConfig.draft;

    // Determine permissions
    const canEdit =
        userRole === ROLE.ADMIN || (userRole === ROLE.FACULTY && contentStatus !== CONTENT_STATUS.PUBLISHED);
    const canApprove = userRole === ROLE.ADMIN;

    return (
        <>
            <div className="flex flex-col h-screen bg-background">
                {/* Preview Banner */}
                {showPreviewBanner && contentStatus !== CONTENT_STATUS.PUBLISHED && (
                    <PreviewBanner status={contentStatus as ContentStatus} contentType={contentType} />
                )}

                {/* Main Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <CourseSidebar
                        courseId={courseId}
                        courseTitle={courseTitle}
                        modules={modules}
                    />

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Fixed Header */}
                        <div className="border-b bg-background px-8 py-4 shrink-0">
                            <BreadcrumbNav {...breadcrumb} />
                            <div className="flex items-center gap-3 mt-2">
                                <h1 className="text-3xl font-bold flex-1">{contentTitle}</h1>
                                {showPreviewBanner && (
                                    <Badge variant={config.variant} className="capitalize shrink-0">
                                        {config.label}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="max-w-4xl mx-auto">{children}</div>
                        </div>

                        {/* Fixed Action Bar */}
                        <div className="sticky bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-8 py-4">
                            <div className="max-w-4xl mx-auto">
                                {userRole && currentLessonId && currentModuleId && (
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
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TOC Column */}
                    {showToc && tocAnchors.length > 0 && (
                        <div className="hidden xl:block w-64 border-l bg-muted/30 p-6 overflow-y-auto">
                            <div className="sticky top-6">
                                <TableOfContents
                                    anchors={tocAnchors}
                                    activeId={activeId}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            {userRole === ROLE.ADMIN && currentLessonId && (
                <>
                    {/* Edit Warning Dialog */}
                    <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Edit Published Content?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This lesson is currently published and visible to learners.
                                    <br />
                                    <br />
                                    <strong>Changes will be visible immediately.</strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmEdit}>Edit Anyway</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Dialog */}
                    <RejectContentDialog
                        open={showRejectDialog}
                        onOpenChange={setShowRejectDialog}
                        contentId={currentLessonId}
                        contentType="lesson"
                        contentTitle={contentTitle}
                    />
                </>
            )}

            {/* Delete Dialog */}
            {(userRole === ROLE.ADMIN || userRole === ROLE.FACULTY) && (
                <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={(open) => {
                        setShowDeleteDialog(open);
                        if (!open) setDeleteConfirmText("");
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isPublished ? "DELETE PUBLISHED LESSON?" : "Delete Lesson?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isPublished ? (
                                    <div className="space-y-3">
                                        <p className="font-bold text-destructive">WARNING: This lesson is LIVE!</p>
                                        <p>This will PERMANENTLY delete:</p>
                                        <ul className="list-disc pl-6 space-y-1 text-sm">
                                            <li>The lesson content</li>
                                            <li>All attachments</li>
                                            <li>All learner progress data</li>
                                        </ul>
                                        <p className="font-bold">This action CANNOT be undone!</p>
                                        <div className="pt-2">
                                            <label className="text-sm font-medium">Type "DELETE" to confirm:</label>
                                            <Input
                                                type="text"
                                                className="mt-2"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="DELETE"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        This will permanently delete this lesson and all its attachments. This action
                                        cannot be undone.
                                    </>
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
    );
}
