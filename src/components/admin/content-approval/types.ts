import type { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import type { FunctionReturnType } from "convex/server"

// Infer types from Convex
export type ContentPage = FunctionReturnType<typeof api.admin.content.listContentPaginated>

export type ContentItem = ContentPage["page"][number]

export type ContentCounts = FunctionReturnType<typeof api.admin.content.getContentCounts>

export type ContentType = "course" | "module" | "lesson" | "quiz" | "assignment"

export type StatusType = "pending" | "approved" | "draft"

export type ContentItemWithId = ContentItem & { id: string }

export interface ContentApprovalContextValue {
  onPreview: (item: ContentItem) => void
  onReject: (item: ContentItem) => void
  onApprove: (item: ContentItem) => void
  processing: string | null
}

export interface KanbanColumn {
  id: StatusType
  title: string
  items: ContentItem[]
}

export interface ApprovalMutations {
  approveCourse: (args: { courseId: Id<"courses"> }) => Promise<null>
  rejectCourse: (args: { courseId: Id<"courses">; reason: string }) => Promise<null>
  approveModule: (args: { moduleId: Id<"modules"> }) => Promise<null>
  approveLesson: (args: { lessonId: Id<"lessons"> }) => Promise<null>
  approveQuiz: (args: { quizId: Id<"quizzes"> }) => Promise<null>
  approveAssignment: (args: { assignmentId: Id<"assignments"> }) => Promise<null>
  rejectContent: (args: {
    contentType: "module" | "lesson" | "quiz" | "assignment"
    contentId: string
    reason: string
  }) => Promise<null>
}
