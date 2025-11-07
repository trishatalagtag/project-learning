"use client"

import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/ui/bar-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"
import { useMemo, type JSX } from "react"

type SystemStats = FunctionReturnType<typeof api.admin.analytics.getSystemStats>

interface CourseMetricsCardProps {
  stats: SystemStats
}

export function CourseMetricsCard({ stats }: CourseMetricsCardProps): JSX.Element {
  const courseStatusData = useMemo(
    () => [
      { name: "Published", count: stats.publishedCourses },
      { name: "Pending", count: stats.pendingCourses },
    ],
    [stats],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Status</CardTitle>
        <CardDescription>Published vs. Pending Courses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Text className="text-muted-foreground text-sm">Total Courses</Text>
          <Text className="font-bold text-2xl">{stats.totalCourses}</Text>
        </div>
        <BarChart
          className="h-48"
          data={courseStatusData}
          dataKey="name"
          config={{
            count: {
              label: "Count",
              color: "hsl(var(--primary))",
            },
          }}
        />
        <div className="flex justify-center gap-2">
          <Badge intent="success">{stats.publishedCourses} Published</Badge>
          <Badge intent="warning">{stats.pendingCourses} Pending</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
