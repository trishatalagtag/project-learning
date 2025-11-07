import type { api } from "api"
import type { FunctionReturnType } from "convex/server"

export type PendingCourse = FunctionReturnType<typeof api.admin.courses.getPendingCourses>[number]
export type PendingContentResponse = FunctionReturnType<typeof api.admin.content.listPendingContent>

export type PendingModule = PendingContentResponse["modules"][number] & { type: "module" }
export type PendingLesson = PendingContentResponse["lessons"][number] & { type: "lesson" }
export type PendingQuiz = PendingContentResponse["quizzes"][number] & { type: "quiz" }
export type PendingAssignment = PendingContentResponse["assignments"][number] & {
  type: "assignment"
}

export type PendingContentItem = PendingModule | PendingLesson | PendingQuiz | PendingAssignment
export type ContentType = "module" | "lesson" | "quiz" | "assignment" | "all"

export interface CourseFilters {
  search: string
  category: string
}

export interface ContentFilters {
  search: string
  contentType: ContentType
}
