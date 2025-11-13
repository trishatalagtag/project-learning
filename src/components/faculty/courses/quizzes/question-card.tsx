"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { api } from "@/convex/_generated/api"
import { CheckCircleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid"
import type { FunctionReturnType } from "convex/server"

type Quiz = FunctionReturnType<typeof api.faculty.quizzes.getQuizById>
type Question = NonNullable<Quiz>["questions"][number]

interface QuestionCardProps {
    question: Question
    index: number
    onEdit: (question: Question) => void
    onDelete: (question: Question) => void
}

export function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Question Number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                        {index + 1}
                    </div>

                    {/* Question Content */}
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium">{question.questionText}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                            <span>{question.options.length} options</span>
                            <span>•</span>
                            <span>{question.points} points</span>
                            {question.options[question.correctIndex] && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        <span className="line-clamp-1">{question.options[question.correctIndex]}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {question.explanation && (
                            <Badge variant="secondary" className="mt-2">
                                Has explanation
                            </Badge>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(question)}
                            title="Edit question"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(question)}
                            title="Delete question"
                        >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
