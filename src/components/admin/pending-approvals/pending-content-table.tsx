"use client"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "api"
import { useMutation } from "convex/react"
import { type JSX, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "../shared/empty-state"
import { TableLoadingSkeleton } from "../shared/table-loading-skeleton"
import { ContentFilterForm } from "./content-filter-form"
import type {
  ContentFilters,
  ContentType,
  PendingContentItem,
  PendingContentResponse,
} from "./types"

interface PendingContentTableProps {
  content: PendingContentResponse | undefined
  onPreview: (item: PendingContentItem) => void
}

const CONTENT_TYPE_COLORS: Record<ContentType, "primary" | "secondary" | "info" | "success"> = {
  module: "primary",
  lesson: "secondary",
  quiz: "info",
  assignment: "success",
  all: "primary",
}

export function PendingContentTable({ content, onPreview }: PendingContentTableProps): JSX.Element {
  const [filters, setFilters] = useState<ContentFilters>({ search: "", contentType: "all" })
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const approveModule = useMutation(api.admin.content.approveModule)
  const approveLesson = useMutation(api.admin.content.approveLesson)
  const approveQuiz = useMutation(api.admin.content.approveQuiz)
  const approveAssignment = useMutation(api.admin.content.approveAssignment)
  const rejectContent = useMutation(api.admin.content.rejectContent)

  const handleAction = useCallback(
    async (item: PendingContentItem, action: "approve" | "reject"): Promise<void> => {
      setProcessingIds((prev) => new Set(prev).add(item._id))

      try {
        if (action === "approve") {
          switch (item.type) {
            case "module":
              await approveModule({ moduleId: item._id })
              break
            case "lesson":
              await approveLesson({ lessonId: item._id })
              break
            case "quiz":
              await approveQuiz({ quizId: item._id })
              break
            case "assignment":
              await approveAssignment({ assignmentId: item._id })
              break
          }
        } else {
          const reason = prompt(`Please provide a reason for rejecting this ${item.type}:`)
          if (reason) {
            await rejectContent({
              contentType: item.type,
              contentId: item._id,
              reason: reason,
            })
          } else {
            toast.info("Rejection cancelled.")
            setProcessingIds((prev) => {
              const next = new Set(prev)
              next.delete(item._id)
              return next
            })
            return
          }
        }

        toast.success(`${capitalize(item.type)} "${item.title}" has been ${action}d.`)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error(`Failed to ${action} ${item.type}: ${message}`)
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(item._id)
          return next
        })
      }
    },
    [approveModule, approveLesson, approveQuiz, approveAssignment, rejectContent],
  )

  const allContent = useMemo((): PendingContentItem[] => {
    if (!content) return []

    return [
      ...content.modules.map((m) => ({ ...m, type: "module" as const })),
      ...content.lessons.map((l) => ({ ...l, type: "lesson" as const })),
      ...content.quizzes.map((q) => ({ ...q, type: "quiz" as const })),
      ...content.assignments.map((a) => ({ ...a, type: "assignment" as const })),
    ]
  }, [content])

  const filteredData = useMemo((): PendingContentItem[] => {
    const searchLower = filters.search.toLowerCase()

    return allContent.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.courseName.toLowerCase().includes(searchLower)

      const matchesType = filters.contentType === "all" || item.type === filters.contentType

      return matchesSearch && matchesType
    })
  }, [allContent, filters])

  if (content === undefined) {
    return <TableLoadingSkeleton />
  }

  if (allContent.length === 0) {
    return <EmptyState message="No pending content to review" />
  }

  return (
    <div className="mt-4 space-y-4">
      <ContentFilterForm onFilterChange={setFilters} />

      <Table aria-label="Pending Content">
        <TableHeader>
          <TableColumn isRowHeader>Title</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Course</TableColumn>
          <TableColumn>Creator</TableColumn>
          <TableColumn>Submitted</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody
          items={filteredData}
          renderEmptyState={() => <EmptyState message="No content matches your filters" />}
        >
          {(item) => {
            const isPending = processingIds.has(item._id)
            const initials = getInitials(item.createdByName)
            const isLesson = item.type === "lesson"

            return (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{item.title}</div>
                    {isLesson && "moduleName" in item && (
                      <div className="text-muted-foreground text-sm">Module: {item.moduleName}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge intent={CONTENT_TYPE_COLORS[item.type]}>{capitalize(item.type)}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.courseName}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar initials={initials} size="sm" />
                    <span className="text-sm">{item.createdByName || "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <time className="text-muted-foreground text-sm">
                    {formatDate(item.createdAt)}
                  </time>
                </TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Button
                      size="sm"
                      intent="secondary"
                      isPending={isPending}
                      onPress={() => handleAction(item, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      intent="danger"
                      isPending={isPending}
                      onPress={() => handleAction(item, "reject")}
                    >
                      Reject
                    </Button>
                    <Button size="sm" intent="outline" onPress={() => onPreview(item)}>
                      Preview
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
    </div>
  )
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: any): string {
  if (typeof name !== "string" || !name) return "??"
  return name.slice(0, 2).toUpperCase()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
