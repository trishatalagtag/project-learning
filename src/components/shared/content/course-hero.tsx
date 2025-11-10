"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Id } from "@/convex/_generated/dataModel";
import type { ModuleWithLessons } from "@/lib/types/navigation";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

interface CourseHeroProps {
    courseId: Id<"courses">;
    courseTitle: string;
    courseDescription?: string;
    modules: ModuleWithLessons[];
    firstLessonHref?: string;
    totalLessons: number;
    completedLessons: number;
    showProgress?: boolean;
}

export function CourseHero({
    courseTitle,
    courseDescription,
    modules,
    firstLessonHref,
    totalLessons,
    completedLessons,
    showProgress = true,
}: CourseHeroProps) {
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <Card className="border-2">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-3xl mb-2">{courseTitle}</CardTitle>
                    {courseDescription && (
                        <CardDescription className="text-base">
                            {courseDescription}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {showProgress && (
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {completedLessons} of {totalLessons} lessons completed ({progressPercent}%)
                        </p>
                        <Progress value={progressPercent} className="h-2" />
                    </div>
                )}

                {firstLessonHref && (
                    <div className="text-center">
                        <Link to={firstLessonHref}>
                            <Button size="lg" className="w-full sm:w-auto">
                                {completedLessons > 0 ? "Continue Learning" : "Begin Course"}
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Course Content</h3>
                    <div className="space-y-1">
                        {modules.map((module, idx) => (
                            <div key={module._id} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground">{idx + 1}.</span>
                                <div className="flex-1 min-w-0">
                                    <span className="truncate">{module.title}</span>
                                    {module.lessons && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({module.lessons.length} lessons)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

