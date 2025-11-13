import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "@heroicons/react/24/solid"
import { format } from "date-fns"
import { useState } from "react"

interface DateTimePickerProps {
    value?: number
    onChange: (value: number | undefined) => void
    placeholder?: string
    disabled?: boolean
}

export function DateTimePicker({ value, onChange, placeholder = "Pick a date and time", disabled }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const date = value ? new Date(value) : undefined

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            onChange(undefined)
            return
        }

        // Preserve time if date already exists
        if (date) {
            selectedDate.setHours(date.getHours())
            selectedDate.setMinutes(date.getMinutes())
        } else {
            // Default to 11:59 PM for due dates
            selectedDate.setHours(23)
            selectedDate.setMinutes(59)
        }

        onChange(selectedDate.getTime())
    }

    const handleTimeChange = (type: "hours" | "minutes", value: string) => {
        if (!date) return

        const newDate = new Date(date)
        const numValue = parseInt(value, 10)

        if (isNaN(numValue)) return

        if (type === "hours") {
            newDate.setHours(Math.min(23, Math.max(0, numValue)))
        } else {
            newDate.setMinutes(Math.min(59, Math.max(0, numValue)))
        }

        onChange(newDate.getTime())
    }

    return (
        <div className="flex gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                            handleDateSelect(selectedDate)
                            setIsOpen(false)
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {date && (
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min={0}
                            max={23}
                            value={date.getHours()}
                            onChange={(e) => handleTimeChange("hours", e.target.value)}
                            className="w-16"
                            disabled={disabled}
                        />
                        <Label className="text-muted-foreground">:</Label>
                        <Input
                            type="number"
                            min={0}
                            max={59}
                            value={date.getMinutes().toString().padStart(2, "0")}
                            onChange={(e) => handleTimeChange("minutes", e.target.value)}
                            className="w-16"
                            disabled={disabled}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
