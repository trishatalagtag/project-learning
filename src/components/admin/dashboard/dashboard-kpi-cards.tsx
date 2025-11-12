import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { api } from "@/convex/_generated/api"
import {
    AcademicCapIcon,
    ChartBarIcon,
    ClockIcon,
    UsersIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"

interface DashboardKpiCardsProps {
    stats: FunctionReturnType<typeof api.admin.analytics.getSystemStats>
    pendingCount?: number
}

export function DashboardKpiCards({ stats, pendingCount = 0 }: DashboardKpiCardsProps) {
    // Calculate completion rate
    const completionRate = stats.totalEnrollments > 0
        ? ((stats.completedEnrollments / stats.totalEnrollments) * 100).toFixed(1)
        : "0.0"

    // Calculate active rate
    const activeRate = stats.totalEnrollments > 0
        ? ((stats.activeEnrollments / stats.totalEnrollments) * 100).toFixed(1)
        : "0.0"

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Total Users</CardTitle>
                    <div className="rounded-full bg-primary/10 p-2">
                        <UsersIcon className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{stats.totalUsers.toLocaleString()}</div>
                    <p className="mt-1 text-muted-foreground text-xs">
                        {stats.totalLearners} learners · {stats.totalFaculty} faculty · {stats.totalAdmins} admins
                    </p>
                </CardContent>
            </Card>

            {/* Active Enrollments */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Active Enrollments</CardTitle>
                    <div className="rounded-full bg-blue-500/10 p-2">
                        <AcademicCapIcon className="h-4 w-4 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{stats.activeEnrollments.toLocaleString()}</div>
                    <p className="mt-1 text-muted-foreground text-xs">
                        {activeRate}% of total · {stats.completedEnrollments} completed
                    </p>
                </CardContent>
            </Card>

            {/* Pending Content */}
            <Link to="/a/content-approvals" className="block">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Pending Content</CardTitle>
                        <div className={`rounded-full p-2 ${pendingCount > 0
                                ? 'bg-yellow-500/10'
                                : 'bg-green-500/10'
                            }`}>
                            <ClockIcon className={`h-4 w-4 ${pendingCount > 0
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">{pendingCount.toLocaleString()}</div>
                        <p className="mt-1 text-muted-foreground text-xs">
                            {pendingCount > 0
                                ? `${pendingCount} item${pendingCount !== 1 ? 's' : ''} need${pendingCount === 1 ? 's' : ''} review`
                                : 'All content reviewed ✓'
                            }
                        </p>
                    </CardContent>
                </Card>
            </Link>

            {/* Completion Rate */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Completion Rate</CardTitle>
                    <div className="rounded-full bg-green-500/10 p-2">
                        <ChartBarIcon className="h-4 w-4 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{completionRate}%</div>
                    <p className="mt-1 text-muted-foreground text-xs">
                        {stats.completedEnrollments} of {stats.totalEnrollments} enrollments
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export function DashboardKpiCardsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="mb-2 h-8 w-16" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}