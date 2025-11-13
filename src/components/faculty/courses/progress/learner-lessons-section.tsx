"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { format } from "date-fns"

interface Lesson {
    lessonId: string
    lessonTitle: string
    moduleTitle: string
    completed: boolean
    completedAt?: number
}

interface LearnerLessonsSectionProps {
    lessons: Lesson[]
}

export function LearnerLessonsSection({ lessons }: LearnerLessonsSectionProps) {
    // Group lessons by module
    const lessonsByModule = lessons.reduce((acc, lesson) => {
        if (!acc[lesson.moduleTitle]) {
            acc[lesson.moduleTitle] = []
        }
        acc[lesson.moduleTitle].push(lesson)
        return acc
    }, {} as Record<string, Lesson[]>)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(lessonsByModule).map(([moduleTitle, moduleLessons]) => (
                    <div key={moduleTitle} className="space-y-2">
                        <h3 className="font-semibold text-lg">{moduleTitle}</h3>
                        <div className="space-y-2">
                            {moduleLessons.map((lesson) => (
                                <div
                                    key={lesson.lessonId}
                                    className="flex items-center justify-between rounded-md border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {lesson.completed ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircleIcon className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="font-medium">{lesson.lessonTitle}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {lesson.completed ? (
                                            <Badge variant="default">Completed</Badge>
                                        ) : (
                                            <Badge variant="secondary">Incomplete</Badge>
                                        )}
                                        {lesson.completedAt && (
                                            <span className="text-muted-foreground text-xs">
                                                {format(
                                                    new Date(lesson.completedAt),
                                                    "MMM d, yyyy"
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

