"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import {
    AcademicCapIcon,
    ChartBarIcon,
    UserGroupIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useMemo } from "react"

export const Route = createFileRoute("/_authenticated/_faculty/f/analytics/")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Analytics Overview",
        }
    },
    component: FacultyAnalyticsPage,
})

function FacultyAnalyticsPage() {
    // Get all courses for this faculty member
    const myCourses = useQuery(api.faculty.courses.getMyCourses, {
        limit: 1000,
        offset: 0,
    })

    // Calculate aggregate statistics
    const stats = useMemo(() => {
        if (!myCourses?.courses) {
            return {
                totalCourses: 0,
                totalEnrollments: 0,
                publishedCourses: 0,
                pendingCourses: 0,
                draftCourses: 0,
            }
        }

        const courses = myCourses.courses
        return {
            totalCourses: courses.length,
            totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0),
            publishedCourses: courses.filter((c) => c.status === "published").length,
            pendingCourses: courses.filter((c) => c.status === "pending").length,
            draftCourses: courses.filter((c) => c.status === "draft").length,
        }
    }, [myCourses])

    const isLoading = myCourses === undefined
    const hasError = myCourses === null

    if (hasError) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ChartBarIcon className="h-12 w-12 text-destructive" />
                                </EmptyMedia>
                                <EmptyTitle>Failed to load analytics</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching analytics data. Please try again.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Analytics Overview</h1>
                <p className="mt-2 text-muted-foreground">
                    View insights and statistics for your courses
                </p>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Total Courses</CardTitle>
                            <AcademicCapIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.totalCourses}</div>
                            <p className="text-muted-foreground text-xs">
                                All courses you manage
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Total Enrollments</CardTitle>
                            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.totalEnrollments}</div>
                            <p className="text-muted-foreground text-xs">
                                Students across all courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Published Courses</CardTitle>
                            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.publishedCourses}</div>
                            <p className="text-muted-foreground text-xs">
                                Currently published
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Pending Approval</CardTitle>
                            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.pendingCourses}</div>
                            <p className="text-muted-foreground text-xs">
                                Awaiting admin review
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link to="/f/analytics/progress">
                            <UserGroupIcon className="mr-2 h-4 w-4" />
                            View Student Progress
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/f/courses">
                            <AcademicCapIcon className="mr-2 h-4 w-4" />
                            Manage Courses
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Course List Summary */}
            {!isLoading && myCourses?.courses && myCourses.courses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myCourses.courses.slice(0, 5).map((course) => (
                                <div
                                    key={course._id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <h3 className="font-medium">{course.title}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {course.enrollmentCount ?? 0} enrollments • {course.moduleCount ?? 0} modules
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to="/f/courses/$courseId" params={{ courseId: course._id }}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            {myCourses.courses.length > 5 && (
                                <div className="text-center">
                                    <Button variant="ghost" asChild>
                                        <Link to="/f/courses">View All Courses</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
