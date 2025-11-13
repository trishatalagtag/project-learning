"use client"

import { ContentKanbanView } from "@/components/admin/courses/tabs/course-content-tab/content-kanban-view"
import { ContentPreviewDialog } from "@/components/admin/courses/tabs/course-content-tab/content-preview-dialog"
import { RequestChangesDialog } from "@/components/admin/courses/tabs/course-content-tab/request-changes-dialog"
import { StatusBadge } from "@/components/shared/status/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { ContentStatus } from "@/lib/constants/content-status"
import {
  AcademicCapIcon,
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon, EyeIcon,
  FolderIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XCircleIcon
} from "@heroicons/react/24/solid"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import { Loader2, MoreHorizontalIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const CONTENT_TYPE_ICONS = {
  module: FolderIcon,
  lesson: BookOpenIcon,
  quiz: ClipboardDocumentListIcon,
  assignment: DocumentTextIcon,
} as const

export const Route = createFileRoute("/_authenticated/_admin/a/content-approvals/")({
  component: ContentApprovalsPage,
})

type ContentTypeFilter = "all" | "module" | "lesson" | "quiz" | "assignment"

function ContentApprovalsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban")
  const [contentType, setContentType] = useState<ContentTypeFilter>("all")
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [facultyFilter, setFacultyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest")
  const [dateRange, setDateRange] = useState<{ start?: number; end?: number }>({})
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      contentType: "module" | "lesson" | "quiz" | "assignment"
      contentId: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
      title: string
    }>
  >([])
  const [previewItem, setPreviewItem] = useState<{
    type: "module" | "lesson" | "quiz" | "assignment"
    id: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
    title: string
    status: ContentStatus
  } | null>(null)
  const [requestChangesItem, setRequestChangesItem] = useState<{
    contentId: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
    contentType: "module" | "lesson" | "quiz" | "assignment"
    title: string
  } | null>(null)
  const [approveItem, setApproveItem] = useState<{
    contentId: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
    contentType: "module" | "lesson" | "quiz" | "assignment"
    title: string
  } | null>(null)
  const [publishItem, setPublishItem] = useState<{
    contentId: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">
    contentType: "module" | "lesson" | "quiz" | "assignment"
    title: string
  } | null>(null)

  const counts = useQuery(api.admin.content.getAllContentCounts, {})
  const bulkApprove = useMutation(api.admin.content.bulkApproveContent)

  // Infer types from backend response
  type PendingContentResponse = FunctionReturnType<typeof api.admin.content.getAllPendingContent>
  type EnrichedModule = PendingContentResponse["modules"][number] & { type: "module" }
  type EnrichedLesson = PendingContentResponse["lessons"][number] & { type: "lesson" }
  type EnrichedQuiz = PendingContentResponse["quizzes"][number] & { type: "quiz" }
  type EnrichedAssignment = PendingContentResponse["assignments"][number] & { type: "assignment" }
  type EnrichedContentItem = EnrichedModule | EnrichedLesson | EnrichedQuiz | EnrichedAssignment

  // Type guard functions
  const hasCourseId = (item: EnrichedContentItem): item is EnrichedModule | EnrichedQuiz | EnrichedAssignment => {
    return item.type === "module" || item.type === "quiz" || item.type === "assignment"
  }

  const updateStatus = useMutation(api.admin.content.updateContentStatus).withOptimisticUpdate(
    (localStore, args) => {
      // Optimistically update the pending content query by removing the item
      // since it will move to a different status and won't be in the pending list anymore
      const currentData = localStore.getQuery(api.admin.content.getAllPendingContent, {})

      if (currentData) {
        // Remove the item from the appropriate array based on content type
        const removeFromArray = <T extends { _id: string }>(arr: T[], id: string) =>
          arr.filter((item) => item._id !== id)

        const updatedData = {
          modules: args.contentType === "module" ? removeFromArray(currentData.modules, args.contentId) : currentData.modules,
          lessons: args.contentType === "lesson" ? removeFromArray(currentData.lessons, args.contentId) : currentData.lessons,
          quizzes: args.contentType === "quiz" ? removeFromArray(currentData.quizzes, args.contentId) : currentData.quizzes,
          assignments: args.contentType === "assignment" ? removeFromArray(currentData.assignments, args.contentId) : currentData.assignments,
        }

        localStore.setQuery(
          api.admin.content.getAllPendingContent,
          {},
          updatedData
        )
      }
    }
  )
  const courses = useQuery(api.admin.courses.listAllCourses, { limit: 1000, offset: 0 })
  const faculty = useQuery(api.admin.users.listUsersByRole, { role: "FACULTY" })
  const pendingContent = useQuery(api.admin.content.getAllPendingContent, {})

  const isLoading = counts === undefined || pendingContent === undefined
  const hasError = counts === null || pendingContent === null

  const filteredContent = useMemo((): EnrichedContentItem[] => {
    if (!pendingContent) {
      return []
    }

    // Combine all content types into a single array with type discriminators
    const allContent: EnrichedContentItem[] = [
      ...pendingContent.modules.map((item) => ({ ...item, type: "module" as const })),
      ...pendingContent.lessons.map((item) => ({ ...item, type: "lesson" as const })),
      ...pendingContent.quizzes.map((item) => ({ ...item, type: "quiz" as const })),
      ...pendingContent.assignments.map((item) => ({ ...item, type: "assignment" as const })),
    ]

    const filtered = allContent.filter((item) => {
      const matchesType = contentType === "all" || item.type === contentType
      const matchesSearch =
        search.trim().length === 0 ||
        item.title.toLowerCase().includes(search.toLowerCase())

      return matchesType && matchesSearch
    })

    // Sort to prioritize overdue items (3+ days) at the top
    return filtered.sort((a, b) => {
      const daysPendingA = Math.floor((Date.now() - a.createdAt) / 86400000)
      const daysPendingB = Math.floor((Date.now() - b.createdAt) / 86400000)
      const isOverdueA = daysPendingA > 3
      const isOverdueB = daysPendingB > 3

      // Prioritize overdue items
      if (isOverdueA && !isOverdueB) return -1
      if (!isOverdueA && isOverdueB) return 1

      // Within the same overdue status, maintain existing sort order
      if (sortBy === "oldest") {
        return a.createdAt - b.createdAt
      }
      if (sortBy === "newest") {
        return b.createdAt - a.createdAt
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }

      return 0
    })
  }, [pendingContent, contentType, search, sortBy])

  const handleSelectItem = (item: { type: "module" | "lesson" | "quiz" | "assignment"; _id: Id<"modules"> | Id<"lessons"> | Id<"quizzes"> | Id<"assignments">; title: string }) => {
    const exists = selectedItems.find((i) => i.contentId === item._id)
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.contentId !== item._id))
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
          contentId: item._id,
          title: item.title,
        },
      ])
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length && filteredContent.length > 0) {
      setSelectedItems([])
    } else {
      setSelectedItems(
        filteredContent.map((item) => ({
          contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
          contentId: item._id,
          title: item.title,
        }))
      )
    }
  }

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return

    const toastId = toast.loading(`Approving ${selectedItems.length} items...`)

    try {
      const result = await bulkApprove({ items: selectedItems })

      if (result.succeeded > 0) {
        toast.success(`Successfully approved ${result.succeeded} items`, { id: toastId })
      }

      if (result.failed.length > 0) {
        toast.error(
          `Failed to approve ${result.failed.length} items. ${result.failed.slice(0, 2).map(f => f.error).join("; ")}`,
          { id: toastId, duration: 6000 }
        )
      }

      setSelectedItems([])
    } catch {
      toast.error("Bulk approval failed", { id: toastId })
    }
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const handleApproveConfirm = async () => {
    if (!approveItem) return

    try {
      await updateStatus({
        contentType: approveItem.contentType,
        contentId: approveItem.contentId,
        action: "approve",
      })
      toast.success(`"${approveItem.title}" has been approved`)
      setApproveItem(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve content"
      )
    }
  }

  const handlePublishConfirm = async () => {
    if (!publishItem) return

    try {
      await updateStatus({
        contentType: publishItem.contentType,
        contentId: publishItem.contentId,
        action: "publish",
      })
      toast.success(`"${publishItem.title}" has been published`)
      setPublishItem(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish content"
      )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading approvals...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">Failed to load content approvals</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                There was an error loading the approval data. Please try again.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!counts || !pendingContent) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Content Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve pending content across all courses
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md"
          onClick={() => navigate({ to: "/a/content", search: { status: "pending" } })}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Pending Review</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{counts.pending.total}</div>
            <p className="text-muted-foreground text-xs">
              {counts.pending.modules}M · {counts.pending.lessons}L ·{" "}
              {counts.pending.quizzes}Q · {counts.pending.assignments}A
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md"
          onClick={() => navigate({ to: "/a/content", search: { status: "approved" } })}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Approved</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{counts.approved.total}</div>
            <p className="text-muted-foreground text-xs">Ready to publish</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md"
          onClick={() => navigate({ to: "/a/content", search: { status: "published" } })}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Published</CardTitle>
            <GlobeAltIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{counts.published.total}</div>
            <p className="text-muted-foreground text-xs">Live content</p>
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Total Items</CardTitle>
            <AcademicCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {counts.pending.total + counts.approved.total + counts.published.total}
            </div>
            <p className="text-muted-foreground text-xs">All content</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>

          <Select
            value={contentType}
            onValueChange={(value) => setContentType(value as ContentTypeFilter)}
          >
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="module">Modules</SelectItem>
              <SelectItem value="lesson">Lessons</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="All Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculty</SelectItem>
              {faculty?.map((f) => (
                <SelectItem key={f._id} value={f._id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "oldest" | "title")}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {(courseFilter !== "all" || facultyFilter !== "all" || dateRange.start || dateRange.end) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Active filters:</span>

            {courseFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Course: {courses?.courses.find((c) => c._id === courseFilter)?.title}
                <button
                  type="button"
                  onClick={() => setCourseFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {facultyFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Faculty: {faculty?.find((f) => f._id === facultyFilter)?.name}
                <button
                  type="button"
                  onClick={() => setFacultyFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {dateRange.start && (
              <Badge variant="secondary" className="gap-1">
                From: {new Date(dateRange.start).toLocaleDateString()}
                <button
                  type="button"
                  onClick={() => setDateRange({ ...dateRange, start: undefined })}
                  className="ml-1 hover:text-destructive"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {dateRange.end && (
              <Badge variant="secondary" className="gap-1">
                To: {new Date(dateRange.end).toLocaleDateString()}
                <button
                  type="button"
                  onClick={() => setDateRange({ ...dateRange, end: undefined })}
                  className="ml-1 hover:text-destructive"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCourseFilter("all")
                setFacultyFilter("all")
                setDateRange({})
              }}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban View
          </Button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={
                  selectedItems.length === filteredContent.length && filteredContent.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="font-semibold text-sm">
                {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} selected
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedItems.slice(0, 3).map((item) => (
                  <Badge key={item.contentId} variant="secondary" className="text-xs">
                    {item.title.slice(0, 20)}
                    {item.title.length > 20 ? "..." : ""}
                  </Badge>
                ))}
                {selectedItems.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedItems.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkApprove} size="sm" className="gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Approve All
              </Button>
              <Button onClick={handleClearSelection} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredContent.length > 0 && (
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div>
            Showing {filteredContent.length} of {pendingContent.modules.length + pendingContent.lessons.length + pendingContent.quizzes.length + pendingContent.assignments.length} pending items
            {(courseFilter !== "all" || facultyFilter !== "all" || search) && " (filtered)"}
          </div>
          {filteredContent.some((item) => {
            const daysPending = Math.floor((Date.now() - item.createdAt) / 86400000)
            return daysPending > 3
          }) && (
              <div className="flex items-center gap-2 text-destructive">
                <ExclamationCircleIcon className="h-4 w-4" />
                <span className="font-medium">
                  {filteredContent.filter((item) => {
                    const daysPending = Math.floor((Date.now() - item.createdAt) / 86400000)
                    return daysPending > 3
                  }).length}{" "}
                  overdue (3+ days)
                </span>
              </div>
            )}
        </div>
      )}

      <div className="space-y-2">
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <ShieldCheckIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="font-medium">No pending content to review</p>
                <p className="text-muted-foreground text-sm">
                  {search
                    ? `No results found for "${search}"`
                    : selectedItems.length > 0
                      ? "Clear filters or selection to see all pending items"
                      : "All content has been reviewed or filters hide remaining items"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "kanban" ? (
          <ContentKanbanView
            items={filteredContent}
            showDropTargets={true}
            onView={(item) => {
              setPreviewItem({
                type: item.type,
                id: item._id,
                title: item.title,
                status: item.status,
              })
            }}
            onStatusChange={async (itemId, newStatus) => {
              // Find the item to get its contentType
              const item = filteredContent.find((i) => i._id === itemId)
              if (!item) {
                toast.error("Content item not found")
                return
              }

              // If moving to "changes_requested", show dialog first
              if (newStatus === "changes_requested") {
                setRequestChangesItem({
                  contentId: itemId,
                  contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                  title: item.title,
                })
                return // Don't update status yet, wait for dialog submission
              }

              // If moving to "approved", show confirmation dialog
              if (newStatus === "approved") {
                setApproveItem({
                  contentId: itemId,
                  contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                  title: item.title,
                })
                return // Don't update status yet, wait for dialog confirmation
              }

              // If moving to "published", show confirmation dialog
              if (newStatus === "published") {
                setPublishItem({
                  contentId: itemId,
                  contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                  title: item.title,
                })
                return // Don't update status yet, wait for dialog confirmation
              }

              // For other status changes, proceed directly
              try {
                // Map status to action
                const actionMap: Record<string, "approve" | "publish" | "reject" | "unpublish"> = {
                  approved: "approve",
                  published: "publish",
                  changes_requested: "reject",
                  draft: "unpublish",
                }
                const action = actionMap[newStatus]
                if (!action) {
                  toast.error(`Cannot update status to ${newStatus}`)
                  return
                }
                await updateStatus({
                  contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                  contentId: itemId,
                  action,
                  ...(action === "reject" ? { reason: "Status changed" } : {}),
                })
                toast.success(`Status updated to ${newStatus}`)
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Failed to update status"
                )
              }
            }}
          />
        ) : (
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedItems.length === filteredContent.length && filteredContent.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Content</TableHead>
                  <TableHead className="hidden min-w-[150px] sm:table-cell">Course</TableHead>
                  <TableHead className="hidden min-w-[120px] md:table-cell">Type</TableHead>
                  <TableHead className="hidden min-w-[120px] lg:table-cell">Created</TableHead>
                  <TableHead className="hidden min-w-[100px] lg:table-cell">Status</TableHead>
                  <TableHead className="min-w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ShieldCheckIcon className="h-8 w-8" />
                        <p className="font-medium">No pending content to review</p>
                        <p className="text-sm">
                          {search
                            ? `No results found for "${search}"`
                            : "All content has been reviewed or filters hide remaining items"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="sync">
                    {filteredContent.map((item, index) => {
                      const Icon = CONTENT_TYPE_ICONS[item.type as keyof typeof CONTENT_TYPE_ICONS]
                      const daysPending = Math.floor((Date.now() - item.createdAt) / 86400000)
                      const isOverdue = daysPending > 3
                      const isSelected = selectedItems.some((i) => i.contentId === item._id)

                      return (
                        <motion.tr
                          key={`${item.type}-${item._id}`}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          data-state={isSelected ? "selected" : undefined}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${isOverdue ? "border-l-4 border-l-destructive bg-destructive/5" : ""}`}
                          onClick={() => {
                            // Get courseId - modules/quizzes/assignments have it directly, lessons don't
                            if (hasCourseId(item)) {
                              navigate({
                                to: "/a/courses/$courseId",
                                params: { courseId: item.courseId },
                                search: { tab: "content" },
                              })
                            }
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectItem(item)}
                              aria-label="Select row"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate font-semibold">{item.title}</h4>
                                  {isOverdue && (
                                    <Badge variant="destructive" className="shrink-0 text-xs">
                                      {daysPending}d
                                    </Badge>
                                  )}
                                </div>
                                {/* Module name not available in backend response */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-muted-foreground text-sm">—</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                              <ClockIcon className="h-3.5 w-3.5" />
                              <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <StatusBadge status={item.status as ContentStatus} showIcon />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreviewItem({
                                    type: item.type,
                                    id: item._id,
                                    title: item.title,
                                    status: "pending",
                                  })
                                }}
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span className="hidden xl:inline">Preview</span>
                              </Button>
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                    <span className="hidden xl:inline">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Get courseId - modules/quizzes/assignments have it directly, lessons don't
                                        if (hasCourseId(item)) {
                                          navigate({
                                            to: "/a/courses/$courseId",
                                            params: { courseId: item.courseId },
                                            search: { tab: "content" },
                                          })
                                        }
                                      }}
                                    >
                                      <AcademicCapIcon className="mr-2 h-4 w-4" />
                                      Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setApproveItem({
                                          contentId: item._id,
                                          contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                                          title: item.title,
                                        })
                                      }}
                                    >
                                      <CheckCircleIcon className="mr-2 h-4 w-4 text-primary" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setRequestChangesItem({
                                          contentId: item._id,
                                          contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                                          title: item.title,
                                        })
                                      }}
                                    >
                                      <ArrowPathIcon className="mr-2 h-4 w-4 text-destructive" />
                                      Request Changes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPublishItem({
                                          contentId: item._id,
                                          contentType: item.type as "module" | "lesson" | "quiz" | "assignment",
                                          title: item.title,
                                        })
                                      }}
                                    >
                                      <GlobeAltIcon className="mr-2 h-4 w-4 text-accent-foreground" />
                                      Publish
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {false && (
        <div className="flex justify-center">
          <Button variant="outline" disabled>
            Load More
          </Button>
        </div>
      )}

      {previewItem && (
        <ContentPreviewDialog
          open={!!previewItem}
          onOpenChange={() => setPreviewItem(null)}
          contentType={previewItem.type as "module" | "lesson" | "quiz" | "assignment"}
          contentId={previewItem.id}
          status={previewItem.status}
        />
      )}

      {requestChangesItem && (
        <RequestChangesDialog
          open={!!requestChangesItem}
          onOpenChange={(open) => {
            if (!open) {
              setRequestChangesItem(null)
            }
          }}
          contentId={requestChangesItem.contentId}
          contentType={requestChangesItem.contentType}
          contentTitle={requestChangesItem.title}
        />
      )}

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={!!approveItem} onOpenChange={(open) => !open && setApproveItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <AlertDialogTitle>Approve Content</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Are you sure you want to approve this content?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {approveItem && (
            <div className="space-y-2">
              <p className="font-medium text-sm">
                <span className="capitalize">{approveItem.contentType}</span>: {approveItem.title}
              </p>
              <p className="text-muted-foreground text-sm">
                This content will be marked as approved and ready to publish. You can still make changes later.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveConfirm}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={!!publishItem} onOpenChange={(open) => !open && setPublishItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <GlobeAltIcon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <AlertDialogTitle>Publish Content</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Are you sure you want to publish this content?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {publishItem && (
            <div className="space-y-2">
              <p className="font-medium text-sm">
                <span className="capitalize">{publishItem.contentType}</span>: {publishItem.title}
              </p>
              <p className="text-muted-foreground text-sm">
                This content will be published and visible to learners. Make sure all content is complete and accurate.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishConfirm} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
