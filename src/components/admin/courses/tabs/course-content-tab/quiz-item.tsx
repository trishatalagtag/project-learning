"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { ClipboardDocumentListIcon, EyeIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { useContentApproval } from "./hooks/use-content-approval"
import { RejectContentDialog } from "./reject-content-dialog"
import { RequestChangesDialog } from "./request-changes-dialog"
import { ApprovalActions } from "./shared/approval-actions"
import { ContentMetadata } from "./shared/content-metadata"
import { StatusBadge } from "./shared/status-badge"

type Quiz = FunctionReturnType<typeof api.faculty.quizzes.listQuizzesByCourse>[number]

interface QuizItemProps {
    quiz: Quiz
    courseId: Id<"courses">
}

export function QuizItem({ quiz, courseId }: QuizItemProps) {
    const {
        isApproving,
        showRejectDialog,
        setShowRejectDialog,
        showRequestChangesDialog,
        setShowRequestChangesDialog,
        handleApprove,
        handleReject,
        handleRequestChanges,
    } = useContentApproval({
        contentId: quiz._id,
        contentType: "quiz",
    })

    const isPending = quiz.status === CONTENT_STATUS.PENDING

    return (
        <>
            <div
                className={`group transition-colors hover:bg-muted/50 ${isPending ? "border-l-4 border-l-destructive bg-destructive/5" : ""
                    }`}
            >
                <div className="flex items-start gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <ClipboardDocumentListIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-medium text-sm">{quiz.title}</h4>
                                    <StatusBadge status={quiz.status as any} className="text-xs capitalize" />

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    to="/a/courses/$courseId"
                                                    params={{ courseId }}
                                                    search={{ tab: "content" }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                                        <EyeIcon className="mr-1 h-3.5 w-3.5" />
                                                        <span className="text-xs">View</span>
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">View in course</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {quiz.description && (
                                    <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                                        {quiz.description}
                                    </p>
                                )}

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                                    <span>{quiz.questionCount || 0} questions</span>
                                    {quiz.timeLimitMinutes && <span>{quiz.timeLimitMinutes} min</span>}
                                    <ContentMetadata createdAt={quiz.createdAt} updatedAt={quiz._creationTime} />
                                </div>

                                {isPending && (
                                    <div className="mt-3">
                                        <ApprovalActions
                                            onApprove={() => handleApprove()}
                                            onReject={handleReject}
                                            onRequestChanges={handleRequestChanges}
                                            isApproving={isApproving}
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RejectContentDialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
                contentId={quiz._id}
                contentType="quiz"
                contentTitle={quiz.title}
            />
            <RequestChangesDialog
                open={showRequestChangesDialog}
                onOpenChange={setShowRequestChangesDialog}
                contentId={quiz._id}
                contentType="quiz"
                contentTitle={quiz.title}
            />
        </>
    )
}


