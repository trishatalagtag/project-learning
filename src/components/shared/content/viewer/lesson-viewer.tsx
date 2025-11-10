"use client"

import { EmptyContent } from "@/components/shared/empty/empty-content"
import { LoadingSpinner } from "@/components/shared/loading/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Id } from "@/convex/_generated/dataModel"
import { BookOpenIcon, PaperClipIcon } from "@heroicons/react/24/outline"

import { AttachmentList } from "./attachment-list"
import { useLesson } from "./hooks/use-lesson"
import { MarkdownViewer } from "./viewer/markdown-viewer"

interface LessonViewerProps {
  lessonId: Id<"lessons">
}

export function LessonViewer({ lessonId }: LessonViewerProps) {
  const { lesson, isLoading, isNotFound } = useLesson(lessonId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground text-sm">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (isNotFound || !lesson) {
    return <EmptyContent type="lesson" />
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
          <span>{lesson.courseName}</span>
          <span>→</span>
          <span>{lesson.moduleName}</span>
        </div>
        <h1 className="font-bold text-2xl">{lesson.title}</h1>
        {lesson.description && <p className="mt-2 text-muted-foreground">{lesson.description}</p>}
      </div>

      <Separator />

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content" className="gap-2">
            <BookOpenIcon className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-2">
            <PaperClipIcon className="h-4 w-4" />
            Attachments
            {lesson.attachmentCount > 0 && (
              <span className="ml-1 text-xs">({lesson.attachmentCount})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          {lesson.content ? (
            <MarkdownViewer markdown={lesson.content} />
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground text-sm">No content yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          <AttachmentList lessonId={lessonId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
