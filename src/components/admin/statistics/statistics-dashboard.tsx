"use client"

import { Loader } from "@/components/ui/loader"
import { api } from "api"
import { useQuery } from "convex/react"
import type { JSX } from "react"
import { ContentMetricsCard } from "./content-metrics-card"
import { CourseMetricsCard } from "./course-metrics-card"
import { EnrollmentMetricsCard } from "./enrollment-metrics-card"
import { UserMetricsCard } from "./user-metrics-card"

export function StatisticsDashboard(): JSX.Element {
    const stats = useQuery(api.admin.analytics.getSystemStats)

    if (stats === undefined) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UserMetricsCard stats={stats} />
            <CourseMetricsCard stats={stats} />
            <EnrollmentMetricsCard stats={stats} />
            <ContentMetricsCard stats={stats} />
        </div>
    )
}
