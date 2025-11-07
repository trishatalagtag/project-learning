"use client"

import {
    Pagination,
    PaginationFirst,
    PaginationLabel,
    PaginationLast,
    PaginationList,
    PaginationNext,
    PaginationPrevious,
    PaginationSection,
} from "@/components/ui/pagination"
import { SearchField, SearchInput } from "@/components/ui/search-field"
import { memo, useEffect, useMemo, useState } from "react"
import { KANBAN_PAGE_SIZE } from "../config"
import { useContentApproval } from "../hooks/use-content-approval"
import type { ContentItem, ContentType } from "../types"
import { KanbanBoard } from "./kanban-board"
import { LoadingState } from "./loading-state"

interface ContentTypeTabProps {
    contentType: ContentType
    onPreview: (item: ContentItem) => void
    onReject: (item: ContentItem) => void
    onApprove: (item: ContentItem) => void
    processing: string | null
}

const PAGE_SIZE = 20

export const ContentTypeTab = memo(function ContentTypeTab({
    contentType,
    onPreview,
    onReject,
    onApprove,
    processing,
}: ContentTypeTabProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)

    // Debounce search to reduce filtering during drag
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            // Reset to page 1 when search changes
            setPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const pending = useContentApproval({
        contentType,
        status: "pending",
        pageSize: KANBAN_PAGE_SIZE,
    })

    const approved = useContentApproval({
        contentType,
        status: "approved",
        pageSize: KANBAN_PAGE_SIZE,
    })

    const rejected = useContentApproval({
        contentType,
        status: "draft",
        pageSize: KANBAN_PAGE_SIZE,
    })

    const isLoading = pending.isLoading || approved.isLoading || rejected.isLoading

    // Load more items when needed for pagination
    useEffect(() => {
        const itemsNeeded = page * PAGE_SIZE
        const totalLoaded = pending.items.length + approved.items.length + rejected.items.length

        if (totalLoaded < itemsNeeded && !isLoading) {
            // Load more from each status if available
            if (pending.canLoadMore) {
                pending.loadMore(PAGE_SIZE)
            }
            if (approved.canLoadMore) {
                approved.loadMore(PAGE_SIZE)
            }
            if (rejected.canLoadMore) {
                rejected.loadMore(PAGE_SIZE)
            }
        }
    }, [page, pending, approved, rejected, isLoading])

    // Combine and filter all items using debounced search
    const allItems = useMemo(() => {
        const combined = [...pending.items, ...approved.items, ...rejected.items]

        if (!debouncedSearch) return combined

        const query = debouncedSearch.toLowerCase()
        return combined.filter(
            (item) =>
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.courseName?.toLowerCase().includes(query) ||
                item.createdByName?.toLowerCase().includes(query)
        )
    }, [pending.items, approved.items, rejected.items, debouncedSearch])

    // Paginate filtered items
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return allItems.slice(start, start + PAGE_SIZE)
    }, [allItems, page])

    const totalPages = Math.ceil(allItems.length / PAGE_SIZE)

    if (isLoading && pending.items.length === 0 && approved.items.length === 0 && rejected.items.length === 0) {
        return <LoadingState />
    }

    return (
        <div className="space-y-4">
            {/* Search Field */}
            <div className="flex items-center gap-4">
                <SearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="max-w-sm flex-1"
                    aria-label="Search content"
                >
                    <SearchInput placeholder="Search by title, description, or course..." />
                </SearchField>
            </div>

            {allItems.length === 0 && debouncedSearch ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <p className="font-medium">No results found</p>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your search query
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <KanbanBoard
                        items={paginatedItems}
                        onPreview={onPreview}
                        onReject={onReject}
                        onApprove={onApprove}
                        processing={processing}
                    />
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination>
                                <PaginationList className="hidden md:flex">
                                    <PaginationFirst
                                        href="#"
                                        onPress={() => setPage(1)}
                                        isDisabled={page === 1}
                                    />
                                    <PaginationPrevious
                                        href="#"
                                        onPress={() => setPage(Math.max(1, page - 1))}
                                        isDisabled={page === 1}
                                    />
                                    <PaginationSection className="rounded-lg border px-3 *:min-w-4">
                                        <PaginationLabel>{page}</PaginationLabel>
                                        <PaginationLabel className="text-muted-fg">/</PaginationLabel>
                                        <PaginationLabel>{totalPages}</PaginationLabel>
                                    </PaginationSection>
                                    <PaginationNext
                                        href="#"
                                        onPress={() => setPage(Math.min(totalPages, page + 1))}
                                        isDisabled={page === totalPages}
                                    />
                                    <PaginationLast
                                        href="#"
                                        onPress={() => setPage(totalPages)}
                                        isDisabled={page === totalPages}
                                    />
                                </PaginationList>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    )
})
