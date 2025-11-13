import { CreateQuizPage } from "@/components/faculty/courses/quizzes/create-quiz-page"
import { courseParams } from "@/hooks/use-route-params"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId/quizzes/new")({
    params: zodValidator(courseParams),
    component: CreateQuizPage,
})
