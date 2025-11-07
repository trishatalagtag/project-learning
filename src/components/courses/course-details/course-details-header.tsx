import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { Skeleton } from "@/components/ui/skeleton"

import { Text } from "@/components/ui/text"

import { useCourseDetails } from "./course-details"

export function CourseDetailsHeader() {
  const { course, isLoading } = useCourseDetails()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="space-y-4">
      <Badge intent="primary">{course.categoryName}</Badge>
      <Heading level={1}>{course.title}</Heading>
      <Text className="text-lg text-muted-fg">{course.description}</Text>
      {course.teacherName && (
        <div className="flex items-center gap-3">
          <Avatar
            size="md"
            initials={course.teacherName
              .split(" ")
              .map((n) => n[0])
              .join("")}
            alt={course.teacherName}
          />
          <div>
            <Text className="text-muted-fg text-sm">Taught by</Text>
            <Text className="font-medium">{course.teacherName}</Text>
          </div>
        </div>
      )}
    </div>
  )
}
