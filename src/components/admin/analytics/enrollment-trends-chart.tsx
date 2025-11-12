import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import * as RechartsPrimitive from "recharts";

interface EnrollmentTrendsChartProps {
    data: FunctionReturnType<typeof api.admin.analytics.getEnrollmentTrends>;
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
};

export function EnrollmentTrendsChart({ data }: EnrollmentTrendsChartProps) {
    // Transform data for the chart - format dates nicely
    const chartData = data.map((item) => ({
        ...item,
        formattedDate: format(new Date(item.date), "MMM dd"),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enrollment Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <RechartsPrimitive.LineChart data={chartData}>
                        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <RechartsPrimitive.XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <RechartsPrimitive.YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <RechartsPrimitive.Line
                            type="monotone"
                            dataKey="enrollments"
                            stroke="var(--color-enrollments)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <RechartsPrimitive.Line
                            type="monotone"
                            dataKey="completions"
                            stroke="var(--color-completions)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </RechartsPrimitive.LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
