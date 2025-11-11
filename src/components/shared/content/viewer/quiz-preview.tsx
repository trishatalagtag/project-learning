"use client"

import { EmptyContent } from "@/components/shared/empty/empty-content"
import { LoadingSpinner } from "@/components/shared/loading/loading-spinner"
import type { Id } from "@/convex/_generated/dataModel"
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline"
import { useQuiz } from "./hooks/use-quiz"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface QuizPreviewProps {
  quizId: Id<"quizzes">
}

export function QuizPreview({ quizId }: QuizPreviewProps) {
  const { quiz, isLoading, isNotFound } = useQuiz(quizId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isNotFound || !quiz) {
    return <EmptyContent type="lesson" message="Quiz not found" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            {quiz.instructions && (
              <p className="mt-2 text-muted-foreground text-sm">{quiz.instructions}</p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">
            {quiz.questions.length} Questions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quiz Settings */}
        <div className="flex items-center gap-4 text-sm">
          {quiz.timeLimitMinutes && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>{quiz.timeLimitMinutes} minutes</span>
            </div>
          )}
          {quiz.passingScore && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Pass: {quiz.passingScore}%</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Questions */}
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question._id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.questionText}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Multiple Choice
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {question.points} {question.points === 1 ? "point" : "points"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Multiple Choice Options */}
                {question.options && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = question.correctIndex === optIndex
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-start gap-2 rounded-md border p-2 ${
                            isCorrect
                              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                              : "border-border bg-muted/30"
                          }`}
                        >
                          <span className="mt-0.5 font-mono font-semibold text-xs">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="flex-1 text-sm">{option}</span>
                          {isCorrect && (
                            <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-600" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                    <p className="mb-1 font-medium text-blue-900 text-xs dark:text-blue-100">
                      Explanation
                    </p>
                    <p className="text-blue-700 text-xs dark:text-blue-300">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
