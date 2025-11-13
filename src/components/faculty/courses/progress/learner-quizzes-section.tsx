"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface Quiz {
    quizId: string
    quizTitle: string
    attemptCount: number
    bestScore?: number
    latestScore?: number
    lastAttemptAt?: number
}

interface LearnerQuizzesSectionProps {
    quizzes: Quiz[]
}

export function LearnerQuizzesSection({ quizzes }: LearnerQuizzesSectionProps) {
    if (quizzes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No quizzes in this course.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.quizId}
                        className="flex items-center justify-between rounded-md border p-3"
                    >
                        <div className="flex-1">
                            <h3 className="font-medium">{quiz.quizTitle}</h3>
                            <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
                                <span>Attempts: {quiz.attemptCount}</span>
                                {quiz.bestScore !== undefined && (
                                    <span>Best Score: {quiz.bestScore.toFixed(1)}%</span>
                                )}
                                {quiz.latestScore !== undefined && (
                                    <span>Latest Score: {quiz.latestScore.toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                        {quiz.lastAttemptAt && (
                            <span className="text-muted-foreground text-xs">
                                {format(new Date(quiz.lastAttemptAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

