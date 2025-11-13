"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { api } from "@/convex/_generated/api"
import { STATUS_CONFIG } from "@/lib/constants/content-status"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"

type Course = FunctionReturnType<typeof api.faculty.courses.getMyCourses>["courses"][number]

interface FacultyCourseCardProps {
    course: Course
}

export function FacultyCourseCard({ course }: FacultyCourseCardProps) {
    const statusConfig = STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG] || {
        variant: "secondary" as const,
        label: course.status,
        description: "",
        icon: AcademicCapIcon,
    }

    const StatusIcon = statusConfig.icon

    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            {/* Cover Image Placeholder */}
            <div className="-mt-6">
                <div className="flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted">
                    <AcademicCapIcon className="size-16 text-muted-foreground" />
                </div>
            </div>

            <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusConfig.variant} className="text-xs capitalize">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {course.categoryName}
                    </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                {course.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-muted-foreground text-sm">
                    <span>
                        {course.moduleCount} {course.moduleCount === 1 ? "Module" : "Modules"}
                    </span>
                    <span>
                        {course.enrollmentCount} {course.enrollmentCount === 1 ? "Enrollment" : "Enrollments"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                        Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" asChild>
                        <Link to="/f/courses/$courseId" params={{ courseId: course._id }}>
                            Manage
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

