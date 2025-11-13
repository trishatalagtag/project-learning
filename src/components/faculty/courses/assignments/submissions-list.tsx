"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { SubmissionsTable } from "./submissions-table"
import { SubmissionsTableSkeleton } from "./submissions-table-skeleton"

export function SubmissionsList() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as {
        status?: "all" | "draft" | "submitted" | "graded"
        readyToGrade?: boolean
        search?: string
        pageIndex?: number
        pageSize?: number
        sortBy?: string
        sortOrder?: "asc" | "desc"
    }

    const { courseId, assignmentId } = useParams({ strict: false })
    const {
        status = "all",
        readyToGrade = false,
        search: searchQuery = "",
        pageIndex = 0,
        pageSize = 10,
        sortBy = "submittedAt",
        sortOrder = "desc",
    } = search

    const debouncedSearch = useDebounce(searchQuery, 300)

    // Fetch assignment data
    const assignment = useQuery(api.faculty.assignments.getAssignmentById, {
        assignmentId: assignmentId as Id<"assignments">,
    })

    // Fetch submissions
    const submissionsData = useQuery(
        api.faculty.grading.listSubmissionsForAssignment,
        assignmentId
            ? {
                assignmentId: assignmentId as Id<"assignments">,
                status: status === "all" ? undefined : status,
                search: debouncedSearch || undefined,
                limit: pageSize,
                offset: pageIndex * pageSize,
                sortBy,
                sortOrder,
            }
            : "skip"
    )

    const isLoading = assignment === undefined || submissionsData === undefined
    const isError = assignment === null || submissionsData === null

    const updateSearch = (updates: Partial<typeof search>) => {
        navigate({
            search: (prev: any) => ({ ...prev, ...updates }),
        } as any)
    }

    const handleStatusChange = (value: string) => {
        updateSearch({
            status: value as typeof status,
            pageIndex: 0,
            readyToGrade: false,
        })
    }

    const handleReadyToGradeToggle = () => {
        // Filter client-side: show only submitted but not graded
        updateSearch({
            readyToGrade: !readyToGrade,
            status: readyToGrade ? "all" : "submitted",
            pageIndex: 0,
        })
    }

    // Filter submissions client-side for "ready to grade" (submitted but not graded)
    const filteredSubmissions = useMemo(() => {
        if (!readyToGrade) return submissionsData?.submissions || []
        return (submissionsData?.submissions || []).filter((s) => s.status === "submitted" && !s.grade)
    }, [submissionsData?.submissions, readyToGrade])

    const handleSearchChange = (value: string) => {
        updateSearch({
            search: value,
            pageIndex: 0,
        })
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to="/f/courses/$courseId"
                            params={{ courseId }}
                            search={{ tab: "content" }}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Course
                        </Link>
                    </Button>
                </div>
                <SubmissionsTableSkeleton />
            </div>
        )
    }

    // Error state
    if (isError || !assignment) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to="/f/courses/$courseId"
                            params={{ courseId }}
                            search={{ tab: "content" }}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Course
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Empty>
                            <EmptyMedia>
                                <Loader2 className="h-12 w-12 text-destructive" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>Error Loading Submissions</EmptyTitle>
                                <EmptyDescription>
                                    {!assignment
                                        ? "Assignment not found or you don't have access to it."
                                        : "Failed to load submissions. Please try again."}
                                </EmptyDescription>
                            </EmptyHeader>
                            <Button
                                onClick={() => {
                                    window.location.reload()
                                }}
                                variant="outline"
                            >
                                Retry
                            </Button>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const submissions = submissionsData?.submissions ?? []
    const totalCount = submissionsData?.total ?? 0
    const pageCount = Math.ceil(totalCount / pageSize)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            to="/f/courses/$courseId"
                            params={{ courseId }}
                            search={{ tab: "content" }}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Course
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-semibold text-2xl">{assignment.title}</h1>
                        <p className="text-muted-foreground text-sm">Assignment Submissions</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="graded">Graded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant={readyToGrade ? "default" : "outline"}
                            onClick={handleReadyToGradeToggle}
                            size="sm"
                        >
                            Ready to Grade
                        </Button>

                        <div className="relative min-w-[200px] flex-1">
                            <MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name or email..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Table */}
            {submissions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Empty>
                            <EmptyMedia>
                                <Loader2 className="h-12 w-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No Submissions</EmptyTitle>
                                <EmptyDescription>
                                    No submissions have been received for this assignment yet.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <SubmissionsTable
                    data={filteredSubmissions}
                    courseId={courseId as Id<"courses">}
                    assignmentId={assignmentId as Id<"assignments">}
                    pageCount={pageCount}
                />
            )}
        </div>
    )
}

