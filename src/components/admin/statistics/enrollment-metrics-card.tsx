"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "@/components/ui/pie-chart"
import { ProgressBar, ProgressBarTrack } from "@/components/ui/progress-bar"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"
import { type JSX, useMemo } from "react"

type SystemStats = FunctionReturnType<typeof api.admin.analytics.getSystemStats>

interface EnrollmentMetricsCardProps {
  stats: SystemStats
}

export function EnrollmentMetricsCard({ stats }: EnrollmentMetricsCardProps): JSX.Element {
  const enrollmentData = useMemo(
    () => [
      { name: "Active", value: stats.activeEnrollments },
      { name: "Completed", value: stats.completedEnrollments },
    ],
    [stats],
  )

  const completionRate = useMemo((): number => {
    return stats.totalEnrollments > 0
      ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
      : 0
  }, [stats])

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Enrollment Metrics</CardTitle>
        <CardDescription>Active vs. Completed Enrollments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Text className="text-muted-foreground text-sm">Total Enrollments</Text>
          <Text className="font-bold text-2xl">{stats.totalEnrollments.toLocaleString()}</Text>
        </div>

        <PieChart
          className="h-48"
          data={enrollmentData}
          dataKey="value"
          nameKey="name"
          variant="donut"
          config={{
            Active: {
              label: "Active",
              color: "hsl(var(--chart-1))",
            },
            Completed: {
              label: "Completed",
              color: "hsl(var(--chart-2))",
            },
          }}
        />

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text className="text-muted-foreground text-sm">Completion Rate</Text>
            <Text className="font-bold text-xl">{completionRate}%</Text>
          </div>
          <ProgressBar value={completionRate}>
            <ProgressBarTrack />
          </ProgressBar>
        </div>
      </CardContent>
    </Card>
  )
}
