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
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
    EyeIcon,
    FolderIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

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
type StatusFilter = "all" | "draft" | "pending" | "approved" | "published" | "changes_requested"

function ContentBrowserPage() {
    const navigate = useNavigate()
    const searchParams = useSearch({ from: "/_authenticated/_admin/a/content/" })

    // Get filter values from URL search params or use defaults
    const contentTypeFromUrl = (searchParams?.contentType as ContentTypeFilter) ?? "module"
    const statusFromUrl = (searchParams?.status as StatusFilter) ?? "all"
    const searchFromUrl = (searchParams?.q as string) ?? ""

    const [contentType, setContentType] = useState<ContentTypeFilter>(contentTypeFromUrl)
    const [status, setStatus] = useState<StatusFilter>(statusFromUrl)
    const [search, setSearch] = useState(searchFromUrl)
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 20

    // Sync contentType from URL on mount
    useEffect(() => {
        setContentType(contentTypeFromUrl)
    }, [contentTypeFromUrl])

    // Sync status from URL on mount
    useEffect(() => {
        setStatus(statusFromUrl)
    }, [statusFromUrl])

    // Sync search from URL on mount
    useEffect(() => {
        setSearch(searchFromUrl)
    }, [searchFromUrl])

    // Update URL when filters change
    const handleContentTypeChange = (newType: ContentTypeFilter) => {
        setContentType(newType)
        setCurrentPage(0)
        navigate({
            to: "/a/content",
            search: { ...searchParams, contentType: newType, pageIndex: 0 }
        })
    }

    const handleStatusChange = (newStatus: StatusFilter) => {
        setStatus(newStatus)
        setCurrentPage(0)
        navigate({
            to: "/a/content",
            search: { ...searchParams, status: newStatus, pageIndex: 0 }
        })
    }

    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch)
        setCurrentPage(0)
        navigate({
            to: "/a/content",
            search: { ...searchParams, q: newSearch, pageIndex: 0 }
        })
    }

    // Query for paginated content
    const contentData = useQuery(api.admin.content.listContentPaginated, {
        paginationOpts: {
            numItems: itemsPerPage,
            cursor: null,
        },
        status: status === "all" ? undefined : status,
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

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Loading content...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (contentData === null) {
        return (
            <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">Failed to load content</h3>
                            <p className="mt-2 text-muted-foreground text-sm">
                                There was an error loading the content data. Please try again.
                            </p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">Content Management</h1>
                    <p className="mt-2 text-muted-foreground">
                        Browse and manage all content across courses, modules, lessons, quizzes, and assignments
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Total Items</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">{content.length}</div>
                        <p className="text-muted-foreground text-xs">
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
                            <label className="font-medium text-sm">Content Type</label>
                            <Select value={contentType} onValueChange={(value) => handleContentTypeChange(value as ContentTypeFilter)}>
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
                            <label className="font-medium text-sm">Status</label>
                            <Select value={status} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
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
                            <label className="font-medium text-sm">Search</label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
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
                            <Icon className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="font-medium text-lg">No content found</p>
                            <p className="mt-1 text-muted-foreground text-sm">
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
                                                                <span className="mt-1 line-clamp-1 text-muted-foreground text-xs">
                                                                    {item.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">{item.createdByName || "Unknown"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-muted-foreground text-sm">
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
                                                                <EyeIcon className="mr-2 h-4 w-4" />
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
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-muted-foreground text-sm">
                                        Showing {filteredContent.length} items
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={contentData?.isDone}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
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
