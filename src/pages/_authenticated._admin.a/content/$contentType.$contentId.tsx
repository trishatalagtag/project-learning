"use client"

import { StatusBadge } from "@/components/shared/status/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/convex/_generated/api"
import type { ContentStatus } from "@/lib/constants/content-status"
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

export const Route = createFileRoute("/_authenticated/_admin/a/content/$contentType/$contentId")({
    component: ContentDetailPage,
})

const ACTION_ICONS = {
    approved: CheckCircleIcon,
    rejected: XCircleIcon,
    changes_requested: ExclamationCircleIcon,
    submitted: ClockIcon,
    resubmitted: ClockIcon,
} as const

const ACTION_COLORS = {
    approved: "text-green-600 bg-green-50 border-green-200",
    rejected: "text-red-600 bg-red-50 border-red-200",
    changes_requested: "text-yellow-600 bg-yellow-50 border-yellow-200",
    submitted: "text-blue-600 bg-blue-50 border-blue-200",
    resubmitted: "text-blue-600 bg-blue-50 border-blue-200",
} as const

function ContentDetailPage() {
    const { contentType, contentId } = Route.useParams()

    // Fetch content details
    const contentData = useQuery(
        api.admin.content.listContentPaginated,
        {
            paginationOpts: { numItems: 1, cursor: null },
            status: "published" as any, // We'll fetch and check
            contentType: contentType as any,
        }
    )

    // Fetch approval history
    const approvalHistory = useQuery(api.admin.content.getContentApprovalHistory, {
        contentType: contentType as any,
        contentId,
    })

    const isLoading = contentData === undefined || approvalHistory === undefined
    const content = contentData?.page?.[0]

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Error state for content data
    if (contentData === null) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
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

    // Error state for approval history
    if (approvalHistory === null) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">Failed to load approval history</h3>
                            <p className="mt-2 text-muted-foreground text-sm">
                                There was an error loading the approval history. Please try again.
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

    if (!content) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="font-medium text-lg">Content not found</p>
                        <Link to="/a/content">
                            <Button className="mt-4" variant="outline">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Content Browser
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Link to="/a/content">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Content Browser
                        </Button>
                    </Link>
                    <h1 className="font-bold text-3xl tracking-tight">{content?.title || "Content Details"}</h1>
                    <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                            {contentType}
                        </Badge>
                        {content?.status && <StatusBadge status={content.status as ContentStatus} />}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Content Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="font-medium text-muted-foreground text-sm">Title</label>
                                <p className="mt-1 text-base">{content?.title}</p>
                            </div>

                            {content?.description && (
                                <div>
                                    <label className="font-medium text-muted-foreground text-sm">Description</label>
                                    <p className="mt-1 text-base">{content.description}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="font-medium text-muted-foreground text-sm">Created By</label>
                                    <p className="mt-1 text-base">{content?.createdByName || "Unknown"}</p>
                                </div>
                                <div>
                                    <label className="font-medium text-muted-foreground text-sm">Created</label>
                                    <p className="mt-1 text-base">
                                        {content?.createdAt
                                            ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
                                            : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Approval History Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval History</CardTitle>
                            <CardDescription>
                                {approvalHistory && approvalHistory.length > 0
                                    ? `${approvalHistory.length} event${approvalHistory.length !== 1 ? 's' : ''}`
                                    : "No history available"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {approvalHistory && approvalHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {approvalHistory.map((log: any, index: number) => {
                                        const action = log.action?.toLowerCase() || "unknown"
                                        const Icon = ACTION_ICONS[action as keyof typeof ACTION_ICONS] || ClockIcon
                                        const colorClass = ACTION_COLORS[action as keyof typeof ACTION_COLORS] || "text-gray-600 bg-gray-50 border-gray-200"

                                        return (
                                            <div key={log._id} className="relative">
                                                {/* Timeline line */}
                                                {index < approvalHistory.length - 1 && (
                                                    <div className="absolute top-10 bottom-0 left-4 w-0.5 bg-border" />
                                                )}

                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${colorClass}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 space-y-1 pb-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-medium text-sm capitalize">
                                                                    {action.replace(/_/g, " ")}
                                                                </p>
                                                                <p className="text-muted-foreground text-xs">
                                                                    {log.performedByName || "System"}
                                                                </p>
                                                            </div>
                                                            <span className="text-muted-foreground text-xs">
                                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                            </span>
                                                        </div>

                                                        {/* Status change display */}
                                                        {log.previousStatus && log.newStatus && (
                                                            <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">
                                                                Status changed from <strong>{log.previousStatus}</strong> to <strong>{log.newStatus}</strong>
                                                            </p>
                                                        )}

                                                        {log.notes && (
                                                            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-muted-foreground text-sm">
                                                                {log.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <ClockIcon className="mb-3 h-12 w-12 text-muted-foreground" />
                                    <p className="font-medium text-sm">No history found for this item</p>
                                    <p className="mt-1 text-muted-foreground text-xs">
                                        Approval history will appear here once actions are taken
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
