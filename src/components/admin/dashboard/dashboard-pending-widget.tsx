import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { api } from "@/convex/_generated/api"
import {
    BookOpenIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    FolderIcon,
} from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"

interface DashboardPendingWidgetProps {
    counts: FunctionReturnType<typeof api.admin.content.getAllContentCounts>
}

export function DashboardPendingWidget({ counts }: DashboardPendingWidgetProps) {
    const pendingItems = [
        {
            icon: FolderIcon,
            label: "Modules",
            count: counts.pending.modules,
            color: "text-blue-600",
        },
        {
            icon: BookOpenIcon,
            label: "Lessons",
            count: counts.pending.lessons,
            color: "text-green-600",
        },
        {
            icon: ClipboardDocumentListIcon,
            label: "Quizzes",
            count: counts.pending.quizzes,
            color: "text-purple-600",
        },
        {
            icon: DocumentTextIcon,
            label: "Assignments",
            count: counts.pending.assignments,
            color: "text-orange-600",
        },
    ]

    const hasPendingItems = counts.pending.total > 0

    return (
        <Card className={hasPendingItems ? "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        {hasPendingItems ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500"></span>
                                </span>
                                Pending Approvals
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                Content Approvals
                            </>
                        )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {hasPendingItems
                            ? `${counts.pending.total} item${counts.pending.total !== 1 ? 's' : ''} need${counts.pending.total === 1 ? 's' : ''} your review`
                            : "All content has been reviewed"
                        }
                    </CardDescription>
                </div>
                {hasPendingItems && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {counts.pending.total}
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                {hasPendingItems ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {pendingItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                                >
                                    <div className={`rounded-full bg-muted p-2 ${item.color}`}>
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {item.count} pending
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/a/content-approvals" className="mt-4 block">
                            <Button className="w-full" size="sm">
                                Review All Pending Content →
                            </Button>
                        </Link>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="mt-4 font-medium text-sm">All caught up!</p>
                        <p className="mt-1 text-muted-foreground text-xs">
                            No pending content requires approval at this time
                        </p>
                        <Link to="/a/content-approvals" className="mt-4">
                            <Button variant="outline" size="sm">
                                View All Content →
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function DashboardPendingWidgetSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex-1">
                    <Skeleton className="mb-2 h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-6 w-8" />
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
                <Skeleton className="mt-4 h-9 w-full" />
            </CardContent>
        </Card>
    )
}