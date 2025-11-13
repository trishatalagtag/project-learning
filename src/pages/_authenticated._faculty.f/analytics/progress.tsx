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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { AcademicCapIcon, ChartBarIcon, UserGroupIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/_authenticated/_faculty/f/analytics/progress")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Student Progress",
        }
    },
    component: FacultyProgressAnalyticsPage,
})

function FacultyProgressAnalyticsPage() {
    const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null)
    const [search, setSearch] = useState("")

    // Get all courses for this faculty member
    const myCourses = useQuery(api.faculty.courses.getMyCourses, {
        limit: 1000,
        offset: 0,
    })

    // Get progress for selected course
    const courseProgress = useQuery(
        api.faculty.progress.getCourseProgress,
        selectedCourseId ? { courseId: selectedCourseId } : "skip"
    )

    const filteredProgress = useMemo(() => {
        if (!courseProgress) return []

        return courseProgress.filter((progress) => {
            const matchesSearch =
                search.trim().length === 0 ||
                progress.userName.toLowerCase().includes(search.toLowerCase()) ||
                progress.userEmail.toLowerCase().includes(search.toLowerCase())

            return matchesSearch
        })
    }, [courseProgress, search])

    const isLoading = myCourses === undefined
    const hasError = myCourses === null
    const courses = myCourses?.courses ?? []

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
                                <EmptyTitle>Failed to load progress data</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching progress analytics. Please try again.
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
                <h1 className="font-bold text-3xl tracking-tight">Student Progress Analytics</h1>
                <p className="mt-2 text-muted-foreground">
                    Track and analyze student progress across your courses
                </p>
            </div>

            {/* Course Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Course</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : courses.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <AcademicCapIcon className="h-12 w-12" />
                                </EmptyMedia>
                                <EmptyTitle>No courses available</EmptyTitle>
                                <EmptyDescription>
                                    You need to have at least one course to view progress analytics.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button asChild>
                                    <Link to="/f/courses/new">Create Your First Course</Link>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <Select
                            value={selectedCourseId ?? ""}
                            onValueChange={(value) => setSelectedCourseId(value as Id<"courses">)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a course to view progress" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {/* Progress Table */}
            {selectedCourseId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Student Progress</CardTitle>
                            <div className="w-64">
                                <Input
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {courseProgress === undefined ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredProgress.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia>
                                        <UserGroupIcon className="h-12 w-12" />
                                    </EmptyMedia>
                                    <EmptyTitle>No progress data</EmptyTitle>
                                    <EmptyDescription>
                                        {search
                                            ? "No students match your search."
                                            : "No students are enrolled in this course yet."}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Enrollment Status</TableHead>
                                        <TableHead>Lessons</TableHead>
                                        <TableHead>Quizzes</TableHead>
                                        <TableHead>Assignments</TableHead>
                                        <TableHead>Overall Progress</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProgress.map((progress) => (
                                        <TableRow key={progress.userId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{progress.userName}</div>
                                                    <div className="text-muted-foreground text-sm">{progress.userEmail}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">{progress.enrollmentStatus}</span>
                                            </TableCell>
                                            <TableCell>
                                                {progress.completedLessons} / {progress.totalLessons} (
                                                {Math.round(progress.lessonProgress)}%)
                                            </TableCell>
                                            <TableCell>
                                                {progress.completedQuizzes} / {progress.totalQuizzes}
                                                {progress.averageQuizScore !== undefined && (
                                                    <span className="text-muted-foreground text-sm">
                                                        {" "}
                                                        • Avg: {Math.round(progress.averageQuizScore)}%
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {progress.submittedAssignments} / {progress.totalAssignments}
                                                {progress.averageAssignmentScore !== undefined && (
                                                    <span className="text-muted-foreground text-sm">
                                                        {" "}
                                                        • Avg: {Math.round(progress.averageAssignmentScore)}%
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <div className="h-2 w-full rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-primary"
                                                                style={{ width: `${progress.overallProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-sm">
                                                        {Math.round(progress.overallProgress)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        to="/f/courses/$courseId/learners/$userId"
                                                        params={{
                                                            courseId: selectedCourseId as string,
                                                            userId: progress.userId as string,
                                                        }}
                                                    >
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
