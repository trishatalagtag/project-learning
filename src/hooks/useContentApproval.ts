import { api } from "api"
import { usePaginatedQuery, useQuery } from "convex/react"
import { useState } from "react"

type ContentType = "course" | "module" | "lesson" | "quiz" | "assignment"
type StatusFilter = "pending" | "approved" | "draft"

export function useContentApproval() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [typeFilter, setTypeFilter] = useState<ContentType>("course")

  // Use paginated query
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.content.listContentPaginated,
    {
      status: statusFilter,
      contentType: typeFilter,
    },
    { initialNumItems: 20 },
  )

  // Get counts separately (cached)
  const counts = useQuery(api.admin.content.getContentCounts, {
    contentType: typeFilter,
  })

  return {
    items: results,
    counts,
    isLoading: status === "LoadingFirstPage",
    canLoadMore: status === "CanLoadMore",
    loadMore,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  }
}
