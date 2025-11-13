"use client"

import { DataTablePagination } from "@/components/table/data-table-pagination"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"
import { useMemo, useState } from "react"
import { createSubmissionsColumns } from "./submissions-columns"

type Submission = FunctionReturnType<
    typeof api.faculty.grading.listSubmissionsForAssignment
>["submissions"][number]

interface SubmissionsTableProps {
    data: Submission[]
    courseId: Id<"courses">
    assignmentId: Id<"assignments">
    pageCount: number
}

export function SubmissionsTable({
    data,
    courseId,
    assignmentId,
    pageCount,
}: SubmissionsTableProps) {
    const columns = useMemo(
        () =>
            createSubmissionsColumns({
                courseId,
                assignmentId,
            }),
        [courseId, assignmentId]
    )

    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable<Submission>({
        data,
        columns,
        pageCount,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    })

    return (
        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
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
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => {
                                    const isReadyToGrade =
                                        row.original.status === "submitted" && !row.original.grade
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className={
                                                isReadyToGrade
                                                    ? "bg-yellow-50 dark:bg-yellow-950/20"
                                                    : ""
                                            }
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="border-t p-4">
                    <DataTablePagination table={table} />
                </div>
            </CardContent>
        </Card>
    )
}

