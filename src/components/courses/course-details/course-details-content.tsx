import { Card, CardContent } from "@/components/ui/card"

import { Skeleton } from "@/components/ui/skeleton"

import { useCourseDetails } from "./course-details"

export function CourseDetailsContent() {
  const { course, isLoading } = useCourseDetails()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (!course) return null

  return (
    <Card>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6">
        <div dangerouslySetInnerHTML={{ __html: course.content }} />
      </CardContent>
    </Card>
  )
}
