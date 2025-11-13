"use client"

import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { api } from "@/convex/_generated/api"
import {
    CheckCircleIcon,
    EllipsisHorizontalIcon,
    ExclamationCircleIcon,
    EyeIcon,
} from "@heroicons/react/24/solid"
import type { ColumnDef } from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import { RoleBadge } from "./shared/role-badge"
import { UserAvatar } from "./shared/user-avatar"

// Infer from backend - matches api.admin.users.listAllUsers response
export type User = FunctionReturnType<typeof api.admin.users.listAllUsers>["users"][number]

interface ColumnsConfig {
    onView: (userId: string) => void // userId is the auth component _id
    onEdit: (user: User) => void
    onDeactivate: (user: User) => void
}

export const createColumns = ({
    onView,
    onEdit,
    onDeactivate,
}: ColumnsConfig): ColumnDef<User>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
            cell: ({ row }) => (
                <div className="flex max-w-[300px] items-center gap-3">
                    <UserAvatar
                        name={row.getValue("name")}
                        image={row.original.image}
                        size="md"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{row.getValue("name")}</span>
                            {row.original.emailVerified ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Email verified</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Email not verified</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <div className="truncate text-muted-foreground text-sm">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
            cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "institution",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.getValue("institution") || (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "isDeactivated",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const isDeactivated = row.getValue("isDeactivated") as boolean
                return (
                    <Badge variant={isDeactivated ? "destructive" : "outline"}>
                        {isDeactivated ? "Deactivated" : "Active"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "enrolledCoursesCount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Enrollments" />,
            cell: ({ row }) => (
                <div className="text-right font-medium tabular-nums">
                    {row.getValue("enrolledCoursesCount")}
                </div>
            ),
        },
        {
            accessorKey: "createdCoursesCount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created Courses" />,
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                const isFacultyOrAdmin = role === "FACULTY" || role === "ADMIN"
                const count = row.getValue("createdCoursesCount") as number | undefined

                return (
                    <div className="text-right font-medium tabular-nums">
                        {isFacultyOrAdmin ? (count ?? 0) : <span className="text-muted-foreground">N/A</span>}
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
            cell: ({ row }) => {
                const timestamp = row.getValue("createdAt") as number
                return (
                    <div className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </div>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <EllipsisHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                console.log("Navigating to user:", user._id);
                                onView(user._id);
                            }}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                Edit Profile
                            </DropdownMenuItem>
                            {!user.isDeactivated && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDeactivate(user)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <ExclamationCircleIcon className="mr-2 h-4 w-4" />
                                        Deactivate User
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

