import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Id } from "@/convex/_generated/dataModel"
import { AcademicCapIcon, ClockIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"

interface LearnerCourseCardProps {
    course: {
        _id: Id<"courses">
        title: string
        description: string
        categoryName: string
        coverImageUrl: string | null
        teacherName: string | null
        enrolledAt: number
    }
    progress?: {
        completedLessons: number
        totalLessons: number
        percentComplete: number
        lastAccessedAt?: number
    }
}

export function LearnerCourseCard({ course, progress }: LearnerCourseCardProps) {
    const hasProgress = progress && progress.totalLessons > 0
    const progressPercent = hasProgress ? progress.percentComplete : 0

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
                    {progressPercent === 100 && (
                        <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
                    )}
                    {progressPercent > 0 && progressPercent < 100 && (
                        <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
                    )}
                </div>
                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                {course.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="mt-auto space-y-3">
                {/* Progress Bar */}
                {hasProgress && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                                {progress.completedLessons} / {progress.totalLessons} lessons
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-muted-foreground text-xs">{progressPercent}% complete</p>
                    </div>
                )}

                {/* Instructor */}
                {course.teacherName && (
                    <p className="text-muted-foreground text-sm">
                        Instructor: {course.teacherName}
                    </p>
                )}

                {/* Last Accessed */}
                {progress?.lastAccessedAt && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <ClockIcon className="size-3" />
                        <span>Last accessed {new Date(progress.lastAccessedAt).toLocaleDateString()}</span>
                    </div>
                )}

                {/* Action Button */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground text-xs">
                        Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                    </span>
                    <Link to="/c/$courseId" params={{ courseId: course._id }}>
                        <Button size="sm">
                            {progressPercent === 0 ? "Start Course" : "Continue"}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
