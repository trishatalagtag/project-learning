import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"
import { BookOpen, Calendar, CheckCircle2, Tag, User } from "lucide-react"

type Course = FunctionReturnType<typeof api.admin.courses.listAllCourses>["courses"][number]

export const columns: ColumnDef<Course>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Title" title="Title" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="font-medium">{row.getValue("title")}</div>
      </div>
    ),
    meta: {
      label: "Title",
      placeholder: "Search titles...",
      variant: "text",
      icon: BookOpen,
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-blue-100 text-blue-800",
        published: "bg-green-100 text-green-800",
        archived: "bg-red-100 text-red-800",
      }

      return (
        <Badge intent="outline" className={statusColors[status] || ""}>
          {status}
        </Badge>
      )
    },
    meta: {
      label: "Status",
      variant: "select",
      icon: CheckCircle2,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "category",
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Category" title="Category" />
    ),
    cell: ({ row }) => {
      const categoryName = row.original.categoryName
      return categoryName ? (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span>{categoryName}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    meta: {
      label: "Category",
      variant: "select",
      icon: Tag,
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "teacher",
    accessorKey: "teacherName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Teacher" title="Teacher" />
    ),
    cell: ({ row }) => {
      const teacherName = row.original.teacherName
      return teacherName ? (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{teacherName}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    meta: {
      label: "Teacher",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "createdAt",
    accessorKey: "_creationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Created" title="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{date.toLocaleDateString()}</span>
        </div>
      )
    },
    meta: {
      label: "Created At",
      variant: "date",
      icon: Calendar,
    },
    enableSorting: true,
  },
]