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
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import type { FunctionReturnType } from "convex/server"
import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

interface CourseStatusChartProps {
    stats: FunctionReturnType<typeof api.admin.analytics.getSystemStats>
}

const chartConfig = {
    courses: {
        label: "Courses",
    },
    published: {
        label: "Published",
        color: "var(--chart-1)",
    },
    pending: {
        label: "Pending Review",
        color: "var(--chart-2)",
    },
    other: {
        label: "Other",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function CourseStatusChart({ stats }: CourseStatusChartProps) {
    const id = "course-status"

    const chartData = React.useMemo(() => {
        // Calculate "other" courses (draft, approved, archived)
        const otherCourses = Math.max(
            0,
            stats.totalCourses - stats.publishedCourses - stats.pendingCourses
        )

        return [
            {
                status: "published",
                courses: stats.publishedCourses,
                fill: "var(--color-published)"
            },
            {
                status: "pending",
                courses: stats.pendingCourses,
                fill: "var(--color-pending)"
            },
            {
                status: "other",
                courses: otherCourses,
                fill: "var(--color-other)"
            },
        ].filter(item => item.courses > 0)
    }, [stats])

    const [activeStatus, setActiveStatus] = React.useState(
        chartData[0]?.status || "published"
    )

    const activeIndex = React.useMemo(
        () => chartData.findIndex((item) => item.status === activeStatus),
        [activeStatus, chartData]
    )

    const statuses = React.useMemo(
        () => chartData.map((item) => item.status),
        [chartData]
    )

    // Empty state
    if (chartData.length === 0 || stats.totalCourses === 0) {
        return (
            <Card data-chart={id} className="flex flex-col">
                <CardHeader>
                    <CardTitle>Course Status</CardTitle>
                    <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-6">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <AcademicCapIcon className="size-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No courses yet</EmptyTitle>
                            <EmptyDescription>
                                Course distribution will appear here once courses are created
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
                    <CardTitle>Course Status</CardTitle>
                    <CardDescription>
                        Distribution by status
                    </CardDescription>
                </div>
                <Select value={activeStatus} onValueChange={setActiveStatus}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a status"
                    >
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {statuses.map((key) => {
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
                            dataKey="courses"
                            nameKey="status"
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
                                                    {activeData.courses.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {chartConfig[activeStatus as keyof typeof chartConfig]?.label}
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
            <CardContent className="pt-0 pb-4">
                <p className="text-center text-muted-foreground text-xs">
                    "Other" includes draft, approved, and archived courses
                </p>
            </CardContent>
        </Card>
    )
}
