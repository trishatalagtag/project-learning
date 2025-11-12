"use client"

import { StatusBadge } from "@/components/shared/status/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { ContentStatus } from "@/lib/constants/content-status"
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    FolderIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { EyeIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_authenticated/_admin/a/content/")({
    component: ContentBrowserPage,
})

const CONTENT_TYPE_ICONS = {
    module: FolderIcon,
    lesson: BookOpenIcon,
    quiz: ClipboardDocumentListIcon,
    assignment: DocumentTextIcon,
} as const

type ContentTypeFilter = "module" | "lesson" | "quiz" | "assignment"
type StatusFilter = "pending" | "approved" | "draft" | "published" | "changes_requested"

function ContentBrowserPage() {
    const [contentType, setContentType] = useState<ContentTypeFilter>("module")
    const [status, setStatus] = useState<StatusFilter>("published")
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 20

    // Query for paginated content
    const contentData = useQuery(api.admin.content.listContentPaginated, {
        paginationOpts: {
            numItems: itemsPerPage,
            cursor: null,
        },
        status,
        contentType,
    })

    const isLoading = contentData === undefined
    const content = contentData?.page ?? []

    // Client-side search filtering
    const filteredContent = content.filter((item) => {
        const matchesSearch =
            search.trim().length === 0 ||
            item.title?.toLowerCase().includes(search.toLowerCase())
        return matchesSearch
    })

    const Icon = CONTENT_TYPE_ICONS[contentType]

    return (
        <div className="container mx-auto space-y-6 py-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Browse and manage all content across courses, modules, lessons, quizzes, and assignments
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{content.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {contentType}s in {status} status
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter content by type and status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Content Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content Type</label>
                            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentTypeFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="module">Modules</SelectItem>
                                    <SelectItem value="lesson">Lessons</SelectItem>
                                    <SelectItem value="quiz">Quizzes</SelectItem>
                                    <SelectItem value="assignment">Assignments</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">Pending Review</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="changes_requested">Changes Requested</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s
                            </CardTitle>
                            <CardDescription>
                                {filteredContent.length} item{filteredContent.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Icon className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No content found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Type</TableHead>
                                            <TableHead className="min-w-[300px]">Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created By</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContent.map((item) => {
                                            const TypeIcon = CONTENT_TYPE_ICONS[contentType]
                                            return (
                                                <TableRow key={item._id}>
                                                    <TableCell>
                                                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{item.title}</span>
                                                            {item.description && (
                                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                                    {item.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={status as ContentStatus} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">{item.createdByName || "Unknown"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            to="/a/content/$contentType/$contentId"
                                                            params={{
                                                                contentType,
                                                                contentId: item._id,
                                                            }}
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {(contentData?.continueCursor || currentPage > 0) && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {filteredContent.length} items
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={contentData?.isDone}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
