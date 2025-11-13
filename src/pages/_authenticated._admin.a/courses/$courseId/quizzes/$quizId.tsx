import { QuizEditorPage } from "@/components/faculty/courses/quizzes/quiz-editor-page"
import { courseParams } from "@/hooks/use-route-params"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const quizParams = z.object({
    quizId: z.string().transform((val) => val as `${"j" | "k"}${string}`),
})

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId/quizzes/$quizId")({
    params: zodValidator(courseParams.merge(quizParams)),
    component: QuizEditorPage,
})
