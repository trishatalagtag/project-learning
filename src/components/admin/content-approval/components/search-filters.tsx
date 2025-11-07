"use client"

import { Button } from "@/components/ui/button"
import { SearchField, SearchInput } from "@/components/ui/search-field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { memo, useState } from "react"
import { STATUS_CONFIG, TYPE_CONFIG } from "../config"
import type { ContentType, StatusType } from "../types"

interface SearchFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    typeFilter?: ContentType | "all"
    onTypeFilterChange?: (type: ContentType | "all") => void
    statusFilter?: StatusType | "all"
    onStatusFilterChange?: (status: StatusType | "all") => void
    showFilters?: boolean
}

export const SearchFilters = memo(function SearchFilters({
    searchQuery,
    onSearchChange,
    typeFilter = "all",
    onTypeFilterChange,
    statusFilter = "all",
    onStatusFilterChange,
    showFilters = false,
}: SearchFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const hasActiveFilters =
        searchQuery || (typeFilter && typeFilter !== "all") || (statusFilter && statusFilter !== "all")

    const clearFilters = () => {
        onSearchChange("")
        onTypeFilterChange?.("all")
        onStatusFilterChange?.("all")
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <SearchField
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="flex-1"
                    aria-label="Search content"
                >
                    <SearchInput placeholder="Search by title, description, course, or creator..." />
                </SearchField>

                {showFilters && (
                    <Button
                        intent="outline"
                        onPress={() => setIsExpanded(!isExpanded)}
                        className="shrink-0"
                    >
                        <FunnelIcon className="size-4" />
                        Filters
                    </Button>
                )}

                {hasActiveFilters && (
                    <Button intent="outline" onPress={clearFilters} className="shrink-0">
                        <XMarkIcon className="size-4" />
                        Clear
                    </Button>
                )}
            </div>

            {showFilters && isExpanded && (
                <div className="flex gap-3 rounded-lg border bg-secondary/50 p-3">
                    {onTypeFilterChange && (
                        <div className="flex-1">
                            <label htmlFor="content-type" className="mb-1.5 block font-medium text-sm">Content Type</label>
                            <Select
                                selectedKey={typeFilter}
                                onSelectionChange={(key) => onTypeFilterChange(key as ContentType | "all")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem id="all">All Types</SelectItem>
                                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                                        <SelectItem key={type} id={type}>
                                            {config.pluralLabel}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {onStatusFilterChange && (
                        <div className="flex-1">
                            <label htmlFor="status" className="mb-1.5 block font-medium text-sm">Status</label>
                            <Select
                                selectedKey={statusFilter}
                                onSelectionChange={(key) => onStatusFilterChange(key as StatusType | "all")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem id="all">All Statuses</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                        <SelectItem key={status} id={status}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})

