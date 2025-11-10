import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export function useQuiz(quizId: Id<"quizzes">) {
  const quiz = useQuery(api.faculty.quizzes.getQuizById, { quizId })

  return {
    quiz,
    isLoading: quiz === undefined,
    isNotFound: quiz === null,
  } as const
}
