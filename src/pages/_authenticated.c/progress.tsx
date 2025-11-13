import { LoadingPage } from "@/components/shared/loading/loading-page"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import {
    AcademicCapIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"

export const Route = createFileRoute("/_authenticated/c/progress")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: MyProgressPage,
})

function MyProgressPage() {
    const enrolledCourses = useQuery(api.learner.learning.getEnrolledCourses)
    const progressSummary = useQuery(api.learner.progress.getMyProgress)

    if (enrolledCourses === undefined || progressSummary === undefined) {
        return <LoadingPage message="Loading your progress..." />
    }

    // Use the summary data directly
    const totalCourses = enrolledCourses.length
    const totalLessons = progressSummary.totalLessons
    const completedLessons = progressSummary.lessonsCompleted
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const completedCourses = progressSummary.coursesCompleted
    const inProgressCourses = progressSummary.coursesEnrolled - progressSummary.coursesCompleted

    // For per-course progress, we'll use the getCoursePerformance API
    // For now, show simplified view with enrolled courses
    const courseProgress = enrolledCourses.map((enrollment: any) => ({
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        categoryName: enrollment.categoryName,
        completed: 0,
        total: 0,
        percent: 0,
    }))

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 font-bold text-3xl">My Progress</h1>
                    <p className="text-muted-foreground">
                        Track your learning journey and achievements
                    </p>
                </div>

                {/* Overall Stats */}
                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={AcademicCapIcon}
                        label="Total Courses"
                        value={totalCourses}
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={CheckCircleIcon}
                        label="Completed Courses"
                        value={completedCourses}
                        iconColor="text-green-600"
                    />
                    <StatCard
                        icon={ClockIcon}
                        label="In Progress"
                        value={inProgressCourses}
                        iconColor="text-yellow-600"
                    />
                    <StatCard
                        icon={ChartBarIcon}
                        label="Overall Progress"
                        value={`${overallProgress}%`}
                        iconColor="text-purple-600"
                    />
                </div>

                {/* Overall Progress Bar */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Overall Learning Progress</CardTitle>
                        <CardDescription>
                            {completedLessons} of {totalLessons} lessons completed across all courses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={overallProgress} className="h-3" />
                        <p className="mt-2 text-muted-foreground text-sm">{overallProgress}% complete</p>
                    </CardContent>
                </Card>

                {/* Course-by-Course Progress */}
                <div>
                    <h2 className="mb-4 font-semibold text-2xl">Course Progress</h2>
                    {courseProgress.length > 0 ? (
                        <div className="space-y-4">
                            {courseProgress
                                .sort((a: any, b: any) => b.percent - a.percent)
                                .map((course: any) => (
                                    <CourseProgressCard key={course.courseId} course={course} />
                                ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <AcademicCapIcon className="mb-4 size-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No course progress yet</p>
                                <Link to="/courses" className="mt-4 text-primary text-sm hover:underline">
                                    Browse courses to get started
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({
    icon: Icon,
    label,
    value,
    iconColor,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string | number
    iconColor: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{label}</CardTitle>
                <Icon className={`size-5 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl">{value}</div>
            </CardContent>
        </Card>
    )
}

function CourseProgressCard({
    course,
}: {
    course: {
        courseId: Id<"courses">
        courseTitle: string
        categoryName: string
        completed: number
        total: number
        percent: number
    }
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {course.categoryName}
                            </Badge>
                            {course.percent === 100 && (
                                <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
                            )}
                            {course.percent > 0 && course.percent < 100 && (
                                <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">
                            <Link
                                to="/c/$courseId"
                                params={{ courseId: course.courseId }}
                                className="hover:underline"
                            >
                                {course.courseTitle}
                            </Link>
                        </CardTitle>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-2xl">{course.percent}%</div>
                        <div className="text-muted-foreground text-xs">complete</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Progress value={course.percent} className="mb-2 h-2" />
                <p className="text-muted-foreground text-sm">
                    {course.completed} of {course.total} lessons completed
                </p>
            </CardContent>
        </Card>
    )
}
