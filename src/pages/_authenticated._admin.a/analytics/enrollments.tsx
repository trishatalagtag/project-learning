import { ChartBarIcon } from "@heroicons/react/24/solid";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { DateRangePicker } from "@/components/admin/analytics/date-range-picker";
import { EnrollmentTrendsChart } from "@/components/admin/analytics/enrollment-trends-chart";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { api } from "@/convex/_generated/api";

export const Route = createFileRoute(
  "/_authenticated/_admin/a/analytics/enrollments",
)({
  staticData: {
    breadcrumb: "Enrollment Trends",
  },
  component: EnrollmentTrendsPage,
});

function EnrollmentTrendsPage() {
  // Default to last 30 days
  const defaultEndDate = Date.now();
  const defaultStartDate = defaultEndDate - 30 * 24 * 60 * 60 * 1000;

  const [dateRange, setDateRange] = useState<{
    start?: number;
    end?: number;
  }>({
    start: defaultStartDate,
    end: defaultEndDate,
  });

  const trends = useQuery(api.admin.analytics.getEnrollmentTrends, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const handleRetry = () => {
    // Force a re-fetch by updating the date range with the same values
    setDateRange({ ...dateRange });
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Enrollment Trends</h1>
        <p className="mt-2 text-muted-foreground">
          Track enrollment and completion trends over time
        </p>
      </div>

      <DateRangePicker
        startDate={dateRange.start}
        endDate={dateRange.end}
        onDateRangeChange={setDateRange}
      />

      {trends === undefined ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : trends === null ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-12 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Failed to load enrollment data</EmptyTitle>
            <EmptyDescription>
              An error occurred while loading enrollment trends. Please try again.
            </EmptyDescription>
            <Button onClick={handleRetry} variant="outline" className="mt-4">
              Retry
            </Button>
          </EmptyHeader>
        </Empty>
      ) : trends.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartBarIcon className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No enrollment data</EmptyTitle>
            <EmptyDescription>
              No enrollment data available for the selected date range.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <EnrollmentTrendsChart data={trends} />
      )}
    </div>
  );
}
