"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { memo } from "react"
import { STATUS_CONFIG, TYPE_CONFIG } from "../config"
import type { ContentItem } from "../types"
import { formatTimeAgo, getItemDisplayTitle } from "../utils"

interface PreviewSheetProps {
    item: ContentItem | null
    isOpen: boolean
    onClose: () => void
    onApprove: () => void
    onReject: () => void
    isProcessing: boolean
}

export const PreviewSheet = memo(function PreviewSheet({
    item,
    isOpen,
    onClose,
    onApprove,
    onReject,
    isProcessing,
}: PreviewSheetProps) {
    if (!item) return null

    const config = TYPE_CONFIG[item.type]
    const displayTitle = getItemDisplayTitle(item)
    const timeAgo = formatTimeAgo(item.createdAt)

    // If config is missing, use fallbacks
    const Icon = config?.icon || CheckCircleIcon
    const typeColor = config?.color || "secondary"
    const typeLabel = config?.label || item.type || "Unknown"

    const statusConfig =
        item.status === "pending"
            ? STATUS_CONFIG.pending
            : item.status === "approved"
                ? STATUS_CONFIG.approved
                : STATUS_CONFIG.draft

    const statusColor = statusConfig?.color || "secondary"
    const statusLabel = statusConfig?.label || item.status || "Unknown"

    return (
        <Sheet isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-2xl">
                <SheetHeader className="sticky top-0 z-10 border-b bg-overlay pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
                            <Icon className="size-6 text-muted-fg" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle>{displayTitle}</SheetTitle>
                            <SheetDescription>
                                <Badge intent={typeColor} isCircle={false} className="mt-1">
                                    {typeLabel}
                                </Badge>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                <SheetBody className="space-y-6">
                    {/* Details Section */}
                    <div>
                        <h3 className="mb-3 font-semibold text-sm">Details</h3>
                        <div className="space-y-2 rounded-lg border bg-secondary/50 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Type:</span>
                                <span className="font-medium">{typeLabel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Status:</span>
                                <Badge intent={statusColor} isCircle={false}>
                                    {statusLabel}
                                </Badge>
                            </div>
                            {item.courseName && (
                                <div className="flex justify-between">
                                    <span className="text-muted-fg">Course:</span>
                                    <span className="font-medium">{item.courseName}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Submitted by:</span>
                                <span className="font-medium">{item.createdByName || "Unknown"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Submitted:</span>
                                <time className="font-medium">{timeAgo}</time>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {item.description && (
                        <div>
                            <h3 className="mb-3 font-semibold text-sm">Description</h3>
                            <div className="rounded-lg border bg-secondary/50 p-4">
                                <p className="text-muted-fg text-sm leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Additional metadata could go here */}
                    <div>
                        <h3 className="mb-3 font-semibold text-sm">Metadata</h3>
                        <div className="space-y-2 rounded-lg border bg-secondary/50 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Created:</span>
                                <time className="font-medium">
                                    {new Date(item._creationTime).toLocaleString()}
                                </time>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Last updated:</span>
                                <time className="font-medium">{new Date(item.createdAt).toLocaleString()}</time>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-fg">Content ID:</span>
                                <code className="rounded bg-muted px-1 font-mono text-xs">{item._id}</code>
                            </div>
                        </div>
                    </div>
                </SheetBody>

                {/* Sticky Footer Actions */}
                {item.status === "pending" && (
                    <div className="sticky bottom-0 z-10 flex gap-2 border-t bg-overlay p-4">
                        <Button
                            intent="primary"
                            onPress={onApprove}
                            isPending={isProcessing}
                            isDisabled={isProcessing}
                            className="flex-1"
                        >
                            <CheckCircleIcon className="size-4" />
                            Approve
                        </Button>
                        <Button
                            intent="danger"
                            onPress={onReject}
                            isPending={isProcessing}
                            isDisabled={isProcessing}
                            className="flex-1"
                        >
                            <XCircleIcon className="size-4" />
                            Reject
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
})

