import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { api } from "@/convex/_generated/api"
import { ChartBarIcon } from "@heroicons/react/24/outline"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface DashboardEnrollmentMiniChartProps {
    data: FunctionReturnType<typeof api.admin.analytics.getEnrollmentTrends>
}

const chartConfig = {
    enrollments: {
        label: "Enrollments",
        color: "hsl(var(--chart-1))",
    },
    completions: {
        label: "Completions",
        color: "hsl(var(--chart-2))",
    },
}

export function DashboardEnrollmentMiniChart({ data }: DashboardEnrollmentMiniChartProps) {
    const chartData = data.map((item) => ({
        ...item,
        formattedDate: format(new Date(item.date), "MMM dd"),
    }))

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Trends</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="flex min-h-[300px] items-center justify-center">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ChartBarIcon className="h-12 w-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No enrollment data</EmptyTitle>
                            <EmptyDescription>
                                Enrollment trends will appear here once there is activity
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{
                            left: -20,
                            right: 12,
                            top: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickCount={4}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-enrollments)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-enrollments)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-completions)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-completions)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="completions"
                            type="natural"
                            fill="url(#fillCompletions)"
                            fillOpacity={0.4}
                            stroke="var(--color-completions)"
                            stackId="a"
                        />
                        <Area
                            dataKey="enrollments"
                            type="natural"
                            fill="url(#fillEnrollments)"
                            fillOpacity={0.4}
                            stroke="var(--color-enrollments)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export function DashboardEnrollmentMiniChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="mb-2 h-5 w-32" />
                <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    )
}