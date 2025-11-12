"use client"

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
import type { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { useNavigate } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"
import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

type CourseStats = FunctionReturnType<
    typeof api.admin.analytics.getCourseCompletionRates
>[number]

interface CourseCompletionBarChartProps {
    data: FunctionReturnType<typeof api.admin.analytics.getCourseCompletionRates>
    limit?: number
}

const chartConfig = {
    completionRate: {
        label: "Completion Rate",
        color: "hsl(var(--chart-1))",
    },
}

export function CourseCompletionBarChart({
    data,
    limit = 10
}: CourseCompletionBarChartProps) {
    const navigate = useNavigate()

    // Sort by completion rate and take top N
    const chartData = useMemo(() => {
        return [...data]
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, limit)
            .map(course => ({
                courseId: course.courseId,
                courseName: course.courseName.length > 30
                    ? `${course.courseName.substring(0, 30)}...`
                    : course.courseName,
                fullName: course.courseName,
                completionRate: course.completionRate,
                totalEnrollments: course.totalEnrollments,
                completedEnrollments: course.completedEnrollments,
                // Color based on completion rate
                fill: course.completionRate >= 75
                    ? "hsl(var(--chart-1))"
                    : course.completionRate >= 50
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--chart-3))",
            }))
    }, [data, limit])

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top {limit} Courses by Completion Rate</CardTitle>
                    <CardDescription>
                        Showing courses with the highest completion rates
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex min-h-[400px] items-center justify-center">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <AcademicCapIcon className="size-12 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No course performance data</EmptyTitle>
                            <EmptyDescription>
                                Course completion rates will appear here once courses have enrollments
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
                <CardTitle>Top {limit} Courses by Completion Rate</CardTitle>
                <CardDescription>
                    Showing courses with the highest completion rates
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 10,
                            right: 30,
                            top: 10,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis
                            dataKey="courseName"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={150}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(_value, _namee, props) => {
                                        const payload = props.payload as typeof chartData[number]
                                        return (
                                            <div className="space-y-1">
                                                <div className="font-medium">{payload.fullName}</div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground">Completion Rate:</span>
                                                    <span className={cn(
                                                        "font-medium",
                                                        payload.completionRate >= 75
                                                            ? "text-green-600"
                                                            : payload.completionRate >= 50
                                                                ? "text-yellow-600"
                                                                : "text-red-600"
                                                    )}>
                                                        {payload.completionRate.toFixed(2)}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                    <span>{payload.completedEnrollments} of {payload.totalEnrollments} completed</span>
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey="completionRate"
                            radius={[0, 4, 4, 0]}
                            onClick={(data) => {
                                if (data && data.courseId) {
                                    navigate({ to: `/a/courses/${data.courseId}` })
                                }
                            }}
                            className="cursor-pointer"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
                        <span className="text-muted-foreground">≥75% Completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                        <span className="text-muted-foreground">50-74% Completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
                        <span className="text-muted-foreground">&lt;50% Completion</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}