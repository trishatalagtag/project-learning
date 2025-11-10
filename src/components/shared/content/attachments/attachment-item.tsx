"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { api } from "@/convex/_generated/api"
import { ATTACHMENT_TYPE, ATTACHMENT_TYPE_CONFIG } from "@/lib/constants/attachment-types"
import {
  AcademicCapIcon,
  DocumentTextIcon,
  FolderIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"
import type { FunctionReturnType } from "convex/server"
import { VideoPlayer } from "../viewer/video-player"
import { AssignmentPreview } from "./assignment-preview"
import { QuizPreview } from "./quiz-preview"

type Attachment = FunctionReturnType<typeof api.faculty.attachments.listAttachmentsByLesson>[number]

interface AttachmentItemProps {
  attachment: Attachment
}

export function AttachmentItem({ attachment }: AttachmentItemProps) {
  const getIcon = () => {
    switch (attachment.type) {
      case ATTACHMENT_TYPE.VIDEO:
        return PlayCircleIcon
      case ATTACHMENT_TYPE.QUIZ:
        return QuestionMarkCircleIcon
      case ATTACHMENT_TYPE.ASSIGNMENT:
        return AcademicCapIcon
      case ATTACHMENT_TYPE.GUIDE:
        return DocumentTextIcon
      case ATTACHMENT_TYPE.RESOURCE:
        return FolderIcon
      default:
        return DocumentTextIcon
    }
  }

  const Icon = getIcon()
  const typeConfig = ATTACHMENT_TYPE_CONFIG[attachment.type as keyof typeof ATTACHMENT_TYPE_CONFIG]
  const typeLabel = typeConfig?.label || attachment.type

  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate font-medium text-sm">{attachment.title}</p>
              {attachment.description && (
                <p className="mt-0.5 truncate text-muted-foreground text-xs">
                  {attachment.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="shrink-0">
              {typeLabel}
            </Badge>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4">
            {/* Video */}
            {attachment.type === ATTACHMENT_TYPE.VIDEO && attachment.fileId && (
              <VideoPlayer
                fileId={attachment.fileId}
                title={attachment.title}
                description={attachment.description}
              />
            )}

            {/* Quiz */}
            {attachment.type === ATTACHMENT_TYPE.QUIZ && attachment.quizId && (
              <QuizPreview quizId={attachment.quizId} />
            )}

            {/* Assignment */}
            {attachment.type === ATTACHMENT_TYPE.ASSIGNMENT && attachment.assignmentId && (
              <AssignmentPreview assignmentId={attachment.assignmentId} />
            )}

            {/* Resource */}
            {attachment.type === ATTACHMENT_TYPE.RESOURCE && attachment.fileId && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {attachment.description || "Download this resource"}
                </p>
                {/* Resource download handled by parent */}
              </div>
            )}

            {/* Guide */}
            {attachment.type === ATTACHMENT_TYPE.GUIDE && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {attachment.description || "Interactive guide"}
                </p>
                {attachment.stepCount && (
                  <Badge variant="secondary">{attachment.stepCount} steps</Badge>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
