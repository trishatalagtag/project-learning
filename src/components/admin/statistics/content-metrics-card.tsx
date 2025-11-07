"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"
import { useMemo, type JSX } from "react"

type SystemStats = FunctionReturnType<typeof api.admin.analytics.getSystemStats>

interface ContentMetricsCardProps {
  stats: SystemStats
}

export function ContentMetricsCard({ stats }: ContentMetricsCardProps): JSX.Element {
  const totalContent = useMemo(
    (): number =>
      stats.totalModules + stats.totalLessons + stats.totalQuizzes + stats.totalAssignments,
    [stats],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Metrics</CardTitle>
        <CardDescription>Learning materials breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Text className="text-muted-foreground text-sm">Total Content</Text>
          <Text className="font-bold text-2xl">{totalContent.toLocaleString()}</Text>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricItem label="Modules" value={stats.totalModules} intent="primary" />
          <MetricItem label="Lessons" value={stats.totalLessons} intent="secondary" />
          <MetricItem label="Quizzes" value={stats.totalQuizzes} intent="info" />
          <MetricItem label="Assignments" value={stats.totalAssignments} intent="success" />
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricItemProps {
  label: string
  value: number
  intent: "primary" | "secondary" | "info" | "success"
}

function MetricItem({ label, value, intent }: MetricItemProps): JSX.Element {
  return (
    <div className="flex flex-col items-center rounded-lg bg-muted p-3">
      <Text className="mb-1 text-muted-foreground text-xs">{label}</Text>
      <Badge intent={intent} className="text-base">
        {value}
      </Badge>
    </div>
  )
}
