import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export function useAttachments(lessonId: Id<"lessons">) {
  const attachments = useQuery(api.faculty.attachments.listAttachmentsByLesson, { lessonId })

  return {
    attachments: attachments ?? [],
    isLoading: attachments === undefined,
    isEmpty: attachments?.length === 0,
    count: attachments?.length ?? 0,
  }
}
