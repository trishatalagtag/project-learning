"use client"

import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EyeIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"

type Submission = FunctionReturnType<
    typeof api.faculty.grading.listSubmissionsForAssignment
>["submissions"][number]

interface ColumnsConfig {
    courseId: Id<"courses">
    assignmentId: Id<"assignments">
}

export const createSubmissionsColumns = ({
    courseId,
    assignmentId,
}: ColumnsConfig): ColumnDef<Submission>[] => [
        {
            accessorKey: "userName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
            cell: ({ row }) => {
                const submission = row.original
                return (
                    <Link
                        to={"/f/courses/$courseId/learners/$userId" as any}
                        params={{ courseId, userId: submission.userId } as any}
                        className="font-medium text-primary hover:underline"
                    >
                        {submission.userName}
                    </Link>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const variants: Record<string, "default" | "secondary" | "outline"> = {
                    draft: "secondary",
                    submitted: "outline",
                    graded: "default",
                }
                return (
                    <Badge variant={variants[status] || "secondary"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: "submittedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
            cell: ({ row }) => {
                const submittedAt = row.getValue("submittedAt") as number | null
                if (!submittedAt) {
                    return <span className="text-muted-foreground text-sm">Not submitted</span>
                }
                return (
                    <span className="text-sm">
                        {format(new Date(submittedAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: "grade",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Grade" />,
            cell: ({ row }) => {
                const submission = row.original
                if (!submission.grade) {
                    return <span className="text-muted-foreground text-sm">Not graded</span>
                }
                // Note: maxPoints comes from assignment, not submission
                // For now, just show the grade
                return (
                    <span className="font-medium text-sm">
                        {submission.grade}
                    </span>
                )
            },
            enableSorting: true,
        },
        {
            id: "isLate",
            header: "Late",
            cell: ({ row }) => {
                const isLate = row.original.isLate
                if (!isLate) {
                    return null
                }
                return (
                    <Badge variant="destructive" className="text-xs">
                        Late
                    </Badge>
                )
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const submission = row.original
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8"
                    >
                        <Link
                            to={"/f/courses/$courseId/assignments/$assignmentId/submissions/$submissionId" as any}
                            params={{
                                courseId,
                                assignmentId,
                                submissionId: submission._id,
                            } as any}
                        >
                            <EyeIcon className="mr-2 h-4 w-4" />
                            {submission.grade ? "View" : "Grade"}
                        </Link>
                    </Button>
                )
            },
            enableSorting: false,
        },
    ]

