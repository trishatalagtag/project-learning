import { ChartBarIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { DateRangePicker } from "@/components/admin/analytics/date-range-picker";
import { EnrollmentTrendsChart } from "@/components/admin/analytics/enrollment-trends-chart";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollment Trends</h1>
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
