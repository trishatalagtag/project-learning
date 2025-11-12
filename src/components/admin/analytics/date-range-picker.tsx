import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { format, startOfYear, subDays } from "date-fns";
import { useState } from "react";

interface DateRangePickerProps {
    startDate?: number;
    endDate?: number;
    onDateRangeChange: (range: { start?: number; end?: number }) => void;
}

export function DateRangePicker({
    startDate,
    endDate,
    onDateRangeChange,
}: DateRangePickerProps) {
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isEndOpen, setIsEndOpen] = useState(false);

    const handleStartDateSelect = (date: Date | undefined) => {
        onDateRangeChange({
            start: date ? date.getTime() : undefined,
            end: endDate,
        });
        setIsStartOpen(false);
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        onDateRangeChange({
            start: startDate,
            end: date ? date.getTime() : undefined,
        });
        setIsEndOpen(false);
    };

    const handleClear = () => {
        onDateRangeChange({ start: undefined, end: undefined });
    };

    const handlePresetRange = (days: number | "year") => {
        const end = Date.now();
        let start: number;

        if (days === "year") {
            start = startOfYear(new Date()).getTime();
        } else {
            start = subDays(new Date(), days).getTime();
        }

        onDateRangeChange({ start, end });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm">Quick Select:</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetRange(7)}
                >
                    Last 7 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetRange(30)}
                >
                    Last 30 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetRange(90)}
                >
                    Last 90 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetRange("year")}
                >
                    This Year
                </Button>
            </div>

            {/* Custom Date Range */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm">Custom Range:</span>

                {/* Start Date */}
                <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !startDate && "text-muted-foreground",
                            )}
                        >
                            <CalendarIcon className="mr-2 size-4" />
                            {startDate ? format(startDate, "PPP") : "From date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate ? new Date(startDate) : undefined}
                            onSelect={handleStartDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-sm">to</span>

                {/* End Date */}
                <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !endDate && "text-muted-foreground",
                            )}
                        >
                            <CalendarIcon className="mr-2 size-4" />
                            {endDate ? format(endDate, "PPP") : "To date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={endDate ? new Date(endDate) : undefined}
                            onSelect={handleEndDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {/* Clear Button */}
                {(startDate || endDate) && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="size-9"
                    >
                        <XMarkIcon className="size-4" />
                        <span className="sr-only">Clear date range</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
