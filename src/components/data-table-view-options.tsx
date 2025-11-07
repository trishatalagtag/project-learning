"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdjustmentsHorizontalIcon } from "@heroicons/react/16/solid"
import type { DataTableInstance } from "./data-table"

interface DataTableViewOptionsProps<T> {
    table: DataTableInstance<T>
}

export function DataTableViewOptions<T>({ table }: DataTableViewOptionsProps<T>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    intent="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                >
                    <AdjustmentsHorizontalIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table.columns
                    .filter((column) => column.enableHiding !== false)
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.isVisible}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {typeof column.header === "string" ? column.header : column.id}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}