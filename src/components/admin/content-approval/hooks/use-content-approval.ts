import { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import { useMutation, usePaginatedQuery, useQuery } from "convex/react"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"
import { TYPE_CONFIG } from "../config"
import type { ContentItem, ContentType, StatusType } from "../types"

interface UseContentApprovalOptions {
  contentType: ContentType
  status?: StatusType
  pageSize?: number
}

export function useContentApproval({
  contentType,
  status = "pending",
  pageSize = 20,
}: UseContentApprovalOptions) {
  const {
    results,
    status: loadStatus,
    loadMore,
  } = usePaginatedQuery(
    api.admin.content.listContentPaginated,
    { status, contentType },
    { initialNumItems: pageSize },
  )

  const approveCourse = useMutation(api.admin.courses.approveCourse)
  const rejectCourse = useMutation(api.admin.courses.rejectCourse)
  const approveModule = useMutation(api.admin.content.approveModule)
  const approveLesson = useMutation(api.admin.content.approveLesson)
  const approveQuiz = useMutation(api.admin.content.approveQuiz)
  const approveAssignment = useMutation(api.admin.content.approveAssignment)
  const rejectContent = useMutation(api.admin.content.rejectContent)

  const items = useMemo(() => results ?? [], [results])
  const isLoading = loadStatus === "LoadingFirstPage"
  const canLoadMore = loadStatus === "CanLoadMore"

  const handleApprove = useCallback(
    async (item: ContentItem) => {
      try {
        const mutations = {
          course: () => approveCourse({ courseId: item._id as Id<"courses"> }),
          module: () => approveModule({ moduleId: item._id as Id<"modules"> }),
          lesson: () => approveLesson({ lessonId: item._id as Id<"lessons"> }),
          quiz: () => approveQuiz({ quizId: item._id as Id<"quizzes"> }),
          assignment: () => approveAssignment({ assignmentId: item._id as Id<"assignments"> }),
        }

        await mutations[item.type]()

        toast.success(`${TYPE_CONFIG[item.type].label} approved`, {
          description: `"${item.title}" has been approved successfully.`,
        })
      } catch (e: any) {
        toast.error("Failed to approve", {
          description: e?.message || "An error occurred.",
        })
        throw e
      }
    },
    [approveCourse, approveModule, approveLesson, approveQuiz, approveAssignment],
  )

  const handleReject = useCallback(
    async (item: ContentItem, reason: string) => {
      if (!reason.trim()) {
        toast.error("Reason required", {
          description: "Please provide a reason for rejection.",
        })
        throw new Error("Reason required")
      }

      try {
        if (item.type === "course") {
          await rejectCourse({
            courseId: item._id as Id<"courses">,
            reason,
          })
        } else {
          await rejectContent({
            contentType: item.type,
            contentId: item._id,
            reason,
          })
        }

        toast.success(`${TYPE_CONFIG[item.type].label} rejected`, {
          description: `"${item.title}" has been rejected.`,
        })
      } catch (e: any) {
        toast.error("Failed to reject", {
          description: e?.message || "An error occurred.",
        })
        throw e
      }
    },
    [rejectCourse, rejectContent],
  )

  return {
    items,
    isLoading,
    canLoadMore,
    loadMore,
    handleApprove,
    handleReject,
  }
}

export function useContentCounts(contentType: ContentType) {
  const counts = useQuery(api.admin.content.getContentCounts, { contentType })

  return useMemo(
    () => ({
      pending: counts?.pending ?? 0,
      approved: counts?.approved ?? 0,
      rejected: counts?.rejected ?? 0,
      isLoading: counts === undefined,
    }),
    [counts],
  )
}
