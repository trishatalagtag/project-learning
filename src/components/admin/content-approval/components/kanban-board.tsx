"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as Kanban from "@/components/ui/kanban"
import {
    Modal,
    ModalClose,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/modal"
import { EyeIcon } from "@heroicons/react/24/outline"
import { memo, useCallback, useMemo, useState } from "react"
import { STATUS_CONFIG, TYPE_CONFIG } from "../config"
import type { ContentItem, StatusType } from "../types"
import { EmptyState } from "./empty-state"

interface KanbanBoardProps {
    items: ContentItem[]
    onPreview: (item: ContentItem) => void
    onApprove: (item: ContentItem) => void
    onReject: (item: ContentItem) => void
    processing: string | null
    onStatusChange?: (item: ContentItem, newStatus: StatusType) => void
}

export const KanbanBoard = memo(function KanbanBoard({
    items,
    onPreview,
    onApprove,
    onReject,
    processing,
    onStatusChange,
}: KanbanBoardProps) {
    const [pendingChange, setPendingChange] = useState<{
        item: ContentItem
        fromStatus: StatusType
        toStatus: StatusType
    } | null>(null)

    // Track original columns to revert if cancelled
    const [activeColumns, setActiveColumns] = useState<Record<StatusType, ContentItem[]> | null>(null)

    // Group items by status
    const columns = useMemo(() => {
        const grouped: Record<StatusType, ContentItem[]> = {
            pending: [],
            approved: [],
            draft: [],
        }

        for (const item of items) {
            const status = item.status as StatusType
            if (grouped[status]) {
                grouped[status].push(item)
            }
        }

        return grouped
    }, [items])

    // Use activeColumns for display during drag, or columns if not dragging
    const displayColumns = activeColumns || columns

    // Handle drag end - ONLY trigger on drop
    const handleDragEnd = useCallback(
        (event: any) => {
            const { active, over } = event

            if (!over) {
                setActiveColumns(null)
                return
            }

            // Get the dragged item
            const draggedItemId = active.id
            const draggedItem = items.find((item) => item._id === draggedItemId)

            if (!draggedItem) {
                setActiveColumns(null)
                return
            }

            // Resolve the destination column ID from sortable container data
            // First try to get containerId from sortable data
            const containerId = over.data?.current?.sortable?.containerId
            let overColumnId: StatusType | null = null

            if (containerId && (containerId === "pending" || containerId === "approved" || containerId === "draft")) {
                overColumnId = containerId as StatusType
            } else if (over.id === "pending" || over.id === "approved" || over.id === "draft") {
                // If over.id is directly a column ID
                overColumnId = over.id as StatusType
            } else {
                // If over.id is an item ID, find which column contains it
                for (const [status, columnItems] of Object.entries(columns)) {
                    if (columnItems.some((item) => item._id === over.id)) {
                        overColumnId = status as StatusType
                        break
                    }
                }
            }

            // Guard: only proceed if we have a valid status
            if (!overColumnId) {
                setActiveColumns(null)
                return
            }

            const fromStatus = draggedItem.status as StatusType

            // If dropped in same column, do nothing
            if (fromStatus === overColumnId) {
                setActiveColumns(null)
                return
            }

            // If dropped in different column, show confirmation
            setPendingChange({
                item: draggedItem,
                fromStatus,
                toStatus: overColumnId,
            })

            // Don't update state yet - wait for confirmation
            setActiveColumns(null)
        },
        [items, columns]
    )

    // Allow temporary state updates during drag for visual feedback
    const handleValueChange = useCallback(
        (newColumns: Record<StatusType, ContentItem[]>) => {
            // Only update visual state during drag, don't trigger actions
            setActiveColumns(newColumns)
        },
        []
    )

    const confirmStatusChange = useCallback(() => {
        if (!pendingChange) return

        const { item, toStatus } = pendingChange

        // Trigger appropriate action based on new status
        if (toStatus === "approved") {
            onApprove(item)
        } else if (toStatus === "draft") {
            onReject(item)
        } else if (onStatusChange) {
            onStatusChange(item, toStatus)
        }

        setPendingChange(null)
    }, [pendingChange, onApprove, onReject, onStatusChange])

    const cancelStatusChange = useCallback(() => {
        setPendingChange(null)
        setActiveColumns(null)
    }, [])

    if (items.length === 0) {
        return <EmptyState />
    }

    return (
        <>
            <Kanban.Root
                value={displayColumns}
                onValueChange={handleValueChange}
                onDragEnd={handleDragEnd}
                getItemValue={(item: ContentItem) => item._id}
                orientation="horizontal"
            >
                <Kanban.Board className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3">
                    {(Object.entries(STATUS_CONFIG) as [StatusType, (typeof STATUS_CONFIG)[StatusType]][]).map(
                        ([status, config]) => {
                            const columnItems = displayColumns[status] || []

                            return (
                                <Kanban.Column key={status} value={status}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm">{config.label}</h3>
                                            <Badge intent={config.color} isCircle={false} className="rounded-sm">
                                                {columnItems.length}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-0.5" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                                        {columnItems.length === 0 ? (
                                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-6">
                                                <p className="text-muted-fg text-xs">
                                                    {status === "pending"
                                                        ? "No items"
                                                        : `Drop to ${status === "approved" ? "approve" : "reject"}`}
                                                </p>
                                            </div>
                                        ) : (
                                            columnItems.map((item) => (
                                                <ContentKanbanCard
                                                    key={item._id}
                                                    item={item}
                                                    onPreview={onPreview}
                                                    processing={processing}
                                                    asHandle
                                                />
                                            ))
                                        )}
                                    </div>
                                </Kanban.Column>
                            )
                        }
                    )}
                </Kanban.Board>

                <Kanban.Overlay>
                    {({ value }) => {
                        const item = items.find((i) => i._id === value)
                        if (!item) return null

                        const config = TYPE_CONFIG[item.type]
                        if (!config) {
                            return (
                                <div className="rounded-md border bg-card p-2.5 opacity-90 shadow-lg">
                                    <h3 className="line-clamp-1 font-medium text-xs">{item.title || "Untitled"}</h3>
                                </div>
                            )
                        }

                        const Icon = config.icon
                        const displayTitle = item.title || "Untitled"

                        return (
                            <div className="rounded-md border bg-card p-2.5 opacity-90 shadow-lg">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded bg-secondary">
                                        <Icon className="size-3.5 text-muted-fg" />
                                    </div>
                                    <Badge intent={config.color} isCircle={false} className="h-4 px-1.5 text-[10px]">
                                        {config.label}
                                    </Badge>
                                </div>
                                <h3 className="line-clamp-1 font-medium text-xs">{displayTitle}</h3>
                            </div>
                        )
                    }}
                </Kanban.Overlay>
            </Kanban.Root>

            {pendingChange && (
                <StatusChangeConfirmation
                    item={pendingChange.item}
                    fromStatus={pendingChange.fromStatus}
                    toStatus={pendingChange.toStatus}
                    onConfirm={confirmStatusChange}
                    onCancel={cancelStatusChange}
                />
            )}
        </>
    )
})

interface ContentKanbanCardProps
    extends Omit<React.ComponentProps<typeof Kanban.Item>, "value"> {
    item: ContentItem
    onPreview: (item: ContentItem) => void
    processing: string | null
}

const ContentKanbanCard = memo(function ContentKanbanCard({
    item,
    onPreview,
    processing,
    ...props
}: ContentKanbanCardProps) {
    const config = TYPE_CONFIG[item.type]
    const displayTitle = item.title || "Untitled"
    const isProcessing = processing === item._id

    // Memoize click handler
    const handlePreview = useCallback(() => {
        onPreview(item)
    }, [item, onPreview])

    // If config is missing, render a simplified card
    if (!config) {
        return (
            <Kanban.Item value={item._id} asChild {...props}>
                <div className="kanban-card rounded-md border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="mb-1.5 line-clamp-1 font-medium text-xs leading-tight">{displayTitle}</h3>
                    {item.description && (
                        <p className="mb-2 line-clamp-1 text-[11px] text-muted-fg leading-tight">
                            {item.description}
                        </p>
                    )}
                    <Button
                        size="sm"
                        intent="outline"
                        onPress={handlePreview}
                        className="h-6 w-full text-[11px]"
                        isDisabled={isProcessing}
                    >
                        <EyeIcon className="size-3" />
                        View
                    </Button>
                </div>
            </Kanban.Item>
        )
    }

    const Icon = config.icon

    return (
        <Kanban.Item value={item._id} asChild {...props}>
            <div className="kanban-card rounded-md border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md">
                {/* Compact header */}
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-secondary">
                        <Icon className="size-3.5 text-muted-fg" />
                    </div>
                    <Badge intent={config.color} isCircle={false} className="h-4 px-1.5 text-[10px]">
                        {config.label}
                    </Badge>
                </div>

                {/* Title - single line */}
                <h3 className="mb-1.5 line-clamp-1 font-medium text-xs leading-tight">{displayTitle}</h3>

                {/* Description - optional, single line */}
                {item.description && (
                    <p className="mb-2 line-clamp-1 text-[11px] text-muted-fg leading-tight">
                        {item.description}
                    </p>
                )}

                {/* Compact metadata */}
                <div className="mb-2 flex flex-col gap-0.5 text-[10px] text-muted-fg">
                    {item.courseName && (
                        <div className="flex items-center gap-1">
                            <span className="shrink-0">📚</span>
                            <span className="line-clamp-1">{item.courseName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span className="shrink-0">👤</span>
                        <span className="line-clamp-1">{item.createdByName || "Unknown"}</span>
                    </div>
                </div>

                {/* Compact button */}
                <Button
                    size="sm"
                    intent="outline"
                    onPress={handlePreview}
                    className="h-6 w-full text-[11px]"
                    isDisabled={isProcessing}
                >
                    <EyeIcon className="size-3" />
                    View
                </Button>
            </div>
        </Kanban.Item>
    )
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if these change
    return (
        prevProps.item._id === nextProps.item._id &&
        prevProps.processing === nextProps.processing &&
        prevProps.item.status === nextProps.item.status
    )
})

// Status Change Confirmation Modal
function StatusChangeConfirmation({
    item,
    fromStatus,
    toStatus,
    onConfirm,
    onCancel,
}: {
    item: ContentItem
    fromStatus: StatusType
    toStatus: StatusType
    onConfirm: () => void
    onCancel: () => void
}) {
    const fromConfig = STATUS_CONFIG[fromStatus]
    const toConfig = STATUS_CONFIG[toStatus]

    return (
        <Modal isOpen onOpenChange={(open: boolean) => !open && onCancel()}>
            <ModalContent isBlurred>
                <ModalHeader>
                    <ModalTitle>Confirm Status Change</ModalTitle>
                    <ModalDescription>
                        Change status of <strong>"{item.title}"</strong> from{" "}
                        <Badge intent={fromConfig?.color || "secondary"} isCircle={false}>
                            {fromConfig?.label || fromStatus}
                        </Badge>{" "}
                        to{" "}
                        <Badge intent={toConfig?.color || "secondary"} isCircle={false}>
                            {toConfig?.label || toStatus}
                        </Badge>
                        ?
                    </ModalDescription>
                </ModalHeader>
                <ModalFooter>
                    <ModalClose>Cancel</ModalClose>
                    <Button intent="primary" onPress={onConfirm}>
                        Confirm Change
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}