import { InformationCircleIcon } from "@heroicons/react/24/outline"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCourseDetails } from "./course-details"
import { CourseDetailsEnrollModal } from "./course-details-enroll-modal"

export function CourseDetailsSidebar() {
  const { course, isLoading } = useCourseDetails()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  if (!course) return null

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-fg text-sm">Enrollment Status</span>
          <Badge intent={course.isEnrollmentOpen ? "success" : "warning"}>
            {course.isEnrollmentOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <Separator />
        <DescriptionList>
          <DescriptionTerm>Category</DescriptionTerm>
          <DescriptionDetails>{course.categoryName}</DescriptionDetails>

          {course.teacherName && (
            <>
              <DescriptionTerm>Instructor</DescriptionTerm>
              <DescriptionDetails>{course.teacherName}</DescriptionDetails>
            </>
          )}

          <DescriptionTerm>
            <span className="flex items-center gap-1">
              Last Updated
              <Tooltip>
                <TooltipTrigger aria-label="Last update information">
                  <InformationCircleIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Course content was last modified on this date</TooltipContent>
              </Tooltip>
            </span>
          </DescriptionTerm>
          <DescriptionDetails>{new Date(course.updatedAt).toLocaleDateString()}</DescriptionDetails>

          <DescriptionTerm>Created</DescriptionTerm>
          <DescriptionDetails>{new Date(course.createdAt).toLocaleDateString()}</DescriptionDetails>
        </DescriptionList>
      </CardContent>
      <CardFooter>
        <CourseDetailsEnrollModal />
      </CardFooter>
    </Card>
  )
}
