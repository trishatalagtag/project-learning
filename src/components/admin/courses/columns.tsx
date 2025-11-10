"use client";

import { EllipsisHorizontalIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import type { FunctionReturnType } from "convex/server";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type CoursesListResponse = FunctionReturnType<
    typeof api.admin.courses.listAllCourses
>;
type Course = CoursesListResponse["courses"][number];

interface ColumnsConfig {
    onView: (courseId: Id<"courses">) => void;
}

export const createColumns = ({
    onView,
}: ColumnsConfig): ColumnDef<Course>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => (
                <div className="font-medium max-w-[300px] truncate">{row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "categoryName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
            cell: ({ row }) => <div>{row.getValue("categoryName") || "—"}</div>,
        },
        {
            accessorKey: "teacherName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Teacher" />
            ),
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.getValue("teacherName") || (
                        <span className="text-muted-foreground">Unassigned</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const variants = {
                    draft: "secondary",
                    pending: "outline",
                    approved: "default",
                    published: "default",
                    archived: "destructive",
                } as const;

                return (
                    <Badge variant={variants[status as keyof typeof variants] || "secondary"} className="capitalize">
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "enrollmentCount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Enrollments" />
            ),
            cell: ({ row }) => (
                <div className="text-right tabular-nums">
                    {row.getValue("enrollmentCount")}
                </div>
            ),
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
            cell: ({ row }) => {
                const timestamp = row.getValue("updatedAt") as number;
                return (
                    <div className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </div>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const course = row.original;

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

                            <DropdownMenuItem onClick={() => onView(course._id)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View & Manage
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

export type { Course };

