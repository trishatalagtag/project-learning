"use client"

import { type ColumnDef, DataTable } from "@/components/data-table"
import { DataTablePagination } from "@/components/data-table-pagination"
import { Badge } from "@/components/ui/badge"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu"
import { SearchField, SearchInput } from "@/components/ui/search-field"
import { Skeleton } from "@/components/ui/skeleton"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "api"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { BookOpen, Calendar, CheckCircle2, Tag, User } from "lucide-react"
import { use, useEffect, useMemo, useState } from "react"
import type { SortDescriptor } from "react-aria-components"
import { Autocomplete, AutocompleteStateContext } from "react-aria-components"

export const Route = createFileRoute("/_authenticated/_admin/a/courses/")({
  component: RouteComponent,
})

type CoursesResponse = FunctionReturnType<typeof api.admin.courses.listAllCourses>
type CourseData = CoursesResponse["courses"][number]

type Course = CourseData & {
  id: string
}

type SkeletonCourse = {
  _id: string
  id: string
  title: string
  description: string
  categoryName: string
  teacherName: string
  status: "draft" | "pending" | "approved" | "published" | "archived"
  createdAt: number
  _skeleton: true
}

const columns: ColumnDef<Course | SkeletonCourse>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: () => (
      <div className="flex items-center gap-2">
        <BookOpen className="size-4" />
        Title
      </div>
    ),
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="font-medium">
            <AutocompleteHighlight>{row.title}</AutocompleteHighlight>
          </div>
        </div>
      )
    },
    isRowHeader: true,
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4" />
        Status
      </div>
    ),
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <Skeleton className="h-6 w-20 rounded-full" />
      ) : (
        <Badge intent="outline" className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: () => (
      <div className="flex items-center gap-2">
        <Tag className="size-4" />
        Category
      </div>
    ),
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-muted-fg" />
          <span>
            <AutocompleteHighlight>{row.categoryName}</AutocompleteHighlight>
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "teacherName",
    accessorKey: "teacherName",
    header: () => (
      <div className="flex items-center gap-2">
        <User className="size-4" />
        Teacher
      </div>
    ),
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ) : row.teacherName ? (
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-fg" />
          <span>
            <AutocompleteHighlight>{row.teacherName}</AutocompleteHighlight>
          </span>
        </div>
      ) : (
        <span className="text-muted-fg">—</span>
      )
    },
    enableSorting: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar className="size-4" />
        Created
      </div>
    ),
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-fg" />
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const isSkeleton = "_skeleton" in row && row._skeleton
      return isSkeleton ? (
        <div className="flex justify-end">
          <Skeleton className="size-6 rounded" />
        </div>
      ) : (
        <div className="flex justify-end">
          <Menu>
            <MenuTrigger className="size-6">
              <EllipsisVerticalIcon />
            </MenuTrigger>
            <MenuContent aria-label="Actions" placement="left top">
              <MenuItem>View Details</MenuItem>
              <MenuItem>Edit Course</MenuItem>
              <MenuItem>Manage Enrollments</MenuItem>
              <MenuSeparator />
              <MenuItem intent="danger">Delete Course</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )
    },
    enableHiding: false,
  },
]

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(10)

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  })

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  // Reset page to 1 when sort changes
  useEffect(() => {
    setPage(1)
  }, [sortDescriptor.column, sortDescriptor.direction])

  const courses = useQuery(api.admin.courses.listAllCourses, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortBy: (sortDescriptor.column as string) || "createdAt",
    sortOrder: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    search: search || undefined,
  })

  const isLoading = courses === undefined

  const skeletonCourses: SkeletonCourse[] = useMemo(
    () =>
      Array.from({ length: pageSize }, (_, i) => ({
        _id: `skeleton-${i}`,
        id: `skeleton-${i}`,
        title: "",
        description: "",
        status: "draft" as const,
        categoryName: "",
        teacherName: "",
        createdAt: 0,
        _skeleton: true as const,
      })),
    [pageSize]
  )

  // Map courses to include id field from _id
  const mappedCourses = useMemo(
    (): Course[] =>
      courses?.courses.map((course) => ({
        ...course,
        id: course._id,
      })) ?? [],
    [courses]
  )

  const displayData: (Course | SkeletonCourse)[] = isLoading ? skeletonCourses : mappedCourses
  const totalPages = courses ? Math.ceil(courses.total / pageSize) : 0
  const totalRows = courses?.total ?? 0

  // Calculate correct indices based on actual data
  const startIndex = totalRows > 0 ? (page - 1) * pageSize + 1 : 0
  const endIndex = totalRows > 0 ? Math.min((page - 1) * pageSize + displayData.length, totalRows) : 0

  // Show empty state message
  const emptyStateMessage = useMemo(() => {
    if (isLoading) return null
    if (search && totalRows === 0) {
      return "No courses found matching your search."
    }
    if (totalRows === 0) {
      return "No courses available."
    }
    return null
  }, [isLoading, search, totalRows])

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        {/* Autocomplete wrapper for search highlighting - NO FILTER */}
        <Autocomplete onInputChange={setSearch}>
          <div className="flex justify-end">
            <SearchField aria-label="Search courses">
              <SearchInput placeholder="Search by title or description..." />
            </SearchField>
          </div>

          {emptyStateMessage ? (
            <div className="grid place-content-center rounded-lg border p-10">
              <p className="text-muted-foreground">{emptyStateMessage}</p>
            </div>
          ) : (
            <DataTable
              data={displayData}
              columns={columns}
              aria-label="Courses"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
              renderPagination={({ table }) => (
                <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-sm">
                    {isLoading ? (
                      <Skeleton className="h-4 w-40" />
                    ) : (
                      `${startIndex} to ${endIndex} of ${totalRows} courses`
                    )}
                  </p>

                  <DataTablePagination
                    table={table}
                    pageIndex={page - 1}
                    pageSize={pageSize}
                    pageCount={totalPages}
                    onPageChange={(newPage) => setPage(newPage + 1)}
                    onPageSizeChange={(size) => {
                      setPageSize(size)
                      setPage(1)
                    }}
                    showSelectedCount={false}
                    showPageNumbers={true}
                  />
                </div>
              )}
            />
          )}
        </Autocomplete>
      </div>
    </div>
  )
}

function AutocompleteHighlight({ children }: { children: string }) {
  const state = use(AutocompleteStateContext)

  if (!state?.inputValue) return children

  const index = children.toLowerCase().indexOf(state.inputValue.toLowerCase())

  if (index >= 0) {
    return (
      <>
        {children.slice(0, index)}
        <mark className="bg-primary text-primary-fg">
          {children.slice(index, index + state.inputValue.length)}
        </mark>
        {children.slice(index + state.inputValue.length)}
      </>
    )
  }

  return children
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-red-100 text-red-800",
  }
  return colors[status] || ""
}