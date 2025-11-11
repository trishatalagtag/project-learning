"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { ArrowLeftIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { DeleteDialog } from "./delete-dialog"
import { CourseContentTab } from "./tabs/course-content-tab"
import { CourseGradingTab } from "./tabs/course-grading-tab"
import { CourseSettingsTab } from "./tabs/course-settings-tab/index"

export function CourseDetailPage() {
  const navigate = useNavigate()
  const { courseId } = useParams({ from: "/_authenticated/_admin/a/courses/$courseId" })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch course data
  const course = useQuery(api.admin.courses.getCourseById, {
    courseId: courseId as Id<"courses">,
  })

  if (course === undefined) {
    return (
      <div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Loading course...</EmptyTitle>
            <EmptyDescription>Please wait while we fetch the data.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (!course) {
    return (
      <div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Course not found</EmptyTitle>
            <EmptyDescription>The course you're looking for doesn't exist.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate({ to: "/a/courses" })}>Back to Courses</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/a/courses" })}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-bold text-3xl tracking-tight">{course.title}</h1>
              <p className="text-muted-foreground">{course.categoryName}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="settings" className="space-y-2">
          <TabsList>
            <TabsTrigger value="settings">Settings & Details</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="grading">Grading Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {course && (
              <CourseSettingsTab course={course} onDelete={() => setShowDeleteDialog(true)} />
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <CourseContentTab courseId={courseId as Id<"courses">} />
          </TabsContent>

          <TabsContent value="grading" className="space-y-4">
            <CourseGradingTab courseId={courseId as Id<"courses">} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        course={course}
        onSuccess={() => navigate({ to: "/a/courses" })}
      />
    </>
  )
}
