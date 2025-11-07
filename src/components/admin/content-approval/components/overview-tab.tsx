"use client"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs"
import { memo, useMemo, useState } from "react"
import { STATUS_CONFIG, TYPE_CONFIG } from "../config"
import { useContentApproval } from "../hooks/use-content-approval"
import type { ContentItem, ContentType } from "../types"
import { LoadingState } from "./loading-state"
import { TableView } from "./table-view"

type StatusFilter = "all" | "pending" | "approved" | "draft"

interface OverviewTabProps {
    onPreview: (item: ContentItem) => void
    onReject: (item: ContentItem) => void
    onApprove: (item: ContentItem) => void
    processing: string | null
}

export const OverviewTab = memo(function OverviewTab({
    onPreview,
    onReject,
    onApprove,
    processing,
}: OverviewTabProps) {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

    return (
        <div className="space-y-4">
            {/* Status Filter */}
            <div className="flex items-center justify-between">
                <ButtonGroup>
                    <Button
                        intent={statusFilter === "all" ? "primary" : "outline"}
                        onPress={() => setStatusFilter("all")}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        intent={statusFilter === "pending" ? "primary" : "outline"}
                        onPress={() => setStatusFilter("pending")}
                        size="sm"
                    >
                        {STATUS_CONFIG.pending.label}
                    </Button>
                    <Button
                        intent={statusFilter === "approved" ? "primary" : "outline"}
                        onPress={() => setStatusFilter("approved")}
                        size="sm"
                    >
                        {STATUS_CONFIG.approved.label}
                    </Button>
                    <Button
                        intent={statusFilter === "draft" ? "primary" : "outline"}
                        onPress={() => setStatusFilter("draft")}
                        size="sm"
                    >
                        {STATUS_CONFIG.draft.label}
                    </Button>
                </ButtonGroup>
            </div>

            <Tabs orientation="vertical" defaultSelectedKey="course">
                <div className="flex w-full gap-6">
                    <TabList className="w-56 shrink-0">
                        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                            const Icon = config.icon
                            return (
                                <Tab key={type} id={type}>
                                    <Icon className="size-4" />
                                    {config.pluralLabel}
                                </Tab>
                            )
                        })}
                    </TabList>

                    <div className="min-w-0 flex-1 overflow-hidden">
                        {Object.keys(TYPE_CONFIG).map((type) => (
                            <TabPanel key={type} id={type}>
                                <ContentTypeTablePanel
                                    contentType={type as ContentType}
                                    statusFilter={statusFilter}
                                    onPreview={onPreview}
                                    onReject={onReject}
                                    onApprove={onApprove}
                                    processing={processing}
                                />
                            </TabPanel>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    )
})

function ContentTypeTablePanel({
    contentType,
    statusFilter,
    onPreview,
    onReject,
    onApprove,
    processing,
}: {
    contentType: ContentType
    statusFilter: StatusFilter
    onPreview: (item: ContentItem) => void
    onReject: (item: ContentItem) => void
    onApprove: (item: ContentItem) => void
    processing: string | null
}) {
    // Fetch items based on status filter
    const pending = useContentApproval({
        contentType,
        status: "pending",
        pageSize: 100,
    })

    const approved = useContentApproval({
        contentType,
        status: "approved",
        pageSize: 100,
    })

    const rejected = useContentApproval({
        contentType,
        status: "draft",
        pageSize: 100,
    })

    const isLoading = pending.isLoading || approved.isLoading || rejected.isLoading

    // Combine items based on filter
    const items = useMemo(() => {
        if (statusFilter === "all") {
            return [...pending.items, ...approved.items, ...rejected.items]
        } else if (statusFilter === "pending") {
            return pending.items
        } else if (statusFilter === "approved") {
            return approved.items
        } else {
            return rejected.items
        }
    }, [statusFilter, pending.items, approved.items, rejected.items])

    if (isLoading && items.length === 0) {
        return <LoadingState />
    }

    return (
        <TableView
            items={items}
            onPreview={onPreview}
            onReject={onReject}
            onApprove={onApprove}
            processing={processing}
        />
    )
}
