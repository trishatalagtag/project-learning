"use client"

import { type ColumnDef, DataTable } from "@/components/data-table"
import { DataTablePagination } from "@/components/data-table-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import { memo, useMemo, useState } from "react"
import type { SortDescriptor } from "react-aria-components"
import { TYPE_CONFIG } from "../config"
import type { ContentItem, ContentItemWithId } from "../types"
import { formatTimeAgo, mapItemsWithId } from "../utils"

interface TableViewProps {
  items: ContentItem[]
  onPreview: (item: ContentItem) => void
  onApprove: (item: ContentItem) => void
  onReject: (item: ContentItem) => void
  processing: string | null
}

export const TableView = memo(function TableView({
  items,
  onPreview,
  onApprove,
  onReject,
  processing,
}: TableViewProps) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  })
  const [page, setPage] = useState(1)
  const pageSize = 20

  const mappedItems = useMemo(() => mapItemsWithId(items), [items])

  const columns: ColumnDef<ContentItemWithId>[] = useMemo(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: () => (
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="size-4" />
            Content
          </div>
        ),
        cell: ({ row }) => {
          const config = TYPE_CONFIG[row.type]
          if (!config) return <div className="font-medium">{row.title || "Untitled"}</div>

          const Icon = config.icon
          const displayTitle = row.title || "Untitled"

          return (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Icon className="size-5 text-muted-fg" />
              </div>
              <div>
                <div className="font-medium">{displayTitle}</div>
                {row.description && (
                  <div className="line-clamp-1 text-muted-fg text-sm">{row.description}</div>
                )}
              </div>
            </div>
          )
        },
        isRowHeader: true,
        enableSorting: true,
      },
      {
        id: "type",
        accessorKey: "type",
        header: () => (
          <div className="flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="size-4" />
            Type
          </div>
        ),
        cell: ({ row }) => {
          const config = TYPE_CONFIG[row.type]
          if (!config) return <Badge intent="secondary" isCircle={false}>{row.type || "Unknown"}</Badge>

          return (
            <Badge intent={config.color} isCircle={false}>
              {config.label}
            </Badge>
          )
        },
        enableSorting: true,
      },
      {
        id: "courseName",
        accessorKey: "courseName",
        header: () => (
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4" />
            Course
          </div>
        ),
        cell: ({ row }) => <span className="text-sm">{row.courseName || "N/A"}</span>,
        enableSorting: true,
      },
      {
        id: "createdByName",
        accessorKey: "createdByName",
        header: () => (
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="size-4" />
            Submitted By
          </div>
        ),
        cell: ({ row }) => <span className="text-sm">{row.createdByName || "Unknown"}</span>,
        enableSorting: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: () => (
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="size-4" />
            Submitted
          </div>
        ),
        cell: ({ row }) => {
          const timeAgo = formatTimeAgo(row.createdAt)
          return <time className="text-muted-fg text-sm">{timeAgo}</time>
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isProcessing = processing === row.id
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                intent="outline"
                onPress={() => onPreview(row)}
                isDisabled={isProcessing}
              >
                <EyeIcon className="size-4" />
                Preview
              </Button>
              {row.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    intent="primary"
                    onPress={() => onApprove(row)}
                    isPending={isProcessing}
                    isDisabled={isProcessing}
                  >
                    <CheckCircleIcon className="size-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    intent="danger"
                    onPress={() => onReject(row)}
                    isDisabled={isProcessing}
                  >
                    <XCircleIcon className="size-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )
        },
        enableHiding: false,
      },
    ],
    [processing, onPreview, onApprove, onReject],
  )

  // Client-side sorting
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return mappedItems

    return [...mappedItems].sort((a, b) => {
      const aValue = a[sortDescriptor.column as keyof ContentItemWithId]
      const bValue = b[sortDescriptor.column as keyof ContentItemWithId]
      const modifier = sortDescriptor.direction === "ascending" ? 1 : -1

      if (aValue == null) return 1
      if (bValue == null) return -1
      if (aValue < bValue) return -modifier
      if (aValue > bValue) return modifier
      return 0
    })
  }, [mappedItems, sortDescriptor])

  // Client-side pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedItems.slice(start, start + pageSize)
  }, [sortedItems, page, pageSize])

  const totalPages = Math.ceil(sortedItems.length / pageSize)

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <DataTable
        data={paginatedItems}
        columns={columns}
        aria-label="Content approval queue"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        bleed
        renderPagination={({ table }) => (
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-fg text-sm">
              {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedItems.length)} of{" "}
              {sortedItems.length} items
            </p>

            <DataTablePagination
              table={table}
              pageIndex={page - 1}
              pageSize={pageSize}
              pageCount={totalPages}
              onPageChange={(newPage) => setPage(newPage + 1)}
              onPageSizeChange={() => {
                // Page size is fixed
              }}
              showSelectedCount={false}
              showPageNumbers={true}
            />
          </div>
        )}
      />
    </div>
  )
})

