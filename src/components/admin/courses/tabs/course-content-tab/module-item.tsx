"use client"

import { EmptyLessons } from "@/components/shared/empty/empty-lessons"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  FolderIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { useContentApproval } from "./hooks/use-content-approval"
import { LessonItem } from "./lesson-item"
import { RejectContentDialog } from "./reject-content-dialog"
import { RequestChangesDialog } from "./request-changes-dialog"
import { ApprovalActions } from "./shared/approval-actions"
import { ContentMetadata } from "./shared/content-metadata"
import { StatusBadge } from "./shared/status-badge"

type Module = FunctionReturnType<typeof api.faculty.modules.listModulesByCourse>[number]

interface ModuleItemProps {
  module: Module
  courseId: Id<"courses">
  moduleNumber: number
  isExpanded: boolean
  onToggle: () => void
}

export function ModuleItem({
  module,
  courseId,
  moduleNumber,
  isExpanded,
  onToggle,
}: ModuleItemProps) {
  const lessons = useQuery(
    api.faculty.lessons.listLessonsByModule,
    isExpanded ? { moduleId: module._id } : "skip",
  )

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
    contentId: module._id,
    contentType: "module",
  })

  const isPending = module.status === CONTENT_STATUS.PENDING

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <Card
          className={`transition-all hover:border-primary/50 ${isPending ? "border-l-4 border-l-destructive bg-destructive/5" : ""
            }`}
        >
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-3 px-4 py-4 hover:bg-transparent"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}

                  {/* Module Icon with number badge */}
                  <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderIcon className="h-5 w-5" />
                    </div>
                    <div className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                      {moduleNumber}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-base">{module.title}</h3>
                      <StatusBadge status={module.status} className="shrink-0 capitalize" />
                    </div>
                    {module.description && (
                      <p className="mt-1 line-clamp-1 text-muted-foreground text-sm">
                        {module.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                              <DocumentTextIcon className="h-3.5 w-3.5" />
                              <span className="font-medium">{module.lessonCount}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {module.lessonCount} {module.lessonCount === 1 ? "lesson" : "lessons"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <ContentMetadata createdAt={module.createdAt} updatedAt={module.updatedAt} />
                    </div>
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>

          {isPending && (
            <div className="px-4 pb-3">
              <ApprovalActions
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
                isApproving={isApproving}
                layout="horizontal"
              />
            </div>
          )}

          <CollapsibleContent>
            <div className="border-t bg-muted/30">
              {module.description && (
                <div className="border-border border-b bg-muted/50 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="mb-1 font-medium text-sm">Module Description</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {lessons === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Loading lessons...</span>
                  </div>
                </div>
              ) : lessons.length === 0 ? (
                <div className="px-4 py-8">
                  <EmptyLessons moduleId={module._id} canCreate={false} />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {lessons.map((lesson, index) => (
                    <LessonItem
                      key={lesson._id}
                      lesson={lesson}
                      courseId={courseId}
                      lessonNumber={index + 1}
                      moduleStatus={module.status as Module["status"]}
                      moduleTitle={module.title}
                    />
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <RejectContentDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        contentId={module._id}
        contentType="module"
        contentTitle={module.title}
      />
      <RequestChangesDialog
        open={showRequestChangesDialog}
        onOpenChange={setShowRequestChangesDialog}
        contentId={module._id}
        contentType="module"
        contentTitle={module.title}
      />
    </>
  )
}
