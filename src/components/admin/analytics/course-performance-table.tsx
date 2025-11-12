import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "@tanstack/react-router";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import type { FunctionReturnType } from "convex/server";
import { useMemo, useState } from "react";

type CourseStats = FunctionReturnType<
    typeof api.admin.analytics.getCourseCompletionRates
>[number];

interface CoursePerformanceTableProps {
    data: FunctionReturnType<typeof api.admin.analytics.getCourseCompletionRates>;
}

export function CoursePerformanceTable({ data }: CoursePerformanceTableProps) {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "completionRate",
            desc: true,
        },
    ]);

    const columns = useMemo<ColumnDef<CourseStats>[]>(
        () => [
            {
                accessorKey: "courseName",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Course Name
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const courseId = row.original.courseId;
                    const courseName = row.getValue("courseName") as string;
                    return (
                        <button
                            type="button"
                            onClick={() => navigate({ to: `/a/courses/${courseId}` })}
                            className="font-medium text-primary hover:underline"
                        >
                            {courseName}
                        </button>
                    );
                },
            },
            {
                accessorKey: "totalEnrollments",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Total Enrollments
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    return (
                        <div className="text-center">
                            {row.getValue("totalEnrollments") as number}
                        </div>
                    );
                },
            },
            {
                accessorKey: "activeEnrollments",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Active
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    return (
                        <div className="text-center">
                            {row.getValue("activeEnrollments") as number}
                        </div>
                    );
                },
            },
            {
                accessorKey: "completedEnrollments",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Completed
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    return (
                        <div className="text-center">
                            {row.getValue("completedEnrollments") as number}
                        </div>
                    );
                },
            },
            {
                accessorKey: "completionRate",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Completion Rate
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const rate = row.getValue("completionRate") as number;
                    return (
                        <div className="text-center">
                            <span
                                className={cn(
                                    "font-medium",
                                    rate >= 75
                                        ? "text-green-600"
                                        : rate >= 50
                                            ? "text-yellow-600"
                                            : "text-red-600",
                                )}
                            >
                                {rate.toFixed(2)}%
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "averageCompletionTime",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            Avg. Completion Time
                            {column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-4" />
                            ) : column.getIsSorted() === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-4" />
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const time = row.getValue("averageCompletionTime") as
                        | number
                        | undefined;
                    return (
                        <div className="text-center">
                            {time !== undefined ? `${time.toFixed(0)} days` : "N/A"}
                        </div>
                    );
                },
            },
        ],
        [navigate],
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
