"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { api } from "@/convex/_generated/api"
import {
  ChevronDownIcon,
  DocumentTextIcon,
  EyeIcon,
  InformationCircleIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { useState } from "react"

import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { useContentApproval } from "./hooks/use-content-approval"
import { RejectContentDialog } from "./reject-content-dialog"
import { RequestChangesDialog } from "./request-changes-dialog"
import { ApprovalActions } from "./shared/approval-actions"
import { ContentMetadata } from "./shared/content-metadata"
import { StatusBadge } from "./shared/status-badge"
import { StatusConstraintBadge } from "./shared/status-constraint-badge"

type Lesson = FunctionReturnType<typeof api.faculty.lessons.listLessonsByModule>[number]

import type { Id } from "@/convex/_generated/dataModel"

type ModuleStatus = FunctionReturnType<
  typeof api.faculty.modules.listModulesByCourse
>[number]["status"]

interface LessonItemProps {
  lesson: Lesson
  courseId: Id<"courses">
  lessonNumber: number
  moduleStatus: ModuleStatus
  moduleTitle: string
}

export function LessonItem({
  lesson,
  courseId,
  lessonNumber,
  moduleStatus,
  moduleTitle,
}: LessonItemProps) {
  const [showDetails, setShowDetails] = useState(false)

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
    contentId: lesson._id,
    contentType: "lesson",
  })

  const isPending = lesson.status === CONTENT_STATUS.PENDING

  return (
    <>
      <div
        className={`group transition-colors hover:bg-muted/50 ${isPending ? "border-l-4 border-l-destructive bg-destructive/5" : ""
          }`}
      >
        <div className="flex items-start gap-3 px-4 py-3 pl-6">
          {/* Lesson number with better styling */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 font-semibold text-primary text-xs">
            {lessonNumber}
          </div>

          {/* Lesson icon with document indicator */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <DocumentTextIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                  <StatusBadge status={lesson.status} className="text-xs capitalize" />

                  {/* Preview button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/c/$courseId/m/$moduleId/lessons/$lessonId"
                          params={{ courseId, moduleId: lesson.moduleId, lessonId: lesson._id }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <EyeIcon className="mr-1 h-3.5 w-3.5" />
                            <span className="text-xs">View</span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Preview lesson content</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {isPending && (
                    <StatusConstraintBadge moduleStatus={moduleStatus} moduleTitle={moduleTitle} />
                  )}
                </div>

                {lesson.description && !showDetails && (
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                    {lesson.description}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                  {lesson.attachmentCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                            <PaperClipIcon className="h-3.5 w-3.5" />
                            <span className="font-medium">{lesson.attachmentCount}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {lesson.attachmentCount}{" "}
                            {lesson.attachmentCount === 1 ? "attachment" : "attachments"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <ContentMetadata createdAt={lesson.createdAt} updatedAt={lesson.updatedAt} />
                </div>

                {lesson.description && showDetails && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
                    <p className="mb-1 font-medium text-xs">Lesson Description</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                )}

                {isPending && (
                  <div className="mt-3">
                    <ApprovalActions
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onRequestChanges={handleRequestChanges}
                      isApproving={isApproving}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {lesson.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDetails(!showDetails)
                        }}
                      >
                        {showDetails ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <InformationCircleIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{showDetails ? "Hide details" : "Show details"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      <RejectContentDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        contentId={lesson._id}
        contentType="lesson"
        contentTitle={lesson.title}
      />
      <RequestChangesDialog
        open={showRequestChangesDialog}
        onOpenChange={setShowRequestChangesDialog}
        contentId={lesson._id}
        contentType="lesson"
        contentTitle={lesson.title}
      />
    </>
  )
}
