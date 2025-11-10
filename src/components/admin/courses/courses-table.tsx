"use client"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import { ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
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
  Select,
  SelectContent,
  SelectItem,
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
import { createColumns } from "./columns"

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
  const categories = useQuery(api.admin.categories.listCategories)

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

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      // @ts-ignore - prev is not typed
      search: (prev: typeof search) => ({ ...prev, ...updates }),
      replace: true,
    })
  }

  const handleView = (courseId: Id<"courses">) => {
    navigate({ to: "/a/courses/$courseId", params: { courseId } })
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

  // Loading state
  if (coursesData === undefined || categories === undefined || faculty === undefined) {
    return (
      <div className="container mx-auto py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Loading courses...</EmptyTitle>
            <EmptyDescription>Please wait while we fetch your data.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // Empty state (no filters applied)
  if (data.length === 0 && !q && status === "all" && !categoryId && !teacherId) {
    return (
      <div className="container mx-auto py-10">
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog and enrollments</p>
        </div>
        <Button onClick={() => navigate({ to: "/a/courses/new" })}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={q}
              onChange={(e) => updateSearch({ q: e.target.value, pageIndex: 0 })}
              className="h-9 pl-8"
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
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={CONTENT_STATUS.DRAFT}>Draft</SelectItem>
              <SelectItem value={CONTENT_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={CONTENT_STATUS.APPROVED}>Approved</SelectItem>
              <SelectItem value={CONTENT_STATUS.PUBLISHED}>Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {"  ".repeat(cat.level - 1)}
                  {cat.name}
                </SelectItem>
              ))}
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
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teachers</SelectItem>
              {faculty.map((teacher) => (
                <SelectItem key={teacher.userId} value={teacher.userId}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <DataTableViewOptions table={table} />
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalCourses)}{" "}
            of {totalCourses} courses
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
