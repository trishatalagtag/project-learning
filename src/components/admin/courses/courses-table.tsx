"use client"

import { CoursesTableContentSkeleton, CoursesTableSkeleton } from "@/components/admin/courses/courses-table-skeleton"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import { DataTableViewOptions } from "@/components/table/data-table-view-options"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { cn } from "@/lib/utils"
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon
} from "@heroicons/react/24/solid"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, Loader2 } from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { type Course, createColumns } from "./columns"

export function CoursesTable() {
  const navigate = useNavigate()
  const search = useSearch({ from: "/_authenticated/_admin/a/courses" }) as {
    columnVisibility?: Record<string, boolean>
    rowSelection?: Record<string, boolean>
    pageIndex?: number
    pageSize?: number
    q?: string
    status?: string
    categoryId?: string
    teacherId?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }

  const [hasInitialized, setHasInitialized] = useState(false)

  const {
    columnVisibility = {},
    rowSelection = {},
    pageIndex = 0,
    pageSize = 10,
    q = "",
    status = "all",
    categoryId = "",
    teacherId = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = search

  const debouncedSearch = useDebounce(q, 300)

  // Fetch categories for filter
  const categories = useQuery(api.shared.categories.listAllCategories)

  const normalizedCategories = useMemo(
    () => (categories ? normalizeCategoryTree(categories) : []),
    [categories],
  )

  const flatCategories = useMemo(
    () => flattenCategoryTree(normalizedCategories),
    [normalizedCategories],
  )

  // Fetch faculty for filter
  const faculty = useQuery(api.admin.users.listUsersByRole, {
    role: "FACULTY",
  })

  // Fetch courses with server-side pagination and sorting
  const coursesData = useQuery(api.admin.courses.listAllCourses, {
    limit: pageSize,
    offset: pageIndex * pageSize,
    sortBy,
    sortOrder,
    search: debouncedSearch || undefined,
    status:
      status === "all"
        ? undefined
        : status === CONTENT_STATUS.DRAFT ||
          status === CONTENT_STATUS.PENDING ||
          status === CONTENT_STATUS.APPROVED ||
          status === CONTENT_STATUS.PUBLISHED
          ? (status as "draft" | "pending" | "approved" | "published")
          : (status as "archived"),
    categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
    teacherId: teacherId || undefined,
  })

  const data = coursesData?.courses ?? []
  const totalCourses = coursesData?.total ?? 0
  const pageCount = Math.ceil(totalCourses / pageSize)

  const isLoading = coursesData === undefined || categories === undefined || faculty === undefined

  // Track when data finishes loading for the first time
  useEffect(() => {
    if (!isLoading) {
      setHasInitialized(true)
    }
  }, [isLoading])

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      // @ts-expect-error - prev is not typed
      search: (prev: typeof search) => ({ ...prev, ...updates }),
      replace: true,
    })
  }

  const handleView = (courseId: Id<"courses">) => {
    navigate({ to: "/a/courses/$courseId", params: { courseId } })
  }

  const handleRetry = () => {
    // Force a re-fetch by updating the search state
    updateSearch({})
  }

  const columns = useMemo(
    () =>
      createColumns({
        onView: handleView,
      }),
    [],
  )

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting: [{ id: sortBy, desc: sortOrder === "desc" }] as SortingState,
      columnVisibility: columnVisibility as VisibilityState,
      rowSelection: rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function"
          ? updater([{ id: sortBy, desc: sortOrder === "desc" }])
          : updater

      if (newSorting.length > 0) {
        updateSearch({
          sortBy: newSorting[0].id,
          sortOrder: newSorting[0].desc ? "desc" : "asc",
          pageIndex: 0,
        })
      }
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility =
        typeof updater === "function" ? updater(columnVisibility as VisibilityState) : updater
      updateSearch({ columnVisibility: newVisibility })
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      updateSearch({ rowSelection: newSelection })
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
      updateSearch({
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
      })
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  // Loading state - show full skeleton on initial load, table-only skeleton on refetch
  if (isLoading && !hasInitialized) {
    return <CoursesTableSkeleton />
  }

  // Error state
  if (coursesData === null || categories === null || faculty === null) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Failed to load courses</EmptyTitle>
            <EmptyDescription>
              An error occurred while loading the course list. Please try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  // Empty state (no filters applied)
  if (data.length === 0 && !q && status === "all" && !categoryId && !teacherId) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlassIcon className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No courses yet</EmptyTitle>
            <EmptyDescription>Get started by creating your first course.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate({ to: "/a/courses/new" })}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const getStatusIcon = (statusValue: string) => {
    const iconProps = "h-4 w-4 opacity-60"
    const statusMap: Record<string, React.ReactNode> = {
      draft: <SparklesIcon className={iconProps} />,
      pending: <ExclamationTriangleIcon className={iconProps} />,
      approved: <CheckCircleIcon className={iconProps} />,
      published: <CheckCircleIcon className={iconProps} />,
      archived: <ArchiveBoxIcon className={iconProps} />,
    }
    return statusMap[statusValue] || <ExclamationTriangleIcon className={iconProps} />
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCategoryName = (id: string): string => {
    if (!id || id === "all") return "All categories"
    const category = flatCategories.find(cat => cat._id === id)
    return category?.name || "Category"
  }

  const getStatusVariant = (courseStatus: string) => {
    const variants = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      published: "default",
      archived: "destructive",
    } as const

    return variants[courseStatus as keyof typeof variants] || "secondary"
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Courses</h1>
            <p className="text-muted-foreground">Manage your course catalog and enrollments</p>
          </div>
          <Button onClick={() => navigate({ to: "/a/courses/new" })} className="sm:ml-auto">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full min-w-[200px] sm:max-w-sm sm:flex-1">
              <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={q}
                onChange={(e) => updateSearch({ q: e.target.value, pageIndex: 0 })}
                className="h-9 pl-8"
                disabled={isLoading}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={(value) =>
                updateSearch({
                  status: value as any,
                  pageIndex: 0,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="py-1 font-normal text-muted-foreground text-xs">Filter by Status</SelectLabel>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 opacity-60" />
                      <span>All statuses</span>
                    </span>
                  </SelectItem>
                  <SelectItem value={CONTENT_STATUS.DRAFT}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon("draft")}
                      <span>Draft</span>
                    </span>
                  </SelectItem>
                  <SelectItem value={CONTENT_STATUS.PENDING}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon("pending")}
                      <span>Pending</span>
                    </span>
                  </SelectItem>
                  <SelectItem value={CONTENT_STATUS.APPROVED}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon("approved")}
                      <span>Approved</span>
                    </span>
                  </SelectItem>
                  <SelectItem value={CONTENT_STATUS.PUBLISHED}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon("published")}
                      <span>Published</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="archived">
                    <span className="flex items-center gap-2">
                      {getStatusIcon("archived")}
                      <span>Archived</span>
                    </span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryId || "all"}
              onValueChange={(value) =>
                updateSearch({
                  categoryId: value === "all" ? "" : value,
                  pageIndex: 0,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue
                  placeholder="Category"
                >
                  {categoryId ? (
                    <span className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 opacity-60" />
                      <span className="truncate">{getCategoryName(categoryId)}</span>
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="py-1 font-normal text-muted-foreground text-xs">All Categories</SelectLabel>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 opacity-60" />
                      <span>All categories</span>
                    </span>
                  </SelectItem>
                </SelectGroup>
                {categories === undefined ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <SelectGroup>
                    <SelectLabel className="py-1 font-normal text-muted-foreground text-xs">Available Categories</SelectLabel>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        <span className="flex items-center gap-2">
                          <FolderIcon className="h-4 w-4 opacity-60" />
                          <span>
                            {"\u00A0\u00A0".repeat(cat.level - 1)}
                            {cat.level > 1 && "└─ "}
                            {cat.name}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>

            {/* Teacher Filter */}
            <Select
              value={teacherId || "all"}
              onValueChange={(value) =>
                updateSearch({
                  teacherId: value === "all" ? "" : value,
                  pageIndex: 0,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="py-1 font-normal text-muted-foreground text-xs">Select a teacher</SelectLabel>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 opacity-60" />
                      <span>All teachers</span>
                    </span>
                  </SelectItem>
                  {(faculty || []).map((teacher) => {
                    const initials = getAvatarFallback(teacher.name)
                    return (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        <span className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span>{teacher.name}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="hidden sm:ml-auto md:block">
              <DataTableViewOptions table={table} />
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div>
              Showing {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalCourses)}{" "}
              of {totalCourses} courses
            </div>
          </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden">
          {isLoading && hasInitialized ? (
            <CoursesTableContentSkeleton />
          ) : data.length > 0 ? (
            <ItemGroup className="space-y-0">
              {data.map((course: Course, index) => {
                const isFirst = index === 0
                const isLast = index === data.length - 1
                const isOnly = data.length === 1

                return (
                  <Item
                    key={course._id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent/50",
                      // Single item - fully rounded
                      isOnly && "rounded-lg",
                      // First item - rounded top only, no bottom border
                      isFirst && !isOnly && "rounded-t-lg rounded-b-none border-b-0",
                      // Last item - rounded bottom only
                      isLast && !isOnly && "rounded-t-none rounded-b-lg",
                      // Middle items - no rounding, no bottom border
                      !isFirst && !isLast && "rounded-none border-b-0"
                    )}
                    onClick={() => handleView(course._id)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <AcademicCapIcon className="h-5 w-5" />
                    </div>

                    <ItemContent className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <ItemTitle className="line-clamp-1">{course.title}</ItemTitle>
                        <Badge
                          variant={getStatusVariant(course.status)}
                          className="shrink-0 capitalize"
                        >
                          {course.status}
                        </Badge>
                      </div>

                      <ItemDescription className="mt-1 space-y-1">
                        <div className="flex items-center gap-4 text-xs">
                          {course.categoryName && (
                            <span className="flex items-center gap-1">
                              <FolderIcon className="h-3.5 w-3.5" />
                              {course.categoryName}
                            </span>
                          )}
                          {course.teacherName && (
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3.5 w-3.5" />
                              {course.teacherName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-3.5 w-3.5" />
                            {course.enrollmentCount} enrolled
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpenIcon className="h-3.5 w-3.5" />
                            {course.moduleCount} modules
                          </span>
                          <span>
                            Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions className="shrink-0">
                      <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              <ExclamationTriangleIcon className="h-8 w-8" />
              <p>No courses found{q && ` matching "${q}"`}</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden rounded-md border md:block">
          {isLoading && hasInitialized ? (
            <CoursesTableContentSkeleton />
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ExclamationTriangleIcon className="h-8 w-8" />
                        <p>No courses found{q && ` matching "${q}"`}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <DataTablePagination table={table} />
      </div>
    </div>
  )
}