import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useAuthParams } from "@/hooks/use-auth-params"
import { authClient } from "@/lib/auth/guards"
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { useState } from "react"

export const Route = createFileRoute("/_public/courses/$courseId")({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { courseId } = Route.useParams()
  const { openModal } = useAuthParams()
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const course = useQuery(api.learner.courses.getPublicCourseDetail, {
    courseId: courseId as Id<"courses">,
  })

  const modules = useQuery(api.learner.courses.getPublicCourseModules, {
    courseId: courseId as Id<"courses">,
  })

  // Check if user is already enrolled
  const enrollment = useQuery(
    api.learner.courses.checkEnrollment,
    session?.user
      ? {
        userId: session.user.id,
        courseId: courseId as Id<"courses">,
      }
      : "skip"
  )

  const [enrollmentCodeDialogOpen, setEnrollmentCodeDialogOpen] = useState(false)
  const [enrollmentCode, setEnrollmentCode] = useState("")
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)

  const enrollMutation = useMutation(api.learner.courses.enrollInCourse)

  const handleEnroll = async () => {
    if (!session?.user) {
      openModal("signup", "LEARNER")
      return
    }

    // If already enrolled, redirect to course
    if (enrollment) {
      navigate({ to: "/c/$courseId", params: { courseId: courseId as Id<"courses"> }} )
      return
    }

    // Check if enrollment code is required
    if (course?.enrollmentCode) {
      setEnrollmentCodeDialogOpen(true)
      return
    }

    // Direct enrollment (no code required)
    if (course?.isEnrollmentOpen) {
      try {
        await enrollMutation({
          courseId: courseId as Id<"courses">,
          enrollmentCode: undefined,
        })
        navigate({ to: "/c/$courseId", params: { courseId: courseId as Id<"courses"> }} )
      } catch (error) {
        console.error("Enrollment failed:", error)
      }
    }
  }

  const handleEnrollWithCode = async () => {
    if (!enrollmentCode.trim()) {
      setEnrollmentError("Please enter an enrollment code")
      return
    }

    try {
      await enrollMutation({
        courseId: courseId as Id<"courses">,
        enrollmentCode: enrollmentCode.trim(),
      })
      setEnrollmentCodeDialogOpen(false)
      navigate({ to: "/c/$courseId", params: { courseId: courseId as Id<"courses"> }} )
    } catch (_error) {
      setEnrollmentError("Invalid enrollment code. Please try again.")
    }
  }

  if (course === undefined || modules === undefined) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (course === null) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AcademicCapIcon className="size-12" />
            </EmptyMedia>
            <EmptyTitle>Course Not Found</EmptyTitle>
            <EmptyDescription>
              This course may have been removed or is not available.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/">
              <Button>
                <ArrowLeftIcon className="mr-2 size-4" />
                Back to Courses
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const totalLessons = modules.reduce((sum, module) => sum + module.lessonCount, 0)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back Button */}
      <Link to="/" className="mb-6 inline-flex items-center text-muted-foreground text-sm hover:underline">
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{course.categoryName}</Badge>
          {course.isEnrollmentOpen ? (
            <Badge className="bg-green-600 text-white">
              <CheckCircleIcon className="mr-1 size-3" />
              Enrollment Open
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircleIcon className="mr-1 size-3" />
              Enrollment Closed
            </Badge>
          )}
          {course.enrollmentCode && (
            <Badge variant="outline">
              <ClockIcon className="mr-1 size-3" />
              Code Required
            </Badge>
          )}
        </div>

        <h1 className="mb-4 font-bold text-3xl sm:text-4xl">{course.title}</h1>
        <p className="mb-4 text-lg text-muted-foreground">{course.description}</p>

        {/* Course Meta */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          {course.teacherName && (
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="size-4" />
              <span>Instructor: {course.teacherName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4" />
            <span>{modules.length} modules</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            <span>{totalLessons} lessons</span>
          </div>
        </div>

        {/* Cover Image */}
        {course.coverImageUrl && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="size-full object-cover"
            />
          </div>
        )}

        {/* Enrollment CTA */}
        <div className="mt-6">
          {enrollment ? (
            <Link to="/c/$courseId" params={{ courseId: courseId as Id<"courses"> }}>
              <Button size="lg" className="w-full sm:w-auto">
                Continue Learning →
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              onClick={handleEnroll}
              disabled={!course.isEnrollmentOpen}
              className="w-full sm:w-auto"
            >
              {session?.user
                ? course.isEnrollmentOpen
                  ? "Enroll in Course"
                  : "Enrollment Closed"
                : "Sign Up to Enroll"}
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Course Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About This Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />
        </CardContent>
      </Card>

      {/* Course Syllabus */}
      <Card>
        <CardHeader>
          <CardTitle>Course Syllabus</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpenIcon className="size-12" />
                </EmptyMedia>
                <EmptyTitle>No modules yet</EmptyTitle>
                <EmptyDescription>
                  The instructor is still preparing the course content.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {modules.map((module, idx) => (
                <div
                  key={module._id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">
                        Module {idx + 1}: {module.title}
                      </h3>
                      <p className="mb-2 text-muted-foreground text-sm">{module.description}</p>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <BookOpenIcon className="size-3" />
                        <span>{module.lessonCount} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Enrollment CTA */}
      {!enrollment && (
        <div className="mt-8 rounded-lg border bg-muted/30 p-6 text-center">
          <h3 className="mb-2 font-semibold text-xl">Ready to start learning?</h3>
          <p className="mb-4 text-muted-foreground">
            {session?.user
              ? "Enroll now and start your agricultural education journey"
              : "Create an account to enroll in this course"}
          </p>
          <Button size="lg" onClick={handleEnroll} disabled={!course.isEnrollmentOpen}>
            {session?.user
              ? course.isEnrollmentOpen
                ? "Enroll in This Course"
                : "Enrollment Closed"
              : "Sign Up to Enroll"}
          </Button>
        </div>
      )}

      {/* Enrollment Code Dialog */}
      <Dialog open={enrollmentCodeDialogOpen} onOpenChange={setEnrollmentCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Enrollment Code</DialogTitle>
            <DialogDescription>
              This course requires an enrollment code. Please enter the code provided by your
              instructor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="enrollmentCode">Enrollment Code</Label>
              <Input
                id="enrollmentCode"
                placeholder="Enter code"
                value={enrollmentCode}
                onChange={(e) => {
                  setEnrollmentCode(e.target.value)
                  setEnrollmentError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEnrollWithCode()
                  }
                }}
              />
              {enrollmentError && (
                <p className="text-destructive text-sm">{enrollmentError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollmentCodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnrollWithCode}>Enroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}