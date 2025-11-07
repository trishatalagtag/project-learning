"use client"

import {
    Pagination,
    PaginationItem,
    PaginationList,
    PaginationSection,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import type { DataTableInstance } from "./data-table"

interface DataTablePaginationProps<T> {
    table: DataTableInstance<T>
    pageIndex: number
    pageSize: number
    pageCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    showSelectedCount?: boolean
    showPageNumbers?: boolean
    maxPageNumbers?: number
    pageSizeOptions?: number[]
}

export function DataTablePagination<T>({
    table,
    pageIndex,
    pageSize,
    pageCount,
    onPageChange,
    onPageSizeChange,
    showSelectedCount = true,
    showPageNumbers = true,
    maxPageNumbers = 7,
    pageSizeOptions = [10, 20, 30, 40, 50, 100],
}: DataTablePaginationProps<T>) {
    const totalRows = table.data.length
    const selectedCount =
        table.selectedKeys === "all"
            ? totalRows
            : table.selectedKeys instanceof Set
                ? table.selectedKeys.size
                : 0

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = []

        if (pageCount <= maxPageNumbers) {
            return Array.from({ length: pageCount }, (_, i) => i)
        }

        // Always show first page
        pages.push(0)

        // Calculate range around current page
        const leftSiblingIndex = Math.max(pageIndex - 1, 1)
        const rightSiblingIndex = Math.min(pageIndex + 1, pageCount - 2)

        const shouldShowLeftEllipsis = leftSiblingIndex > 1
        const shouldShowRightEllipsis = rightSiblingIndex < pageCount - 2

        if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
            // Show pages at the start
            const leftItemCount = 3 + 2 * 1
            for (let i = 1; i < leftItemCount; i++) {
                pages.push(i)
            }
            pages.push("ellipsis")
        } else if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
            // Show pages at the end
            pages.push("ellipsis")
            const rightItemCount = 3 + 2 * 1
            for (let i = pageCount - rightItemCount; i < pageCount - 1; i++) {
                pages.push(i)
            }
        } else if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
            // Show pages in the middle
            pages.push("ellipsis")
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                pages.push(i)
            }
            pages.push("ellipsis")
        } else {
            // Show all pages (shouldn't reach here due to initial check)
            for (let i = 1; i < pageCount - 1; i++) {
                pages.push(i)
            }
        }

        // Always show last page
        if (pageCount > 1) {
            pages.push(pageCount - 1)
        }

        return pages
    }

    const canPreviousPage = pageIndex > 0
    const canNextPage = pageIndex < pageCount - 1

    return (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
                {showSelectedCount && table.selectionMode !== "none" && selectedCount > 0 && (
                    <div className="text-muted-foreground text-sm">
                        {selectedCount} of {totalRows} row(s) selected.
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="whitespace-nowrap font-medium text-sm">Rows per page</p>
                    <Select
                        selectedKey={String(pageSize)}
                        onSelectionChange={(key) => {
                            const newSize = Number(key)
                            onPageSizeChange(newSize)
                            onPageChange(0)
                        }}
                        aria-label="Rows per page"
                    >
                        <SelectTrigger className="h-8 w-[70px]" />
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} id={String(size)} textValue={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Pagination>
                    <PaginationList>
                        <PaginationItem
                            {...({ segment: "first" } as any)}
                            href="#"
                            isDisabled={!canPreviousPage}
                            onPress={() => canPreviousPage && onPageChange(0)}
                        />
                        <PaginationItem
                            {...({ segment: "previous" } as any)}
                            href="#"
                            isDisabled={!canPreviousPage}
                            onPress={() => canPreviousPage && onPageChange(pageIndex - 1)}
                        />

                        {showPageNumbers ? (
                            <>
                                {/* Mobile: Show current page / total pages */}
                                <PaginationSection
                                    aria-label="Pagination Segment"
                                    className="rounded-lg border lg:hidden"
                                >
                                    <PaginationItem {...({ segment: "label" } as any)}>
                                        {pageIndex + 1}
                                    </PaginationItem>
                                    <PaginationItem {...({ segment: "separator" } as any)} />
                                    <PaginationItem
                                        className="text-muted-foreground"
                                        {...({ segment: "label" } as any)}
                                    >
                                        {pageCount}
                                    </PaginationItem>
                                </PaginationSection>

                                {/* Desktop: Show page numbers */}
                                <PaginationSection
                                    aria-label="Pagination Segment"
                                    className="hidden lg:flex"
                                >
                                    {getPageNumbers().map((page, index) => {
                                        if (page === "ellipsis") {
                                            return (
                                                <PaginationItem
                                                    key={`ellipsis-${index}`}
                                                    {...({ segment: "separator" } as any)}
                                                />
                                            )
                                        }
                                        return (
                                            <PaginationItem
                                                key={page}
                                                href="#"
                                                isCurrent={page === pageIndex}
                                                onPress={() => onPageChange(page)}
                                            >
                                                {page + 1}
                                            </PaginationItem>
                                        )
                                    })}
                                </PaginationSection>
                            </>
                        ) : (
                            /* Simple: Just show current page / total */
                            <PaginationSection
                                aria-label="Pagination Segment"
                                className="rounded-lg border"
                            >
                                <PaginationItem {...({ segment: "label" } as any)}>
                                    {pageIndex + 1}
                                </PaginationItem>
                                <PaginationItem {...({ segment: "separator" } as any)} />
                                <PaginationItem
                                    className="text-muted-foreground"
                                    {...({ segment: "label" } as any)}
                                >
                                    {pageCount}
                                </PaginationItem>
                            </PaginationSection>
                        )}

                        <PaginationItem
                            {...({ segment: "next" } as any)}
                            href="#"
                            isDisabled={!canNextPage}
                            onPress={() => canNextPage && onPageChange(pageIndex + 1)}
                        />
                        <PaginationItem
                            {...({ segment: "last" } as any)}
                            href="#"
                            isDisabled={!canNextPage}
                            onPress={() => canNextPage && onPageChange(pageCount - 1)}
                        />
                    </PaginationList>
                </Pagination>
            </div>
        </div>
    )
}