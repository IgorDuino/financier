"use client"

import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ExpenseFiltersProps = {
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  selectedMonth: string | undefined
  onMonthChange: (month: string | undefined) => void
}

export function ExpenseFilters({ dateRange, onDateRangeChange, selectedMonth, onMonthChange }: ExpenseFiltersProps) {
  const months = [
    { value: "2023-1", label: "January 2023" },
    { value: "2023-2", label: "February 2023" },
    { value: "2023-3", label: "March 2023" },
    { value: "2023-4", label: "April 2023" },
    { value: "2023-5", label: "May 2023" },
    { value: "2023-6", label: "June 2023" },
    { value: "2023-7", label: "July 2023" },
    { value: "2023-8", label: "August 2023" },
    { value: "2023-9", label: "September 2023" },
    { value: "2023-10", label: "October 2023" },
    { value: "2023-11", label: "November 2023" },
    { value: "2023-12", label: "December 2023" },
  ]

  const handleMonthChange = (value: string) => {
    // Clear date range when selecting a month
    onDateRangeChange({ from: undefined, to: undefined })
    onMonthChange(value)
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    // Clear month selection when setting a date range
    onMonthChange(undefined)
    onDateRangeChange(range)
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <h2 className="text-lg font-semibold">Expenses</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </>
                  ) : (
                    formatDate(dateRange.from)
                  )
                ) : (
                  "Custom date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) =>
                  handleDateRangeChange({
                    from: range?.from,
                    to: range?.to,
                  })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

