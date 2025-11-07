import { Breadcrumbs, BreadcrumbsItem } from "@/components/ui/breadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"
import { useCourseDetails } from "./course-details"

export function CourseDetailsBreadcrumbs() {
  const { course, isLoading } = useCourseDetails()

  if (isLoading) {
    return <Skeleton className="h-5 w-64" />
  }

  if (!course) return null

  return (
    <Breadcrumbs>
      <BreadcrumbsItem href="/">Home</BreadcrumbsItem>
      <BreadcrumbsItem href="/">Courses</BreadcrumbsItem>
      <BreadcrumbsItem href={`/?categoryId=${course.categoryId}`}>
        {course.categoryName}
      </BreadcrumbsItem>
      <BreadcrumbsItem>{course.title}</BreadcrumbsItem>
    </Breadcrumbs>
  )
}
