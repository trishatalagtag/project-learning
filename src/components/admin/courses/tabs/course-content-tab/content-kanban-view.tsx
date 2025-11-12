"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Kanban,
    KanbanBoard,
    KanbanColumn,
    KanbanColumnContent,
    KanbanItem,
    KanbanItemHandle,
    KanbanOverlay
} from "@/components/ui/sortable"
import {
    ArrowPathIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    DocumentTextIcon,
    EyeIcon,
    FolderIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontalIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

type ContentItem = {
    _id: string
    title: string
    description?: string
    status: "draft" | "pending" | "changes_requested" | "approved" | "published"
    createdAt: number
    updatedAt: number
    type: "module" | "lesson" | "quiz" | "assignment"
}

const STATUS_COLUMNS = {
    pending: {
        label: "Pending Review",
        icon: ClockIcon,
        color: "text-muted-foreground",
        bgColor: "bg-muted/30",
        borderColor: "border-muted",
    },
    changes_requested: {
        label: "Changes Requested",
        icon: ArrowPathIcon,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
    },
    approved: {
        label: "Approved",
        icon: CheckCircleIcon,
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
    },
    published: {
        label: "Published",
        icon: GlobeAltIcon,
        color: "text-accent-foreground",
        bgColor: "bg-accent/20",
        borderColor: "border-accent/40",
    },
} as const

const CONTENT_TYPE_ICONS = {
    module: FolderIcon,
    lesson: BookOpenIcon,
    quiz: ClipboardDocumentListIcon,
    assignment: DocumentTextIcon,
} as const

// Add animation variants after the CONTENT_TYPE_ICONS constant
const _containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
        },
    },
}

interface ContentCardProps {
    item: ContentItem
    onView?: (item: ContentItem) => void
    onStatusChange?: (itemId: string, newStatus: string) => void
    asHandle?: boolean
}

function ContentCard({ item, onView, onStatusChange, asHandle }: ContentCardProps) {
    const Icon = CONTENT_TYPE_ICONS[item.type]
    const daysPending = Math.floor((Date.now() - item.createdAt) / 86400000)
    const isOverdue = daysPending > 3

    const handleStatusChange = (newStatus: string) => {
        if (onStatusChange) {
            onStatusChange(item._id, newStatus)
        }
    }

    const cardContent = (
        <div className={`group relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md ${isOverdue ? "border-l-4 border-l-destructive" : ""}`}>
            <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 font-semibold text-sm leading-tight">{item.title}</h4>
                            <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                                {item.type}
                            </Badge>
                        </div>
                    </div>
                    {onStatusChange && (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Content actions"
                                >
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault()
                                            handleStatusChange("approved")
                                        }}
                                    >
                                        <CheckCircleIcon className="mr-2 h-4 w-4 text-primary" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault()
                                            handleStatusChange("changes_requested")
                                        }}
                                    >
                                        <ArrowPathIcon className="mr-2 h-4 w-4 text-destructive" />
                                        Request Changes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault()
                                            handleStatusChange("published")
                                        }}
                                    >
                                        <GlobeAltIcon className="mr-2 h-4 w-4 text-accent-foreground" />
                                        Publish
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {item.description && (
                    <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between gap-2 border-t pt-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span className="truncate">
                            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </span>
                    </div>
                    {isOverdue && (
                        <Badge variant="destructive" className="text-[10px]">
                            {daysPending}d
                        </Badge>
                    )}
                    {onView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation()
                                onView(item)
                            }}
                        >
                            <EyeIcon className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <KanbanItem value={item._id}>
            {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
        </KanbanItem>
    )
}

interface ContentKanbanViewProps {
    items: ContentItem[]
    onView?: (item: ContentItem) => void
    onStatusChange?: (itemId: string, newStatus: string) => void
    showDropTargets?: boolean // Show empty columns as drop targets
}

export function ContentKanbanView({ items, onView, onStatusChange, showDropTargets = false }: ContentKanbanViewProps) {
    const columns = React.useMemo(() => {
        const grouped = Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
            acc[status] = items.filter((item) => item.status === status)
            return acc
        }, {} as Record<string, ContentItem[]>)
        return grouped
    }, [items])

    const [kanbanState, setKanbanState] = React.useState(columns)

    React.useEffect(() => {
        setKanbanState(columns)
    }, [columns])

    const handleMove = React.useCallback(
        (event: { activeContainer: string; overContainer: string; activeIndex: number; overIndex: number }) => {
            const { activeContainer, overContainer } = event

            const activeItem = kanbanState[activeContainer]?.[event.activeIndex]

            if (!activeItem) return

            if (onStatusChange && activeContainer !== overContainer) {
                onStatusChange(activeItem._id, overContainer)
            }
        },
        [kanbanState, onStatusChange]
    )

    // Filter columns based on showDropTargets
    const visibleColumns = React.useMemo(() => {
        if (showDropTargets) {
            // Show all columns (for content approvals - pending items can be moved to other statuses)
            return Object.keys(STATUS_COLUMNS)
        }
        // Only show columns that have items
        return Object.keys(STATUS_COLUMNS).filter((status) => {
            const columnItems = kanbanState[status] || []
            return columnItems.length > 0
        })
    }, [kanbanState, showDropTargets])

    return (
        <div className="w-full overflow-x-auto">
            <Kanban
                value={kanbanState}
                onValueChange={setKanbanState}
                getItemValue={(item) => item._id}
                onMove={handleMove}
            >
                <KanbanBoard className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleColumns.map((statusKey) => {
                        const statusConfig = STATUS_COLUMNS[statusKey as keyof typeof STATUS_COLUMNS]
                        const columnItems = kanbanState[statusKey] || []
                        const StatusIcon = statusConfig.icon
                        const isEmpty = columnItems.length === 0
                        const isDropTarget = showDropTargets && isEmpty && statusKey !== "pending"

                        return (
                            <KanbanColumn
                                key={statusKey}
                                value={statusKey}
                                className={`rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-3 shadow-sm transition-shadow hover:shadow-md ${isDropTarget ? "border-dashed opacity-75" : ""}`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <StatusIcon className={`h-4 w-4 shrink-0 ${statusConfig.color}`} />
                                        <h3 className="truncate font-semibold text-sm">{statusConfig.label}</h3>
                                    </div>
                                    {!isDropTarget && (
                                        <Badge variant="secondary" className="shrink-0 font-medium">
                                            {columnItems.length}
                                        </Badge>
                                    )}
                                </div>

                                {isDropTarget ? (
                                    <div className="flex flex-1 items-center justify-center rounded-md border-2 border-muted-foreground/30 border-dashed py-8">
                                        <p className="text-center text-muted-foreground text-xs">
                                            Drag items here to {statusKey === "approved" ? "approve" : statusKey === "changes_requested" ? "request changes" : "publish"}
                                        </p>
                                    </div>
                                ) : isEmpty ? (
                                    <div className="flex flex-1 items-center justify-center rounded-md border-2 border-muted-foreground/20 border-dashed py-8">
                                        <p className="text-muted-foreground text-xs">No items</p>
                                    </div>
                                ) : (
                                    <KanbanColumnContent value={statusKey} className="flex min-h-[100px] flex-col gap-2.5">
                                        <motion.div
                                            layout
                                            className="relative flex flex-col gap-2.5"
                                        >
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                {columnItems.map((item) => (
                                                    <motion.div
                                                        key={item._id}
                                                        layout
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                                                    >
                                                        <ContentCard
                                                            item={item}
                                                            onView={onView}
                                                            onStatusChange={onStatusChange}
                                                            asHandle
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    </KanbanColumnContent>
                                )}
                            </KanbanColumn>
                        )
                    })}
                </KanbanBoard>
                <KanbanOverlay>
                    {({ value, variant }) => {
                        if (variant === "column") {
                            const statusConfig = STATUS_COLUMNS[String(value) as keyof typeof STATUS_COLUMNS]
                            if (!statusConfig) return null
                            const StatusIcon = statusConfig.icon
                            return (
                                <div className={`rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-3 opacity-50 shadow-lg`}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                        <div className="font-semibold text-sm">{statusConfig.label}</div>
                                    </div>
                                </div>
                            )
                        }
                        const item = Object.values(kanbanState)
                            .flat()
                            .find((item) => item._id === value)
                        if (!item) return null
                        return (
                            <div className="opacity-50">
                                <ContentCard item={item} />
                            </div>
                        )
                    }}
                </KanbanOverlay>
            </Kanban>
        </div>
    )
}

