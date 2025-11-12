"use client"

import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NormalizedCategoryNode } from "@/lib/categories"
import {
    EllipsisHorizontalIcon,
    FolderIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/solid"
import type { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"

type Category = NormalizedCategoryNode

interface ColumnsConfig {
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

export const createColumns = ({
    onEdit,
    onDelete,
}: ColumnsConfig): ColumnDef<Category>[] => [
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
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category Name" />,
            cell: ({ row }) => {
                const category = row.original
                const indent = category.level > 1 ? category.level - 1 : 0
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderIcon className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1">
                            {indent > 0 && (
                                <span className="text-muted-foreground text-sm">
                                    {"\u00A0\u00A0".repeat(indent)}
                                    {"└─ "}
                                </span>
                            )}
                            <span className="font-medium">{category.name}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "level",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Level" />,
            cell: ({ row }) => {
                const level = row.getValue("level") as number
                const variants = {
                    1: "default",
                    2: "secondary",
                    3: "outline",
                } as const
                return (
                    <Badge variant={variants[level as keyof typeof variants] || "secondary"}>
                        Level {level}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "parentName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Parent" />,
            cell: ({ row }) => {
                const parentName = row.getValue("parentName") as string | undefined
                return (
                    <div className="text-muted-foreground text-sm">
                        {parentName || "—"}
                    </div>
                )
            },
        },
        {
            accessorKey: "courseCount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
            cell: ({ row }) => {
                const count = (row.getValue("courseCount") as number | undefined) ?? 0
                return (
                    <div className="font-medium tabular-nums">
                        {count}
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => {
                const timestamp = row.getValue("createdAt") as number
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
                const category = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <EllipsisHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
                                className="text-destructive focus:text-destructive"
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

export type { Category }

