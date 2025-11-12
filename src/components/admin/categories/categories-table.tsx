"use client"

import { DataTablePagination } from "@/components/table/data-table-pagination"
import { DataTableViewOptions } from "@/components/table/data-table-view-options"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/convex/_generated/api"
import {
    FolderIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    Squares2X2Icon,
    TableCellsIcon,
} from "@heroicons/react/24/outline"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { CategoryDeleteDialog } from "./category-delete-dialog"
import { CategoryFormDialog } from "./category-form-dialog"
import { type Category, createColumns } from "./columns"
import { CategoriesOrganizeView } from "./categories-organize-view"

export function CategoriesTable() {
    const navigate = useNavigate()
    const search = useSearch({ from: "/_authenticated/_admin/a/categories/" }) as {
        columnVisibility?: Record<string, boolean>
        rowSelection?: Record<string, boolean>
        pageIndex?: number
        pageSize?: number
        q?: string
        level?: string
        sortBy?: string
        sortOrder?: "asc" | "desc"
        view?: "table" | "organize"
    }

    const {
        columnVisibility = {},
        rowSelection = {},
        pageIndex = 0,
        pageSize = 10,
        q = "",
        level = "all",
        sortBy = "level",
        sortOrder = "asc",
        view = "table",
    } = search

    const debouncedSearch = useDebounce(q, 300)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    const categories = useQuery(api.admin.categories.listCategories)
    const orderedCategories = useMemo(
        () =>
            categories
                ? [...categories].sort((a, b) => {
                    if (a.level !== b.level) return a.level - b.level
                    return a.order - b.order
                })
                : [],
        [categories],
    )

    const updateSearch = (updates: Partial<typeof search>) => {
        navigate({
            // @ts-expect-error - prev is not typed
            search: (prev: typeof search) => ({ ...prev, ...updates }),
            replace: true,
        })
    }

    const filteredData = useMemo(() => {
        if (!categories) return []

        let filtered = [...orderedCategories]

        // Search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase()
            filtered = filtered.filter(
                (cat) =>
                    cat.name.toLowerCase().includes(searchLower) ||
                    cat.description.toLowerCase().includes(searchLower) ||
                    cat.parentName?.toLowerCase().includes(searchLower)
            )
        }

        // Level filter
        if (level !== "all") {
            const levelNum = parseInt(level, 10)
            filtered = filtered.filter((cat) => cat.level === levelNum)
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return sortOrder === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            }
            if (sortBy === "level") {
                if (a.level !== b.level) {
                    return sortOrder === "asc" ? a.level - b.level : b.level - a.level
                }
                return sortOrder === "asc" ? a.order - b.order : b.order - a.order
            }
            if (sortBy === "courseCount") {
                return sortOrder === "asc"
                    ? a.courseCount - b.courseCount
                    : b.courseCount - a.courseCount
            }
            if (sortBy === "createdAt") {
                return sortOrder === "asc"
                    ? a.createdAt - b.createdAt
                    : b.createdAt - a.createdAt
            }
            return 0
        })

        return filtered
    }, [categories, debouncedSearch, level, sortBy, sortOrder])

    const paginatedData = useMemo(() => {
        const start = pageIndex * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, pageIndex, pageSize])

    const pageCount = Math.ceil(filteredData.length / pageSize)

    const [sorting, setSorting] = useState<SortingState>([])

    const columns = useMemo(
        () =>
            createColumns({
                onEdit: (category) => {
                    setEditingCategory(category)
                    setIsFormOpen(true)
                },
                onDelete: (category) => {
                    setDeletingCategory(category)
                },
            }),
        []
    )

    const table = useReactTable({
        data: paginatedData,
        columns,
        pageCount,
        state: {
            sorting,
            columnVisibility: columnVisibility as VisibilityState,
            rowSelection,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: false,
    })

    const handleCreate = () => {
        setEditingCategory(null)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
    }

    const handleDeleteSuccess = () => {
        setDeletingCategory(null)
    }

    if (categories === undefined) {
        return (
            <div className="container mx-auto py-10">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>Loading categories...</EmptyTitle>
                        <EmptyDescription>Please wait while we fetch your data.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="container mx-auto py-10">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderIcon className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No categories yet</EmptyTitle>
                        <EmptyDescription>Get started by creating your first category.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={handleCreate}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage course categories and hierarchy</p>
                </div>
                <div className="flex items-center gap-2">
                    <ToggleGroup
                        type="single"
                        value={view}
                        onValueChange={(value) => {
                            if (value) {
                                updateSearch({ view: value as "table" | "organize" })
                            }
                        }}
                        variant="outline"
                        size="sm"
                    >
                        <ToggleGroupItem value="table" aria-label="Table view">
                            <TableCellsIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="organize" aria-label="Organize view">
                            <Squares2X2Icon className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    {view === "table" && (
                        <Button onClick={handleCreate}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    )}
                </div>
            </div>

            {view === "table" ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative w-full min-w-[200px] sm:max-w-sm sm:flex-1">
                                <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={q}
                                    onChange={(e) => updateSearch({ q: e.target.value, pageIndex: 0 })}
                                    className="h-9 pl-8"
                                />
                            </div>

                            {/* Level Filter */}
                            <select
                                value={level}
                                onChange={(e) => updateSearch({ level: e.target.value, pageIndex: 0 })}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="all">All levels</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>

                            {/* Sort */}
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split("-")
                                    updateSearch({
                                        sortBy: newSortBy,
                                        sortOrder: newSortOrder as "asc" | "desc",
                                    })
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="level-asc">Level (Asc)</option>
                                <option value="level-desc">Level (Desc)</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="courseCount-desc">Most Courses</option>
                                <option value="createdAt-desc">Newest</option>
                            </select>

                            <DataTableViewOptions table={table} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyTitle>No results</EmptyTitle>
                                                    <EmptyDescription>
                                                        No categories found matching your filters.
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <DataTablePagination table={table} />
                </>
            ) : (
                <CategoriesOrganizeView onCreateCategory={handleCreate} />
            )}

            {/* Dialogs */}
            <CategoryFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                category={editingCategory}
                onSuccess={handleFormSuccess}
            />
            {deletingCategory && (
                <CategoryDeleteDialog
                    open={!!deletingCategory}
                    onOpenChange={(open) => !open && setDeletingCategory(null)}
                    category={deletingCategory}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    )
}

