"use client"

import { StatusBadge } from "@/components/shared/status/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyContent,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    FolderIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { useMemo, useState } from "react"

const CONTENT_TYPE_ICONS = {
    module: FolderIcon,
    lesson: BookOpenIcon,
    quiz: ClipboardDocumentListIcon,
    assignment: DocumentTextIcon,
} as const

type ContentTypeFilter = "all" | "module" | "lesson" | "quiz" | "assignment"

export const Route = createFileRoute("/_authenticated/_faculty/f/content-approvals")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Pending Approvals",
        }
    },
    component: FacultyContentApprovalsPage,
})

function FacultyContentApprovalsPage() {
    const { auth } = useRouteContext({ strict: false })
    const userId = auth?.session?.user?.id

    const [contentType, setContentType] = useState<ContentTypeFilter>("all")
    const [search, setSearch] = useState("")

    // Get all pending content (admin API, but we'll filter by current user)
    const pendingContent = useQuery(api.admin.content.getAllPendingContent, {})

    const myPendingContent = useMemo(() => {
        if (!pendingContent || !userId) return []

        const allContent = [
            ...pendingContent.modules.map((item) => ({ ...item, type: "module" as const })),
            ...pendingContent.lessons.map((item) => ({ ...item, type: "lesson" as const })),
            ...pendingContent.quizzes.map((item) => ({ ...item, type: "quiz" as const })),
            ...pendingContent.assignments.map((item) => ({ ...item, type: "assignment" as const })),
        ]

        // Filter by current user
        return allContent.filter((item) => item.createdBy === userId)
    }, [pendingContent, userId])

    const filteredContent = useMemo(() => {
        return myPendingContent.filter((item) => {
            const matchesType = contentType === "all" || item.type === contentType
            const matchesSearch =
                search.trim().length === 0 ||
                item.title.toLowerCase().includes(search.toLowerCase())

            return matchesType && matchesSearch
        })
    }, [myPendingContent, contentType, search])

    const isLoading = pendingContent === undefined
    const hasError = pendingContent === null

    if (hasError) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ClipboardDocumentListIcon className="h-12 w-12 text-destructive" />
                                </EmptyMedia>
                                <EmptyTitle>Failed to load content</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching pending content. Please try again.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Pending Approvals</h1>
                <p className="mt-2 text-muted-foreground">
                    View your content items that are awaiting admin approval
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search content..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select value={contentType} onValueChange={(value) => setContentType(value as ContentTypeFilter)}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="module">Modules</SelectItem>
                                <SelectItem value="lesson">Lessons</SelectItem>
                                <SelectItem value="quiz">Quizzes</SelectItem>
                                <SelectItem value="assignment">Assignments</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Content List */}
            {isLoading ? (
                <Card>
                    <CardContent className="py-6">
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : filteredContent.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <ClipboardDocumentListIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No pending content</EmptyTitle>
                                <EmptyDescription>
                                    {search || contentType !== "all"
                                        ? "No content matches your filters."
                                        : "You don't have any content awaiting approval."}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {filteredContent.length} {filteredContent.length === 1 ? "item" : "items"} pending approval
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContent.map((item) => {
                                    const Icon = CONTENT_TYPE_ICONS[item.type]
                                    const courseId = "courseId" in item ? item.courseId : undefined
                                    const _moduleId = "moduleId" in item ? item.moduleId : undefined

                                    return (
                                        <TableRow key={`${item.type}-${item._id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="capitalize">{item.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                                {courseId ? (
                                                    <Link
                                                        to="/f/courses/$courseId"
                                                        params={{ courseId: courseId as Id<"courses"> }}
                                                        className="text-primary hover:underline"
                                                    >
                                                        View Course
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.status} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                                {courseId && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link
                                                            to="/f/courses/$courseId"
                                                            params={{ courseId: courseId as Id<"courses"> }}
                                                        >
                                                            View
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
