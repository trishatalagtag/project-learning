"use client"

import { AdminActionsSection } from "@/components/admin/management/admin-actions-section"
import { CourseDetails } from "@/components/admin/management/course-details"
import { CourseHeader } from "@/components/admin/management/course-header"
import { FacultySection } from "@/components/admin/management/faculty-section"
import { GradingSection } from "@/components/admin/management/grading-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Loader } from "@/components/ui/loader"
import { Text } from "@/components/ui/text"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { api } from "api"
import { useMutation, useQuery } from "convex/react"

export const Route = createFileRoute(
  "/_authenticated/_admin/a/courses/$courseId"
)({
  component: CourseManagement,
})

function CourseManagement() {
  const { courseId } = useParams({ strict: false }) as { courseId: string }

  // Queries
  const course = useQuery(api.faculty.courses.getCourseById, { courseId })

  // Mutations
  const approveCourse = useMutation(api.admin.courses.approveCourse)
  const rejectCourse = useMutation(api.admin.courses.rejectCourse)
  const publishCourse = useMutation(api.admin.courses.publishCourse)
  const unpublishCourse = useMutation(api.admin.courses.unpublishCourse)
  const deleteCourse = useMutation(api.admin.courses.deleteCourse)
  const assignFaculty = useMutation(api.admin.courses.assignFaculty)
  const unassignFaculty = useMutation(api.admin.courses.unassignFaculty)
  const updateCourseGradingConfig = useMutation(
    api.admin.grading.updateCourseGradingConfig
  )

  if (course === undefined) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Loader variant="spin" className="size-8" />
      </Container>
    )
  }

  if (course === null) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Text>Course not found.</Text>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <CourseHeader
          title={course.title}
          status={course.status}
          enrollmentCount={course.enrollmentCount}
          moduleCount={course.moduleCount}
        />

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left Sidebar - Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminActionsSection
                  courseId={courseId}
                  currentStatus={course.status}
                  onApprove={() => approveCourse({ courseId })}
                  onReject={(reason) => rejectCourse({ courseId, reason })}
                  onPublish={() => publishCourse({ courseId })}
                  onUnpublish={() => unpublishCourse({ courseId })}
                  onDelete={() => deleteCourse({ courseId })}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseDetails
                  courseId={course._id}
                  description={course.description}
                  content={course.content}
                  categoryName={course.categoryName}
                  teacherName={course.teacherName}
                  enrollmentCode={course.enrollmentCode}
                  isEnrollmentOpen={course.isEnrollmentOpen}
                  createdAt={course.createdAt}
                  updatedAt={course.updatedAt}
                />
              </CardContent>
            </Card>

            {/* Faculty Management */}
            <Card>
              <CardHeader>
                <CardTitle>Faculty Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <FacultySection
                  courseId={courseId}
                  currentTeacherId={course.teacherId}
                  currentTeacherName={course.teacherName}
                  onAssign={(userId) => assignFaculty({ courseId, userId })}
                  onUnassign={() => unassignFaculty({ courseId })}
                />
              </CardContent>
            </Card>

            {/* Grading Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Grading Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <GradingSection
                  courseId={courseId}
                  currentConfig={course.gradingConfig}
                  onUpdate={(config) =>
                    updateCourseGradingConfig({ courseId, ...config })
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}
