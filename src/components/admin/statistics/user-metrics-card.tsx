"use client"

import { BarList } from "@/components/ui/bar-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import type { api } from "api"
import type { FunctionReturnType } from "convex/server"
import { type JSX, useMemo } from "react"

type SystemStats = FunctionReturnType<typeof api.admin.analytics.getSystemStats>

interface UserMetricsCardProps {
  stats: SystemStats
}

export function UserMetricsCard({ stats }: UserMetricsCardProps): JSX.Element {
  const userRolesData = useMemo(
    () => [
      { name: "Learners", value: stats.totalLearners },
      { name: "Faculty", value: stats.totalFaculty },
      { name: "Admins", value: stats.totalAdmins },
    ],
    [stats],
  )

  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>User Metrics</CardTitle>
        <CardDescription>Total users and role distribution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Text className="text-muted-foreground text-sm">Total Users</Text>
          <Text className="font-bold text-3xl">{stats.totalUsers.toLocaleString()}</Text>
        </div>
        <Separator />
        <BarList data={userRolesData} />
      </CardContent>
    </Card>
  )
}
