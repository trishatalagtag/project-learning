"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as Kanban from "@/components/ui/kanban"
import {
    AcademicCapIcon,
    BookOpenIcon,
    EyeIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline"
import { memo } from "react"
import { TYPE_CONFIG } from "../config"
import type { ContentItem } from "../types"
import { formatTimeAgo, getItemDisplayTitle } from "../utils"

interface ContentCardProps {
    item: ContentItem
    onPreview: (item: ContentItem) => void
    onApprove?: (item: ContentItem) => void
    onReject?: (item: ContentItem) => void
    isProcessing?: boolean
    showActions?: boolean
    asKanbanItem?: boolean
}

export const ContentCard = memo(function ContentCard({
    item,
    onPreview,
    onApprove,
    onReject,
    isProcessing = false,
    showActions = true,
    asKanbanItem = false,
}: ContentCardProps) {
    const config = TYPE_CONFIG[item.type]
    const timeAgo = formatTimeAgo(item.createdAt)
    const displayTitle = getItemDisplayTitle(item)

    // If config is missing, use a fallback
    const Icon = config?.icon || AcademicCapIcon
    const badgeColor = config?.color || "secondary"
    const badgeLabel = config?.label || item.type || "Unknown"

    const cardContent = (
        <div className="group rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="size-5 text-muted-fg" />
                </div>
                <Badge intent={badgeColor} isCircle={false} className="text-xs">
                    {badgeLabel}
                </Badge>
            </div>

            <h3 className="mb-1 line-clamp-2 font-medium text-sm">{displayTitle}</h3>
            {item.description && (
                <p className="mb-3 line-clamp-2 text-muted-fg text-xs">{item.description}</p>
            )}

            <div className="mb-4 space-y-1 text-muted-fg text-xs">
                {item.courseName && (
                    <div className="flex items-center gap-1">
                        <BookOpenIcon className="size-3" />
                        <span className="line-clamp-1">{item.courseName}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <AcademicCapIcon className="size-3" />
                    <span className="line-clamp-1">{item.createdByName || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1">
                    <PencilSquareIcon className="size-3" />
                    <time>{timeAgo}</time>
                </div>
            </div>

            {showActions && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        intent="outline"
                        onPress={() => onPreview(item)}
                        className="flex-1"
                        isDisabled={isProcessing}
                    >
                        <EyeIcon className="size-4" />
                        Preview
                    </Button>
                    {/* Remove the approve/reject buttons - drag and drop handles this */}
                </div>
            )}
        </div>
    )

    if (asKanbanItem) {
        return (
            <Kanban.Item value={item._id} asChild>
                {cardContent}
            </Kanban.Item>
        )
    }

    return cardContent
})

