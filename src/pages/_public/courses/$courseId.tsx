import {
  CourseDetails,
  CourseDetailsBreadcrumbs,
  CourseDetailsContent,
  CourseDetailsHeader,
  CourseDetailsNotFound,
  CourseDetailsSidebar,
} from "@/components/courses/course-details"
import { buttonStyles } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { createFileRoute, Link } from "@tanstack/react-router"
import { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import { useQuery } from "convex/react"

export const Route = createFileRoute("/_public/courses/$courseId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { courseId } = Route.useParams()
  const course = useQuery(api.learner.courses.getCourseDetails, {
    courseId: courseId as Id<"courses">,
  })

  if (course === null) {
    return <CourseDetailsNotFound />
  }

  return (
    <Container>
      <CourseDetails course={course} isLoading={course === undefined}>
        <div className="my-4 bg-muted">
          <CourseDetailsBreadcrumbs />
        </div>

        <Link to="/" className={cn(buttonStyles({ intent: "plain", size: "sm" }), "mb-6")}>
          <ArrowLeftIcon className="size-4" />
          Back to courses
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CourseDetailsHeader />
            <CourseDetailsContent />
          </div>
          <div>
            <CourseDetailsSidebar />
          </div>
        </div>
      </CourseDetails>
    </Container>
  )
}
