"use client"

import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { Progress } from "@/components/ui/progress"
import type { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"

type LearnerProgress = FunctionReturnType<
    typeof api.faculty.progress.getCourseProgress
>[number]

interface ColumnsConfig {
    courseId: Id<"courses">
}

export const createLearnerProgressColumns = ({
    courseId,
}: ColumnsConfig): ColumnDef<LearnerProgress>[] => [
        {
            accessorKey: "userName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
            cell: ({ row }) => {
                const progress = row.original
                return (
                    <Link
                        to={"/f/courses/$courseId/learners/$userId" as any}
                        params={{ courseId, userId: progress.userId } as any}
                        className="font-medium text-primary hover:underline"
                    >
                        {progress.userName}
                    </Link>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: "overallProgress",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Overall Progress" />,
            cell: ({ row }) => {
                const progress = row.getValue("overallProgress") as number
                return (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )
            },
            enableSorting: true,
        },
        {
            id: "lessonProgress",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Lessons" />,
            cell: ({ row }) => {
                const progress = row.original
                const percentage =
                    progress.totalLessons > 0
                        ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
                        : 0
                return (
                    <div className="text-sm">
                        <span className="font-medium">
                            {progress.completedLessons} / {progress.totalLessons}
                        </span>
                        <span className="ml-2 text-muted-foreground">({percentage}%)</span>
                    </div>
                )
            },
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const a = rowA.original
                const b = rowB.original
                const aProgress = a.totalLessons > 0 ? a.completedLessons / a.totalLessons : 0
                const bProgress = b.totalLessons > 0 ? b.completedLessons / b.totalLessons : 0
                return aProgress - bProgress
            },
        },
        {
            id: "quizScore",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Quiz Score" />,
            cell: ({ row }) => {
                const progress = row.original
                if (progress.averageQuizScore === undefined) {
                    return <span className="text-muted-foreground text-sm">N/A</span>
                }
                return (
                    <span className="font-medium text-sm">
                        {progress.averageQuizScore.toFixed(1)}%
                    </span>
                )
            },
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.averageQuizScore ?? -1
                const b = rowB.original.averageQuizScore ?? -1
                return a - b
            },
        },
        {
            id: "assignmentsSubmitted",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assignments" />
            ),
            cell: ({ row }) => {
                const progress = row.original
                return (
                    <div className="text-sm">
                        <span className="font-medium">
                            {progress.submittedAssignments} / {progress.totalAssignments}
                        </span>
                    </div>
                )
            },
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const a = rowA.original
                const b = rowB.original
                const aProgress =
                    a.totalAssignments > 0 ? a.submittedAssignments / a.totalAssignments : 0
                const bProgress =
                    b.totalAssignments > 0 ? b.submittedAssignments / b.totalAssignments : 0
                return aProgress - bProgress
            },
        },
        {
            id: "assignmentScore",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assignment Score" />
            ),
            cell: ({ row }) => {
                const progress = row.original
                if (progress.averageAssignmentScore === undefined) {
                    return <span className="text-muted-foreground text-sm">N/A</span>
                }
                return (
                    <span className="font-medium text-sm">
                        {progress.averageAssignmentScore.toFixed(1)}%
                    </span>
                )
            },
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.averageAssignmentScore ?? -1
                const b = rowB.original.averageAssignmentScore ?? -1
                return a - b
            },
        },
    ]

