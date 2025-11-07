import { Badge } from "@/components/ui/badge"
import { buttonStyles } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"

type Course = FunctionReturnType<typeof api.learner.courses.listPublicCourses>["courses"][number]

interface CourseCatalogCardProps {
  course: Course
}

export function CourseCatalogCard({ course }: CourseCatalogCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-t-lg bg-primary">
        <span className="font-bold text-5xl text-white opacity-80">
          {course.title.charAt(0).toUpperCase()}
        </span>
      </div>
      <CardHeader className="flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          {course.categoryName && (
            <Badge intent="primary" className="shrink-0">
              {course.categoryName}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
        <div className="mt-3 flex items-center gap-2">
          {course.isEnrollmentOpen ? (
            <Badge intent="success" className="shrink-0">
              Open for Enrollment
            </Badge>
          ) : (
            <Badge intent="danger" className="shrink-0">
              Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardFooter>
        <Link
          to="/courses/$courseId"
          params={{ courseId: course._id }}
          className={cn(buttonStyles({ intent: "outline" }), "w-full")}
        >
          Preview
        </Link>
      </CardFooter>
    </Card>
  )
}
