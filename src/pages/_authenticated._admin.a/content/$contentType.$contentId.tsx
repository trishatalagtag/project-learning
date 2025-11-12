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
} from "@heroicons/react/24/outline"
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!content && !isLoading) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium">Content not found</p>
                        <Link to="/a/content">
                            <Button className="mt-4" variant="outline">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Content Browser
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto space-y-6 py-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Link to="/a/content">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Content Browser
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{content?.title || "Content Details"}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                            {contentType}
                        </Badge>
                        {content?.status && <StatusBadge status={content.status as ContentStatus} />}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Title</label>
                                <p className="text-base mt-1">{content?.title}</p>
                            </div>

                            {content?.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-base mt-1">{content.description}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                                    <p className="text-base mt-1">{content?.createdByName || "Unknown"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-base mt-1">
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
                                                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                                                )}

                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${colorClass}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 space-y-1 pb-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium capitalize">
                                                                    {action.replace(/_/g, " ")}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {log.performedByName || "System"}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                            </span>
                                                        </div>

                                                        {log.notes && (
                                                            <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md mt-2">
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
                                    <ClockIcon className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No approval history available
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
