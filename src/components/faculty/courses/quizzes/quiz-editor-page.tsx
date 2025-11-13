"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeftIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { QuestionsSection } from "./questions-section"
import { QuizSettingsForm } from "./quiz-settings-form"

export function QuizEditorPage() {
    const navigate = useNavigate()
    const { courseId, quizId } = useParams({ from: "/_authenticated/_faculty/f/courses/$courseId/quizzes/$quizId" })
    const [activeTab, setActiveTab] = useState<"settings" | "questions">("settings")

    const quiz = useQuery(api.faculty.quizzes.getQuizById, { quizId: quizId as Id<"quizzes"> })
    const publishQuiz = useMutation(api.faculty.quizzes.publishQuiz)

    const [isPublishing, setIsPublishing] = useState(false)

    const handlePublish = async () => {
        if (!quiz) return

        // Validation: Must have at least one question
        if (!quiz.questions || quiz.questions.length === 0) {
            toast.error("Cannot publish quiz without questions")
            return
        }

        setIsPublishing(true)
        try {
            await publishQuiz({ quizId: quizId as Id<"quizzes"> })
            toast.success("Quiz published successfully")
        } catch (error) {
            toast.error("Failed to publish quiz")
            console.error(error)
        } finally {
            setIsPublishing(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "default"
            case "draft":
                return "secondary"
            case "pending":
                return "outline"
            case "rejected":
                return "destructive"
            default:
                return "secondary"
        }
    }

    const getPublishButtonLabel = (status: string) => {
        if (status === "published") return "Published"
        if (status === "pending") return "Pending Approval"
        return "Publish Quiz"
    }

    if (quiz === undefined) {
        return (
            <div className="container mx-auto py-8">
                <Skeleton className="mb-6 h-10 w-32" />
                <div className="space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (quiz === null || !quiz) {
        return (
            <div className="container mx-auto py-8">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Quiz not found</EmptyTitle>
                        <EmptyDescription>The quiz you're looking for doesn't exist.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            onClick={() =>
                                navigate({
                                    to: "/f/courses/$courseId",
                                    params: { courseId },
                                    search: { tab: "assessments" },
                                })
                            }
                        >
                            Back to Assessments
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    const isPublishDisabled = quiz.status === "published" || quiz.status === "pending" || isPublishing

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        navigate({
                            to: "/f/courses/$courseId",
                            params: { courseId },
                            search: { tab: "assessments" },
                        })
                    }
                >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Assessments
                </Button>
            </div>

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-3xl tracking-tight">{quiz.title}</h1>
                        <Badge variant={getStatusColor(quiz.status)} className="capitalize">
                            {quiz.status}
                        </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                        {quiz.questions?.length || 0} question{quiz.questions?.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={handlePublish} disabled={isPublishDisabled}>
                    {isPublishing && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                    {getPublishButtonLabel(quiz.status)}
                </Button>
            </div>

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "settings" | "questions")}>
                <TabsList>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="questions">Questions ({quiz.questions?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-6">
                    <QuizSettingsForm quiz={quiz} />
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                    <QuestionsSection quizId={quizId as Id<"quizzes">} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
