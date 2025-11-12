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
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CheckCircleIcon, EyeIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"

interface ContentPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contentType: "module" | "lesson" | "quiz" | "assignment"
    contentId: string
    onApprove?: () => void
    onReject?: () => void
    onRequestChanges?: () => void
    isApproving?: boolean
    status: string
}

export function ContentPreviewDialog({
    open,
    onOpenChange,
    contentType,
    contentId,
    onApprove,
    onReject,
    onRequestChanges,
    isApproving,
    status,
}: ContentPreviewDialogProps) {
    // Fetch content based on type
    const module = useQuery(
        api.faculty.modules.getModuleById,
        contentType === "module" ? { moduleId: contentId as Id<"modules"> } : "skip"
    )

    const lesson = useQuery(
        api.faculty.lessons.getLessonById,
        contentType === "lesson" ? { lessonId: contentId as Id<"lessons"> } : "skip"
    )

    const quiz = useQuery(
        api.faculty.quizzes.getQuizById,
        contentType === "quiz" ? { quizId: contentId as Id<"quizzes"> } : "skip"
    )

    const assignment = useQuery(
        api.faculty.assignments.getAssignmentById,
        contentType === "assignment" ? { assignmentId: contentId as Id<"assignments"> } : "skip"
    )

    const content = module || lesson || quiz || assignment
    const isPending = status === "pending"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <EyeIcon className="h-5 w-5" />
                        Preview {contentType}
                    </DialogTitle>
                    <DialogDescription>Review content before making approval decision</DialogDescription>
                </DialogHeader>

                {!content ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div>
                            <h3 className="font-bold text-2xl">{content.title}</h3>
                            {content.description && (
                                <p className="mt-2 text-muted-foreground">{content.description}</p>
                            )}
                        </div>

                        {/* Content display - modules and lessons have content, assignments have instructions */}
                        {("content" in content && content.content) && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: content.content }} />
                            </div>
                        )}

                        {contentType === "assignment" && assignment && assignment.instructions && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
                            </div>
                        )}

                        {/* Type-specific previews */}
                        {contentType === "quiz" && quiz && (
                            <div className="space-y-2">
                                <p className="font-medium">
                                    {quiz.questions?.length || 0} questions · {quiz.timeLimitMinutes || "No"} time limit
                                </p>
                                {quiz.passingScore && <p>Passing score: {quiz.passingScore}%</p>}
                                {quiz.instructions && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: quiz.instructions }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {contentType === "assignment" && assignment && (
                            <div className="space-y-2">
                                <p className="font-medium">Max points: {assignment.maxPoints}</p>
                                {assignment.dueDate && (
                                    <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {isPending && onApprove && onReject && onRequestChanges && (
                        <>
                            <Button variant="destructive" onClick={onReject} disabled={isApproving}>
                                <XCircleIcon className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button variant="outline" onClick={onRequestChanges} disabled={isApproving}>
                                Request Changes
                            </Button>
                            <Button onClick={onApprove} disabled={isApproving}>
                                {isApproving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                                        Approve
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

