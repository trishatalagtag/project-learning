"use client"

import { XMarkIcon } from "@heroicons/react/16/solid"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DataTableInstance } from "./data-table"

interface DataTableToolbarProps<T> {
    table: DataTableInstance<T>
    filterColumn?: string
    filterPlaceholder?: string
    filterValue?: string
    onFilterChange?: (value: string) => void
    children?: React.ReactNode
}

export function DataTableToolbar<T>({
    table,
    filterColumn,
    filterPlaceholder = "Filter...",
    filterValue = "",
    onFilterChange,
    children,
}: DataTableToolbarProps<T>) {
    const isFiltered = filterValue.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {filterColumn && onFilterChange && (
                    <Input
                        placeholder={filterPlaceholder}
                        value={filterValue}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {isFiltered && (
                    <Button
                        intent="outline"
                        onClick={() => onFilterChange?.("")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <XMarkIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            {children}
        </div>
    )
}