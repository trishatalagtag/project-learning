import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Id } from "@/convex/_generated/dataModel"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"

interface CourseCardProps {
    course: {
        _id: Id<"courses">
        title: string
        description: string
        categoryName: string
        coverImageUrl: string | null
        isEnrollmentOpen: boolean
        teacherName: string | null
        updatedAt: number
        createdAt: number
    }
    showNewBadge?: boolean
}

export function CourseCard({ course, showNewBadge = true }: CourseCardProps) {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const isNew = course.createdAt > thirtyDaysAgo

    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            {/* Cover Image */}
            <div className="-mt-6">
                {course.coverImageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                            src={course.coverImageUrl}
                            alt={course.title}
                            className="size-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted">
                        <AcademicCapIcon className="size-16 text-muted-foreground" />
                    </div>
                )}
            </div>

            <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {course.categoryName}
                    </Badge>
                    {showNewBadge && isNew && (
                        <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                    )}
                    {course.isEnrollmentOpen && (
                        <Badge className="bg-green-600 text-white text-xs">Open</Badge>
                    )}
                </div>
                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                {course.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="mt-auto">
                {course.teacherName && (
                    <p className="mb-3 text-muted-foreground text-sm">
                        Instructor: {course.teacherName}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                        Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                    <Link to="/courses/$courseId" params={{ courseId: course._id }}>
                        <Button size="sm">View Course</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}