"use client"

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
import { createLearnerProgressColumns } from "./learner-progress-columns"

type LearnerProgress = FunctionReturnType<
    typeof api.faculty.progress.getCourseProgress
>[number]

interface LearnerProgressTableProps {
    data: LearnerProgress[]
    courseId: Id<"courses">
}

export function LearnerProgressTable({ data, courseId }: LearnerProgressTableProps) {
    const columns = useMemo(() => createLearnerProgressColumns({ courseId }), [courseId])
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable<LearnerProgress>({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: false,
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
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => {
                                            // Navigate to individual learner progress
                                            window.location.href = `/a/courses/${courseId}/learners/${row.original.userId}`
                                        }}
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No learners found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

