import { UserDistributionChart } from "@/components/admin/analytics/user-distribution-chart"
import { DashboardAllMetrics, DashboardAllMetricsSkeleton } from "@/components/admin/dashboard/dashboard-all-metrics"
import { DashboardEnrollmentMiniChart, DashboardEnrollmentMiniChartSkeleton } from "@/components/admin/dashboard/dashboard-enrollment-mini-chart"
import { DashboardKpiCards, DashboardKpiCardsSkeleton } from "@/components/admin/dashboard/dashboard-kpi-cards"
import { DashboardPendingWidget, DashboardPendingWidgetSkeleton } from "@/components/admin/dashboard/dashboard-pending-widget"
import { FacultyCoursesDashboard } from "@/components/faculty/dashboard/faculty-courses-dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { ROLE } from "@/lib/rbac/permissions"
import { useUserRole } from "@/lib/rbac/use-user-role"
import {
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
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
  const userRole = useUserRole()

  // Show faculty dashboard for faculty users
  if (userRole === ROLE.FACULTY) {
    return <FacultyCoursesDashboard />
  }

  // Show admin dashboard for admin users
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
  const statsError = stats === null
  const countsError = counts === null
  const trendsError = enrollmentTrends === null
  const hasError = statsError || countsError || trendsError

  const handleRetry = () => {
    // Convex will automatically retry on refresh
    window.location.reload()
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (statsError) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Failed to Load Statistics</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">We encountered an error while fetching system statistics. This could be due to a temporary server issue or network problem.</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Error alerts for non-critical data */}
      {hasError && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Partial Data Load</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">Some dashboard information failed to load. Please refresh to retry.</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <section>
        <DashboardKpiCards
          stats={stats}
          pendingCount={counts?.pending.total ?? 0}
        />
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

      {/* Charts Section */}
      <section>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Enrollment Trends - 2/3 width */}
          <div className="lg:col-span-2">
            {enrollmentTrends !== undefined ? (
              <DashboardEnrollmentMiniChart data={enrollmentTrends} />
            ) : (
              <DashboardEnrollmentMiniChartSkeleton />
            )}
          </div>

          {/* User Distribution - 1/3 width */}
          <div className="lg:col-span-1">
            {stats !== undefined ? (
              <UserDistributionChart stats={stats} />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Pending Approvals Widget */}
      <section>
        {counts !== undefined ? (
          <DashboardPendingWidget counts={counts} />
        ) : (
          <DashboardPendingWidgetSkeleton />
        )}
      </section>

      {/* All Metrics Section */}
      <section>
        <h2 className="mb-4 font-semibold text-xl">All Platform Metrics</h2>
        {stats !== undefined ? (
          <DashboardAllMetrics stats={stats} />
        ) : (
          <DashboardAllMetricsSkeleton />
        )}
      </section>


    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
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