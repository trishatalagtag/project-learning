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
import { Text } from "@/components/ui/text"
import { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { type JSX, useCallback, useMemo, useState } from "react"
import type { Selection } from "react-aria-components"
import { toast } from "sonner"
import { EmptyState } from "../shared/empty-state"
import { TableLoadingSkeleton } from "../shared/table-loading-skeleton"
import { CourseFilterForm } from "./course-filter-form"
import type { CourseFilters, PendingCourse } from "./types"

interface PendingCoursesTableProps {
  courses: PendingCourse[] | undefined
  onPreview: (course: PendingCourse) => void
}

export function PendingCoursesTable({ courses, onPreview }: PendingCoursesTableProps): JSX.Element {
  const [filters, setFilters] = useState<CourseFilters>({ search: "", category: "all" })
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const [processingIds, setProcessingIds] = useState<Set<Id<"courses">>>(new Set())

  const approveCourse = useMutation(api.admin.courses.approveCourse)
  const rejectCourse = useMutation(api.admin.courses.rejectCourse)

  const handleAction = useCallback(
    async (
      courseId: Id<"courses">,
      courseName: string,
      action: "approve" | "reject",
    ): Promise<void> => {
      setProcessingIds((prev) => new Set(prev).add(courseId))

      try {
        if (action === "approve") {
          await approveCourse({ courseId })
          toast.success(`"${courseName}" has been approved.`)
        } else {
          await rejectCourse({ courseId, reason: "Rejected by admin" })
          toast.error(`"${courseName}" has been rejected.`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error(`Failed to ${action} course: ${message}`)
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(courseId)
          return next
        })
      }
    },
    [approveCourse, rejectCourse],
  )

  const filteredData = useMemo((): PendingCourse[] => {
    if (!courses) return []

    return courses.filter((course) => {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.teacherName?.toLowerCase().includes(searchLower)

      const matchesCategory =
        filters.category === "all" ||
        course.categoryName.toLowerCase() === filters.category.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [courses, filters])

  const handleBulkAction = useCallback(
    async (action: "approve" | "reject"): Promise<void> => {
      if (selectedKeys === "all") {
        toast.error("Please select specific courses for bulk actions")
        return
      }

      const selectedIds = Array.from(selectedKeys) as Id<"courses">[]
      const selectedCourses = courses?.filter((c) => selectedIds.includes(c._id)) || []

      if (selectedCourses.length === 0) {
        toast.error("No courses selected")
        return
      }

      await Promise.all(
        selectedCourses.map((course) => handleAction(course._id, course.title, action)),
      )

      setSelectedKeys(new Set())
    },
    [selectedKeys, courses, handleAction],
  )

  if (courses === undefined) {
    return <TableLoadingSkeleton />
  }

  if (courses.length === 0) {
    return <EmptyState message="No pending courses to review" />
  }

  const selectedCount = selectedKeys === "all" ? filteredData.length : selectedKeys.size

  return (
    <div className="mt-4 space-y-4">
      <CourseFilterForm onFilterChange={setFilters} />

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
          <Text className="text-muted-foreground text-sm">{selectedCount} course(s) selected</Text>
          <ButtonGroup>
            <Button size="sm" intent="secondary" onPress={() => handleBulkAction("approve")}>
              Approve Selected
            </Button>
            <Button size="sm" intent="danger" onPress={() => handleBulkAction("reject")}>
              Reject Selected
            </Button>
          </ButtonGroup>
        </div>
      )}

      <Table
        aria-label="Pending Courses"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader>
          <TableColumn isRowHeader>Course</TableColumn>
          <TableColumn>Instructor</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Submitted</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody
          items={filteredData}
          renderEmptyState={() => <EmptyState message="No courses match your filters" />}
        >
          {(course) => {
            const isPending = processingIds.has(course._id)
            const displayName = course.teacherName || course.createdByName || "Unknown"
            const initials = getInitials(course.createdByName)

            return (
              <TableRow key={course._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{course.title}</div>
                    <div className="line-clamp-1 text-muted-foreground text-sm">
                      {course.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar initials={initials} size="sm" />
                    <span className="text-sm">{displayName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge intent="info">{course.categoryName}</Badge>
                </TableCell>
                <TableCell>
                  <time className="text-muted-foreground text-sm">
                    {formatDate(course.createdAt)}
                  </time>
                </TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Button
                      size="sm"
                      intent="secondary"
                      isPending={isPending}
                      onPress={() => handleAction(course._id, course.title, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      intent="danger"
                      isPending={isPending}
                      onPress={() => handleAction(course._id, course.title, "reject")}
                    >
                      Reject
                    </Button>
                    <Button size="sm" intent="outline" onPress={() => onPreview(course)}>
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
