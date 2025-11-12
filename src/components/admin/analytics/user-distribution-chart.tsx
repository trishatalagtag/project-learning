"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartStyle,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { api } from "@/convex/_generated/api"
import { UsersIcon } from "@heroicons/react/24/solid"
import type { FunctionReturnType } from "convex/server"
import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

interface UserDistributionChartProps {
    stats: FunctionReturnType<typeof api.admin.analytics.getSystemStats>
}

const chartConfig = {
    users: {
        label: "Users",
    },
    learners: {
        label: "Learners",
        color: "var(--chart-1)",
    },
    faculty: {
        label: "Faculty",
        color: "var(--chart-2)",
    },
    admins: {
        label: "Admins",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function UserDistributionChart({ stats }: UserDistributionChartProps) {
    const id = "user-distribution"

    const chartData = React.useMemo(() => [
        {
            role: "learners",
            users: stats.totalLearners,
            fill: "var(--color-learners)"
        },
        {
            role: "faculty",
            users: stats.totalFaculty,
            fill: "var(--color-faculty)"
        },
        {
            role: "admins",
            users: stats.totalAdmins,
            fill: "var(--color-admins)"
        },
    ].filter(item => item.users > 0), [stats])

    const [activeRole, setActiveRole] = React.useState(chartData[0]?.role || "learners")

    const activeIndex = React.useMemo(
        () => chartData.findIndex((item) => item.role === activeRole),
        [activeRole, chartData]
    )

    const roles = React.useMemo(() => chartData.map((item) => item.role), [chartData])

    // Empty state
    if (chartData.length === 0 || stats.totalUsers === 0) {
        return (
            <Card data-chart={id} className="flex flex-col">
                <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown by user role</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-6">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <UsersIcon className="size-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No users yet</EmptyTitle>
                            <EmptyDescription>
                                User distribution will appear here once users are registered
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card data-chart={id} className="flex flex-col">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown by user role</CardDescription>
                </div>
                <Select value={activeRole} onValueChange={setActiveRole}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a role"
                    >
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {roles.map((key) => {
                            const config = chartConfig[key as keyof typeof chartConfig]

                            if (!config) {
                                return null
                            }

                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-sm"
                                            style={{
                                                backgroundColor: `var(--color-${key})`,
                                            }}
                                        />
                                        {config?.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="users"
                            nameKey="role"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        const activeData = chartData[activeIndex]
                                        if (!activeData) return null

                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground font-bold text-3xl"
                                                >
                                                    {activeData.users.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {chartConfig[activeRole as keyof typeof chartConfig]?.label}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
