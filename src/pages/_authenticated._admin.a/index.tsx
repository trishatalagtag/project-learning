import { UserDistributionChart } from "@/components/admin/analytics/user-distribution-chart"
import { DashboardEnrollmentMiniChart, DashboardEnrollmentMiniChartSkeleton } from "@/components/admin/dashboard/dashboard-enrollment-mini-chart"
import { DashboardKpiCards, DashboardKpiCardsSkeleton } from "@/components/admin/dashboard/dashboard-kpi-cards"
import { DashboardPendingWidget, DashboardPendingWidgetSkeleton } from "@/components/admin/dashboard/dashboard-pending-widget"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import {
  AcademicCapIcon,
  ChartBarIcon,
  FolderIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"

export const Route = createFileRoute("/_authenticated/_admin/a/")({
  beforeLoad: () => ({
    breadcrumb: "Dashboard",
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const stats = useQuery(api.admin.analytics.getSystemStats)
  const counts = useQuery(api.admin.content.getAllContentCounts)

  // Get enrollment trends for last 30 days
  const defaultEndDate = Date.now()
  const defaultStartDate = defaultEndDate - 30 * 24 * 60 * 60 * 1000
  const enrollmentTrends = useQuery(api.admin.analytics.getEnrollmentTrends, {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  })

  const isLoading = stats === undefined || counts === undefined || enrollmentTrends === undefined

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartBarIcon className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No statistics available</EmptyTitle>
            <EmptyDescription>
              System statistics will appear here once the platform has activity.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <DashboardKpiCards
          stats={stats}
          pendingCount={counts?.pending.total ?? 0}
        />
      </section>

      {/* Charts Section */}
      <section>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Enrollment Trends - 2/3 width */}
          <div className="lg:col-span-2">
            <DashboardEnrollmentMiniChart data={enrollmentTrends} />
          </div>

          {/* User Distribution - 1/3 width */}
          <div className="lg:col-span-1">
            <UserDistributionChart stats={stats} />
          </div>
        </div>
      </section>

      {/* Pending Approvals Widget */}
      <section>
        {counts && <DashboardPendingWidget counts={counts} />}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 font-semibold text-xl">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/a/content-approvals"
            className="group relative rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <RectangleStackIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Content Approvals</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Review pending submissions
                </p>
              </div>
              {counts && counts.pending.total > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-2 py-1 font-medium text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                    {counts.pending.total}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <Link
            to="/a/courses"
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <AcademicCapIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Courses</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {stats.totalCourses} courses
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/a/users"
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Users</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {stats.totalUsers} users
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/a/analytics"
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <ChartBarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">View Analytics</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Detailed reports
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/a/categories"
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/10 p-3">
                <Squares2X2Icon className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Categories</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Organize content
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/a/content"
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-500/10 p-3">
                <FolderIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Browse Content</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  View all content
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* KPI Cards Skeleton */}
      <DashboardKpiCardsSkeleton />

      {/* Charts Skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardEnrollmentMiniChartSkeleton />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Widget Skeleton */}
      <DashboardPendingWidgetSkeleton />

      {/* Quick Actions Skeleton */}
      <div>
        <Skeleton className="mb-4 h-7 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}