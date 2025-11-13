import { LearnerCourseCard } from "@/components/shared/learner-course-card"
import { LoadingPage } from "@/components/shared/loading/loading-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useFileUrl } from "@/hooks/use-file"
import { AcademicCapIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"

export const Route = createFileRoute("/_authenticated/c/courses")({
  component: MyCoursesPage,
})

function MyCoursesPage() {
  // Fetch enrolled courses
  const enrolledCourses = useQuery(api.learner.learning.getEnrolledCourses)

  if (enrolledCourses === undefined) {
    return <LoadingPage message="Loading your courses..." />
  }

  // Sort courses by enrollment date (most recent first)
  const sortedCourses = [...enrolledCourses].sort((a, b) => b.enrolledAt - a.enrolledAt)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">My Courses</h1>
          <p className="text-muted-foreground">
            Continue your learning journey or explore new courses
          </p>
        </div>

        {/* Course Grid */}
        {sortedCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedCourses.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment._id}
                enrollment={enrollment}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EnrolledCourseCard({
  enrollment,
}: {
  enrollment: {
    _id: Id<"enrollments">
    courseId: Id<"courses">
    courseTitle: string
    courseDescription: string
    categoryName: string
    coverImageId?: Id<"_storage">
    teacherName: string | null
    enrolledAt: number
  }
}) {
  const { url: coverImageUrl } = useFileUrl(enrollment.coverImageId)

  // Fetch lesson progress for this specific course
  const lessonProgress = useQuery(api.learner.progress.getLessonProgressByCourse, {
    courseId: enrollment.courseId,
  })

  const progress = lessonProgress
    ? {
      completedLessons: lessonProgress.filter((p) => p.completed).length,
      totalLessons: lessonProgress.length,
      percentComplete: lessonProgress.length > 0
        ? Math.round((lessonProgress.filter((p) => p.completed).length / lessonProgress.length) * 100)
        : 0,
      lastAccessedAt: enrollment.enrolledAt,
    }
    : undefined

  return (
    <LearnerCourseCard
      course={{
        _id: enrollment.courseId,
        title: enrollment.courseTitle,
        description: enrollment.courseDescription,
        categoryName: enrollment.categoryName,
        coverImageUrl: coverImageUrl ?? null,
        teacherName: enrollment.teacherName,
        enrolledAt: enrollment.enrolledAt,
      }}
      progress={progress}
    />
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <AcademicCapIcon className="size-8 text-muted-foreground" />
        </div>
        <CardTitle>No Enrolled Courses</CardTitle>
        <CardDescription>
          You haven't enrolled in any courses yet. Browse the course catalog to get started!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link to="/courses">
          <Button>
            <MagnifyingGlassIcon className="mr-2 size-4" />
            Browse Courses
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

