import { CreateQuizPage } from "@/components/faculty/courses/quizzes/create-quiz-page"
import { courseParams } from "@/hooks/use-route-params"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_authenticated/_faculty/f/courses/$courseId/quizzes/new")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.FACULTY], isPending)
  },
  params: zodValidator(courseParams),
  component: CreateQuizPage,
})
