import { CourseCompletionBarChart } from "@/components/admin/analytics/course-completion-bar-chart"
import { CoursePerformanceTable } from "@/components/admin/analytics/course-performance-table"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { api } from "@/convex/_generated/api"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute(
  "/_authenticated/_admin/a/analytics/courses",
)({
  staticData: {
    breadcrumb: "Course Performance",
  },
  component: CoursePerformancePage,
})

function CoursePerformancePage() {
  const [view, setView] = useState<"table" | "chart">("chart")

  const courseStats = useQuery(api.admin.analytics.getCourseCompletionRates, {
    limit: 50,
  })

  if (courseStats === undefined) {
    return (
      <div className="container mx-auto flex min-h-[400px] max-w-7xl items-center justify-center p-4 md:p-6 lg:p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (courseStats.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Course Performance
          </h1>
          <p className="mt-2 text-muted-foreground">
            Analyze course completion rates and metrics
          </p>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AcademicCapIcon className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No course data</EmptyTitle>
            <EmptyDescription>
              No course performance data available yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Course Performance
          </h1>
          <p className="mt-2 text-muted-foreground">
            Analyze course completion rates and metrics
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Button>
          <Button
            variant={view === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("chart")}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Chart View
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === "table" ? (
        <CoursePerformanceTable data={courseStats} />
      ) : (
        <CourseCompletionBarChart data={courseStats} limit={15} />
      )}
    </div>
  )
}