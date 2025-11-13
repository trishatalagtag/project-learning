import { LoadingPage } from "@/components/shared/loading/loading-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import {
    CheckCircleIcon,
    DocumentTextIcon,
    XCircleIcon
} from "@heroicons/react/24/solid"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useState } from "react"

export const Route = createFileRoute("/_authenticated/c/$courseId/quizzes/$quizId")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: QuizPage,
})

function QuizPage() {
    const { quizId } = Route.useParams()

    // Fetch quiz details
    const quiz = useQuery(api.learner.assessments.getQuizDetails, {
        quizId: quizId as Id<"quizzes">,
    })

    // Fetch my attempts
    const attempts = useQuery(api.learner.assessments.getMyQuizAttempts, {
        quizId: quizId as Id<"quizzes">,
    })

    if (quiz === undefined || attempts === undefined) {
        return <LoadingPage message="Loading quiz..." />
    }

    if (!quiz) {
        return (
            <div className="container mx-auto py-6">
                <p className="text-muted-foreground">Quiz not found</p>
            </div>
        )
    }

    const hasAttempts = attempts.length > 0
    const canTakeQuiz =
        !quiz.maxAttempts || attempts.length < quiz.maxAttempts || quiz.maxAttempts === 0

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 font-bold text-3xl">{quiz.title}</h1>
                    {quiz.description && (
                        <p className="text-muted-foreground">{quiz.description}</p>
                    )}
                </div>

                {/* Quiz Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DocumentTextIcon className="size-5" />
                            Quiz Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-muted-foreground text-sm">Questions:</span>{" "}
                                <span className="font-medium">{quiz.totalQuestions || 0}</span>
                            </div>
                            {quiz.timeLimitMinutes && (
                                <div>
                                    <span className="text-muted-foreground text-sm">Time Limit:</span>{" "}
                                    <span className="font-medium">{quiz.timeLimitMinutes} minutes</span>
                                </div>
                            )}
                            {quiz.maxAttempts && quiz.maxAttempts > 0 && (
                                <div>
                                    <span className="text-muted-foreground text-sm">
                                        Max Attempts:
                                    </span>{" "}
                                    <span className="font-medium">{quiz.maxAttempts}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground text-sm">
                                    Attempts Used:
                                </span>{" "}
                                <span className="font-medium">{attempts.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Start Quiz or View Attempts */}
                {canTakeQuiz ? (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Take Quiz</CardTitle>
                            <CardDescription>
                                {hasAttempts
                                    ? `You have ${attempts.length} previous attempt(s). Click below to start a new attempt.`
                                    : "Click the button below to start the quiz"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <QuizTaker quizId={quizId as Id<"quizzes">} quiz={quiz} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                        <CardHeader>
                            <CardTitle className="text-amber-900 dark:text-amber-100">
                                Maximum Attempts Reached
                            </CardTitle>
                            <CardDescription className="text-amber-700 dark:text-amber-300">
                                You have used all {quiz.maxAttempts} attempts for this quiz
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Previous Attempts */}
                {hasAttempts && (
                    <div>
                        <h2 className="mb-4 font-semibold text-xl">Previous Attempts</h2>
                        <div className="space-y-4">
                            {attempts.map((attempt, index) => (
                                <AttemptCard
                                    key={attempt._id}
                                    attempt={attempt}
                                    attemptNumber={attempts.length - index}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function QuizTaker({
    quizId,
    quiz,
}: {
    quizId: Id<"quizzes">
    quiz: { questionCount: number }
}) {
    const navigate = useNavigate()
    const [isStarted, setIsStarted] = useState(false)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const questions = useQuery(
        api.learner.assessments.getQuizQuestions,
        isStarted ? { quizId } : "skip"
    )

    const startAttempt = useMutationWithToast(api.learner.assessments.startQuizAttempt, {
        loadingMessage: "Starting quiz...",
        successMessage: "Quiz started",
    })

    const submitAttempt = useMutationWithToast(api.learner.assessments.submitQuizAttempt, {
        loadingMessage: "Submitting quiz...",
        successMessage: "Quiz submitted successfully",
    })

    const handleStart = async () => {
        await startAttempt({ quizId })
        setIsStarted(true)
    }

    const handleSubmit = async () => {
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
            questionId: questionId as Id<"quizQuestions">,
            answer,
        }))

        await submitAttempt({
            quizId,
            answers: formattedAnswers,
        })

        navigate({ to: "/c/$courseId/quizzes/$quizId", params: { courseId: "", quizId } })
    }

    if (!isStarted) {
        return (
            <Button onClick={handleStart} size="lg">
                Start Quiz
            </Button>
        )
    }

    if (questions === undefined) {
        return <LoadingPage message="Loading questions..." />
    }

    const allAnswered = questions.every((q) => answers[q._id])

    return (
        <div className="space-y-6">
            {questions.map((question, index) => (
                <Card key={question._id}>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Question {index + 1} of {questions.length}
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-foreground">
                            {question.question}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={answers[question._id] || ""}
                            onValueChange={(value) =>
                                setAnswers((prev) => ({ ...prev, [question._id]: value }))
                            }
                        >
                            {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${question._id}-${optIndex}`} />
                                    <Label
                                        htmlFor={`${question._id}-${optIndex}`}
                                        className="cursor-pointer"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={!allAnswered} size="lg">
                    Submit Quiz
                </Button>
            </div>
        </div>
    )
}

function AttemptCard({
    attempt,
    attemptNumber,
}: {
    attempt: {
        _id: Id<"quizAttempts">
        score: number
        submittedAt: number
        isPassed: boolean
    }
    attemptNumber: number
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Attempt {attemptNumber}</CardTitle>
                        <CardDescription>
                            Submitted on {new Date(attempt.submittedAt).toLocaleString()}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            {attempt.isPassed ? (
                                <CheckCircleIcon className="size-6 text-green-600" />
                            ) : (
                                <XCircleIcon className="size-6 text-red-600" />
                            )}
                            <div>
                                <div className="font-bold text-2xl">{attempt.score}%</div>
                                <div className="text-muted-foreground text-xs">
                                    {attempt.isPassed ? "Passed" : "Failed"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}
