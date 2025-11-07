"use client"

import * as React from "react"
import type { Key, Selection, SortDescriptor } from "react-aria-components"
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface ColumnDef<T> {
    id: string
    header: string | ((props: { column: ColumnConfig<T> }) => React.ReactNode)
    accessorKey?: keyof T
    cell?: (props: { row: T; value: any }) => React.ReactNode
    enableSorting?: boolean
    enableHiding?: boolean
    isRowHeader?: boolean
}

export interface ColumnConfig<T> extends ColumnDef<T> {
    isVisible: boolean
    toggleVisibility: (visible: boolean) => void
}

export interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    selectionMode?: "none" | "single" | "multiple"
    onSelectionChange?: (keys: Selection) => void
    selectedKeys?: Selection
    sortDescriptor?: SortDescriptor
    onSortChange?: (descriptor: SortDescriptor) => void
    "aria-label": string
    className?: string
    bleed?: boolean
    renderToolbar?: (props: { table: DataTableInstance<T> }) => React.ReactNode
    renderPagination?: (props: { table: DataTableInstance<T> }) => React.ReactNode
}

export interface DataTableInstance<T> {
    data: T[]
    columns: ColumnConfig<T>[]
    selectedKeys: Selection
    getVisibleColumns: () => ColumnConfig<T>[]
    toggleColumnVisibility: (columnId: string, visible: boolean) => void
    selectionMode?: "none" | "single" | "multiple"
}

export function DataTable<T extends { id: Key }>({
    data,
    columns,
    selectionMode = "none",
    onSelectionChange,
    selectedKeys = new Set<Key>(),
    sortDescriptor,
    onSortChange,
    "aria-label": ariaLabel,
    className,
    bleed,
    renderToolbar,
    renderPagination,
}: DataTableProps<T>) {
    const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
        () => Object.fromEntries(columns.map((col) => [col.id, col.enableHiding !== false]))
    )

    const visibleColumns = React.useMemo(
        () => columns.filter((col) => columnVisibility[col.id] !== false),
        [columns, columnVisibility]
    )

    const columnConfigs: ColumnConfig<T>[] = React.useMemo(
        () =>
            columns.map((col) => ({
                ...col,
                isVisible: columnVisibility[col.id] !== false,
                toggleVisibility: (visible: boolean) => {
                    setColumnVisibility((prev) => ({ ...prev, [col.id]: visible }))
                },
            })),
        [columns, columnVisibility]
    )

    const tableInstance: DataTableInstance<T> = {
        data,
        columns: columnConfigs,
        selectedKeys,
        selectionMode,
        getVisibleColumns: () => columnConfigs.filter((col) => col.isVisible),
        toggleColumnVisibility: (columnId: string, visible: boolean) => {
            setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }))
        },
    }

    return (
        <div className="space-y-4">
            {renderToolbar?.({ table: tableInstance })}

            <Table
                aria-label={ariaLabel}
                selectionMode={selectionMode}
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                className={className}
                bleed={bleed}
            >
                <TableHeader>
                    {visibleColumns.map((column) => (
                        <TableColumn
                            key={column.id}
                            id={column.id}
                            isRowHeader={column.isRowHeader}
                            allowsSorting={column.enableSorting}
                        >
                            {typeof column.header === "function"
                                ? column.header({
                                    column: columnConfigs.find((c) => c.id === column.id)!,
                                })
                                : column.header}
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody items={data}>
                    {(item: T) => (
                        <TableRow id={item.id}>
                            {visibleColumns.map((column) => {
                                const value = column.accessorKey ? item[column.accessorKey] : undefined
                                return (
                                    <TableCell key={column.id}>
                                        {column.cell ? column.cell({ row: item, value }) : String(value ?? "")}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {renderPagination?.({ table: tableInstance })}
        </div>
    )
}