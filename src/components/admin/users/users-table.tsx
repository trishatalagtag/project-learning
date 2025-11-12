"use client"

import { DataTablePagination } from "@/components/table/data-table-pagination"
import { DataTableViewOptions } from "@/components/table/data-table-view-options"
import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    CheckCircleIcon,
    ChevronRightIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    TableCellsIcon,
    UserIcon,
} from "@heroicons/react/24/solid"
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
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { createColumns, type User } from "./columns"
import { RoleBadge } from "./shared/role-badge"
import { UserAvatar } from "./shared/user-avatar"
import { DeactivateUserDialog } from "./user-detail/deactivate-user-dialog"
import { EditUserDialog } from "./user-detail/edit-user-dialog"
import { UserStatsCards } from "./user-stats-cards"

export function UsersTable() {
    const navigate = useNavigate()
    const search = useSearch({ from: "/_authenticated/_admin/a/users" })

    const {
        columnVisibility = {},
        rowSelection = {},
        pageIndex = 0,
        pageSize = 10,
        q = "",
        role = "all",
        status = "all",
        sortBy = "createdAt",
        sortOrder = "desc",
        view = "table",
    } = search

    const debouncedSearch = useDebounce(q, 300)

    // Dialog states
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null)

    // Fetch users from backend with pagination, filtering, and sorting
    const usersData = useQuery(
        api.admin.users.listAllUsers,
        {
            limit: pageSize,
            offset: pageIndex * pageSize,
            sortBy,
            sortOrder,
            search: debouncedSearch || undefined,
            role: role === "all" ? undefined : role,
            status: status === "all" ? undefined : status,
        }
    )

    // Debug logging
    if (usersData !== undefined) {
        console.log("Users data from backend:", {
            usersCount: usersData.users.length,
            total: usersData.total,
            hasMore: usersData.hasMore,
        })
    }

    const data = (usersData?.users ?? []) as User[]
    const totalUsers = usersData?.total ?? 0
    const pageCount = Math.ceil(totalUsers / pageSize)

    // Calculate stats from backend data
    const stats = useMemo(() => {
        if (!usersData)
            return {
                total: 0,
                learners: 0,
                faculty: 0,
                admins: 0,
                active: 0,
                deactivated: 0,
            }

        // For stats, we need all users, not just the current page
        // We'll fetch a separate query for stats or calculate from current data
        // For now, calculate from current page data (this is a limitation)
        const allUsersForStats = usersData.users
        return {
            total: totalUsers,
            learners: allUsersForStats.filter((u) => u.role === "LEARNER").length,
            faculty: allUsersForStats.filter((u) => u.role === "FACULTY").length,
            admins: allUsersForStats.filter((u) => u.role === "ADMIN").length,
            active: allUsersForStats.filter((u) => !u.isDeactivated).length,
            deactivated: allUsersForStats.filter((u) => u.isDeactivated).length,
        }
    }, [usersData, totalUsers])

    const updateSearch = (updates: Partial<typeof search>) => {
        navigate({
            // @ts-expect-error - prev is not typed
            search: (prev: typeof search) => ({ ...prev, ...updates }),
            replace: true,
        })
    }

    const handleView = (userId: string) => {
        console.log("Navigating to user:", userId) // Debug log
        navigate({ to: "/a/users/$userId", params: { userId } })
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
    }

    const handleDeactivate = (user: User) => {
        setDeactivatingUser(user)
    }

    const columns = useMemo(
        () =>
            createColumns({
                onView: handleView,
                onEdit: handleEdit,
                onDeactivate: handleDeactivate,
            }),
        []
    )

    const table = useReactTable<User>({
        data,
        columns,
        pageCount,
        state: {
            sorting: [{ id: sortBy, desc: sortOrder === "desc" }] as SortingState,
            columnVisibility: columnVisibility as VisibilityState,
            rowSelection: rowSelection,
            pagination: { pageIndex, pageSize },
        },
        onSortingChange: (updater) => {
            const newSorting =
                typeof updater === "function"
                    ? updater([{ id: sortBy, desc: sortOrder === "desc" }])
                    : updater

            if (newSorting.length > 0) {
                updateSearch({
                    sortBy: newSorting[0].id,
                    sortOrder: newSorting[0].desc ? "desc" : "asc",
                    pageIndex: 0,
                })
            }
        },
        onColumnVisibilityChange: (updater) => {
            const newVisibility =
                typeof updater === "function" ? updater(columnVisibility as VisibilityState) : updater
            updateSearch({ columnVisibility: newVisibility })
        },
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
            updateSearch({ rowSelection: newSelection })
        },
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
            updateSearch({
                pageIndex: newPagination.pageIndex,
                pageSize: newPagination.pageSize,
            })
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    })

    // Loading state
    if (usersData === undefined) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>Loading users...</EmptyTitle>
                        <EmptyDescription>Please wait while we fetch your data.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    // Empty state (no users at all)
    if (totalUsers === 0 && !q && role === "all" && status === "all") {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <UserIcon className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No users yet</EmptyTitle>
                        <EmptyDescription>
                            Users will appear here once they register for the platform.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-bold text-3xl tracking-tight">Users</h1>
                        <p className="text-muted-foreground">Manage user accounts and permissions</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <UserStatsCards stats={stats} />

                {/* Filters */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative w-full min-w-[200px] sm:max-w-sm sm:flex-1">
                            <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={q}
                                onChange={(e) => updateSearch({ q: e.target.value, pageIndex: 0 })}
                                className="h-9 pl-8"
                            />
                        </div>

                        {/* Role Filter */}
                        <Select
                            value={role}
                            onValueChange={(value) =>
                                updateSearch({
                                    role: value as any,
                                    pageIndex: 0,
                                })
                            }
                        >
                            <SelectTrigger className="h-9 w-full sm:w-[140px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="LEARNER">Learner</SelectItem>
                                <SelectItem value="FACULTY">Faculty</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select
                            value={status}
                            onValueChange={(value) =>
                                updateSearch({
                                    status: value as any,
                                    pageIndex: 0,
                                })
                            }
                        >
                            <SelectTrigger className="h-9 w-full sm:w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="deactivated">Deactivated</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="hidden sm:ml-auto md:flex md:items-center md:gap-2">
                            <ToggleGroup
                                type="single"
                                value={view}
                                onValueChange={(value) => {
                                    if (value) {
                                        updateSearch({ view: value as "table" | "grid" })
                                    }
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <ToggleGroupItem value="table" aria-label="Table view">
                                    <TableCellsIcon className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="grid" aria-label="Grid view">
                                    <Squares2X2Icon className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                            {view === "table" && <DataTableViewOptions table={table} />}
                        </div>
                    </div>

                    {/* Results info */}
                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                        <div>
                            Showing {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalUsers)}{" "}
                            of {totalUsers} users
                        </div>
                    </div>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden">
                    {data.length > 0 ? (
                        <ItemGroup className="divide-y overflow-hidden rounded-lg border">
                            {data.map((user) => (
                                <Item
                                    key={user._id}
                                    variant="default"
                                    className="cursor-pointer transition-colors hover:bg-accent/50"
                                    onClick={() => handleView(user._id)}
                                >
                                    <UserAvatar name={user.name} image={user.image} size="md" />

                                    <ItemContent className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <ItemTitle className="line-clamp-1">{user.name}</ItemTitle>
                                                    {user.emailVerified ? (
                                                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                                                    ) : (
                                                        <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <p className="truncate text-muted-foreground text-xs">{user.email}</p>
                                            </div>
                                            <RoleBadge role={user.role} className="shrink-0" />
                                        </div>

                                        <ItemDescription className="mt-2 flex items-center gap-3 text-xs">
                                            <span>{user.enrolledCoursesCount} enrollments</span>
                                            <span>•</span>
                                            <span>
                                                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                            </span>
                                        </ItemDescription>
                                    </ItemContent>

                                    <ItemActions className="shrink-0">
                                        <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                                    </ItemActions>
                                </Item>
                            ))}
                        </ItemGroup>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                            <ExclamationTriangleIcon className="h-8 w-8" />
                            <p>No users found{q && ` matching "${q}"`}</p>
                        </div>
                    )}
                </div>

                {/* Desktop Views */}
                <div className="hidden md:block">
                    {view === "table" ? (
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
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <ExclamationTriangleIcon className="h-8 w-8" />
                                                    <p>No users found{q && ` matching "${q}"`}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div>
                            {data.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {data.map((user) => (
                                        <Card
                                            key={user._id}
                                            className="cursor-pointer transition-colors hover:bg-accent/50"
                                            onClick={() => handleView(user._id)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <UserAvatar name={user.name} image={user.image} size="md" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="truncate font-semibold">{user.name}</h3>
                                                                    {user.emailVerified ? (
                                                                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                                                                    ) : (
                                                                        <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 truncate text-muted-foreground text-sm">{user.email}</p>
                                                            </div>
                                                            <RoleBadge role={user.role} className="shrink-0" />
                                                        </div>
                                                        <div className="mt-4 flex items-center gap-3 text-muted-foreground text-xs">
                                                            <span>{user.enrolledCoursesCount} enrollments</span>
                                                            <span>•</span>
                                                            <span>
                                                                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                                    <ExclamationTriangleIcon className="h-8 w-8" />
                                    <p>No users found{q && ` matching "${q}"`}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DataTablePagination table={table} />

                {/* Dialogs */}
                {editingUser && (
                    <EditUserDialog
                        open={!!editingUser}
                        onOpenChange={(open) => !open && setEditingUser(null)}
                        user={editingUser}
                    />
                )}

                {deactivatingUser && (
                    <DeactivateUserDialog
                        open={!!deactivatingUser}
                        onOpenChange={(open) => !open && setDeactivatingUser(null)}
                        user={deactivatingUser}
                    />
                )}
            </div>
        </div>
    )
}

