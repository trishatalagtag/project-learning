"use client"

import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  AcademicCapIcon, EyeIcon,
  FolderIcon,
  UserIcon,
  UsersIcon
} from "@heroicons/react/24/outline"
import type { ColumnDef } from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"

type CoursesListResponse = FunctionReturnType<typeof api.admin.courses.listAllCourses>
type Course = CoursesListResponse["courses"][number]

interface ColumnsConfig {
  onView: (courseId: Id<"courses">) => void
}

export const createColumns = ({ onView }: ColumnsConfig): ColumnDef<Course>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course Title" />,
    cell: ({ row }) => (
      <div className="flex max-w-[300px] items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <AcademicCapIcon className="h-4 w-4" />
        </div>
        <span className="truncate font-medium">{row.getValue("title")}</span>
      </div>
    ),
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <FolderIcon className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("categoryName") || "—"}</span>
      </div>
    ),
  },
  {
    accessorKey: "teacherName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teacher" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        {row.getValue("teacherName") ? (
          <span>{row.getValue("teacherName")}</span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variants = {
        draft: "secondary",
        pending: "outline",
        approved: "default",
        published: "default",
        archived: "destructive",
      } as const

      return (
        <Badge
          variant={variants[status as keyof typeof variants] || "secondary"}
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "enrollmentCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Enrollments" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <UsersIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium tabular-nums">{row.getValue("enrollmentCount")}</span>
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const timestamp = row.getValue("updatedAt") as number
      return (
        <div className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
    cell: ({ row }) => {
      const course = row.original

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(course._id)}
          className="h-8"
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          View & Manage
        </Button>
      )
    },
  },
]

export type { Course }
