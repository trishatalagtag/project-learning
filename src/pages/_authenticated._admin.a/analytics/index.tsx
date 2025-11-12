import { ChartBarIcon } from "@heroicons/react/24/outline"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { CourseStatusChart } from "@/components/admin/analytics/course-status-chart"
import { SystemStatsCards } from "@/components/admin/analytics/system-stats-cards"
import { UserDistributionChart } from "@/components/admin/analytics/user-distribution-chart"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { api } from "@/convex/_generated/api"

export const Route = createFileRoute("/_authenticated/_admin/a/analytics/")({
    staticData: {
        breadcrumb: "Analytics",
    },
    component: AnalyticsPage,
})

function AnalyticsPage() {
    const stats = useQuery(api.admin.analytics.getSystemStats)

    if (stats === undefined) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!stats) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ChartBarIcon className="size-12 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No analytics data available</EmptyTitle>
                    <EmptyDescription>
                        Analytics data will appear here once the system has activity.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                    Welcome to the admin portal. Here's an overview of your platform.
                </p>
            </div>

            {/* System Statistics Section */}
            <section>
                <h2 className="mb-4 font-semibold text-xl">System Statistics</h2>
                <SystemStatsCards stats={stats} />
            </section>

            {/* Charts Section */}
            <section>
                <h2 className="mb-4 font-semibold text-xl">Distribution Overview</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <UserDistributionChart stats={stats} />
                    <CourseStatusChart stats={stats}/>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="mb-4 font-semibold text-xl">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        to="/a/analytics"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">View Analytics</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Detailed analytics and reporting
                        </p>
                    </Link>
                    <Link
                        to="/a/content-approvals"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">Content Approvals</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Review pending content submissions
                        </p>
                    </Link>
                    <Link
                        to="/a/courses"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">Manage Courses</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Create and manage courses
                        </p>
                    </Link>
                    <Link
                        to="/a/users"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">Manage Users</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and manage user accounts
                        </p>
                    </Link>
                    <Link
                        to="/a/categories"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">Manage Categories</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Organize course categories
                        </p>
                    </Link>
                    <Link
                        to="/a/content"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <h3 className="font-semibold">Browse Content</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View all content across the platform
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    )
}