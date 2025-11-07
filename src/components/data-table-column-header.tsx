"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, EyeSlashIcon } from "@heroicons/react/16/solid"
import type { SortDescriptor } from "react-aria-components"
import type { ColumnConfig } from "./data-table"

interface DataTableColumnHeaderProps<T> {
    column: ColumnConfig<T>
    title: string
    sortable?: boolean
    currentSort?: SortDescriptor
    onSort?: (direction: "ascending" | "descending") => void
}

export function DataTableColumnHeader<T>({
    column,
    title,
    sortable = true,
    currentSort,
    onSort,
}: DataTableColumnHeaderProps<T>) {
    if (!sortable && column.enableHiding === false) {
        return <div>{title}</div>
    }

    const isSorted = currentSort?.column === column.id
    const sortDirection = isSorted ? currentSort.direction : undefined

    return (
        <div className={cn("flex items-center space-x-2")}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        intent="outline"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{title}</span>
                        {sortable && (
                            <>
                                {sortDirection === "descending" ? (
                                    <ArrowDownIcon className="ml-2 h-4 w-4" />
                                ) : sortDirection === "ascending" ? (
                                    <ArrowUpIcon className="ml-2 h-4 w-4" />
                                ) : (
                                    <div className="ml-2 h-4 w-4" />
                                )}
                            </>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {sortable && (
                        <>
                            <DropdownMenuItem onClick={() => onSort?.("ascending")}>
                                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Asc
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSort?.("descending")}>
                                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Desc
                            </DropdownMenuItem>
                        </>
                    )}
                    {sortable && column.enableHiding !== false && <DropdownMenuSeparator />}
                    {column.enableHiding !== false && (
                        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                            <EyeSlashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Hide
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}