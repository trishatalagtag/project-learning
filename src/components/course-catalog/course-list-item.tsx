import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import type { Id } from "@/convex/_generated/dataModel"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"

interface CourseListItemProps {
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
}

export function CourseListItem({ course }: CourseListItemProps) {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const isNew = course.createdAt > thirtyDaysAgo

    return (
        <Item asChild>
            <Link
                to="/courses/$courseId"
                params={{ courseId: course._id }}
                className="block"
            >
                <ItemMedia variant="image">
                    {course.coverImageUrl ? (
                        <img
                            src={course.coverImageUrl}
                            alt={course.title}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-muted">
                            <AcademicCapIcon className="size-8 text-muted-foreground" />
                        </div>
                    )}
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{course.title}</ItemTitle>
                    <ItemDescription>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {course.categoryName}
                            </Badge>
                            {isNew && (
                                <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                            )}
                            {course.isEnrollmentOpen && (
                                <Badge className="bg-green-600 text-white text-xs">Open</Badge>
                            )}
                        </div>
                        <p className="line-clamp-2 text-sm">{course.description}</p>
                        {course.teacherName && (
                            <p className="mt-1 text-muted-foreground text-xs">
                                Instructor: {course.teacherName}
                            </p>
                        )}
                        <p className="mt-1 text-muted-foreground text-xs">
                            Updated {new Date(course.updatedAt).toLocaleDateString()}
                        </p>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button size="sm">View Course</Button>
                </ItemActions>
            </Link>
        </Item>
    )
}