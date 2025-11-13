import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DateRangePicker } from "./date-range-picker";

interface ReportFormData {
    reportType: "enrollments" | "completions" | "user_activity";
    format: "csv" | "json";
    startDate?: number;
    endDate?: number;
}

export function ReportGenerationForm() {
    const form = useForm<ReportFormData>({
        defaultValues: {
            reportType: "enrollments",
            format: "csv",
        },
    });

    const [dateRange, setDateRange] = useState<{
        start?: number;
        end?: number;
    }>({});

    const generateReport = useAction(api.admin.analytics.exportAnalyticsReport);

    const onSubmit = async (data: ReportFormData) => {
        try {
            const result = await generateReport({
                reportType: data.reportType,
                format: data.format,
                startDate: dateRange.start,
                endDate: dateRange.end,
            });

            toast.success("Report generated successfully", {
                description: `Your ${data.reportType} report in ${data.format} format is ready.`,
            });

            // Note: Backend currently returns a placeholder message
            // In production, this would handle the actual download URL or data
            console.log("Report result:", result);
        } catch (error) {
            toast.error("Failed to generate report", {
                description:
                    error instanceof Error ? error.message : "An unknown error occurred",
            });
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Generate Analytics Report</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Report Type */}
                        <FormField
                            control={form.control}
                            name="reportType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Report Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select report type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="enrollments">Enrollments</SelectItem>
                                            <SelectItem value="completions">Completions</SelectItem>
                                            <SelectItem value="user_activity">
                                                User Activity
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the type of analytics data to export
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Format */}
                        <FormField
                            control={form.control}
                            name="format"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Format</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV</SelectItem>
                                            <SelectItem value="json">JSON</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the file format for the export
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date Range */}
                        <div className="space-y-2">
                            <FormLabel>Date Range (Optional)</FormLabel>
                            <DateRangePicker
                                startDate={dateRange.start}
                                endDate={dateRange.end}
                                onDateRangeChange={setDateRange}
                            />
                            <p className="text-muted-foreground text-sm">
                                Leave empty to include all available data
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                "Generate Report"
                            )}
                        </Button>

                        {/* Note about placeholder */}
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium">Note:</p>
                            <p className="mt-1 text-muted-foreground">
                                The report generation feature is currently in development. This
                                will trigger the backend action, but the actual file download
                                functionality is not yet implemented.
                            </p>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
