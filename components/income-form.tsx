"use client"

import type React from "react"
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Income } from "@/components/expense-tracker"

type IncomeFormProps = {
  onAddIncome: (income: Omit<Income, "id">) => void
  currencySymbol: string
}

const sources = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Bonus",
  "Refund",
  "Rental",
  "Sale",
  "Other",
]

export function IncomeForm({ onAddIncome, currencySymbol }: IncomeFormProps) {
  const [source, setSource] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "weekly" | "yearly">("one-time")
  const [date, setDate] = useState<Date>(new Date())
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isOngoing, setIsOngoing] = useState(true)
  const [description, setDescription] = useState("")
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openStartCalendar, setOpenStartCalendar] = useState(false)
  const [openEndCalendar, setOpenEndCalendar] = useState(false)
  const [customSource, setCustomSource] = useState("")
  const [isCustomSource, setIsCustomSource] = useState(false)

  const isRecurring = frequency !== "one-time"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalSource = isCustomSource ? customSource : source
    if (!amount || !finalSource) return
    
    // Use appropriate date based on frequency type
    const finalDate = isRecurring ? startDate : date
    
    onAddIncome({
      source: finalSource,
      amount: Number.parseFloat(amount),
      frequency,
      date: finalDate,
      startDate: isRecurring ? startDate : undefined,
      endDate: isRecurring && !isOngoing ? endDate : undefined,
      description: description || undefined,
    })

    // Reset form
    setSource("")
    setCustomSource("")
    setIsCustomSource(false)
    setAmount("")
    setFrequency("one-time")
    setDate(new Date())
    setStartDate(new Date())
    setEndDate(undefined)
    setIsOngoing(true)
    setDescription("")
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return "Select date"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <Card className="p-6 shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
          <div className="w-full md:w-1/5">
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-7"
              />
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <label htmlFor="source" className="block text-sm font-medium mb-1">
              Source
            </label>
            {isCustomSource ? (
              <Input
                id="customSource"
                placeholder="Enter source"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                required
                className="w-full"
                onBlur={() => {
                  if (!customSource) setIsCustomSource(false)
                }}
              />
            ) : (
              <Select value={source} onValueChange={(value) => {
                if (value === "custom") {
                  setIsCustomSource(true)
                } else {
                  setSource(value)
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="w-full md:w-1/5">
            <label htmlFor="frequency" className="block text-sm font-medium mb-1">
              Frequency
            </label>
            <Select 
              value={frequency} 
              onValueChange={(value: "one-time" | "monthly" | "weekly" | "yearly") => setFrequency(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isRecurring && (
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn("w-[130px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date || new Date())
                      setOpenCalendar(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="w-full md:w-1/3">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description 
            </label>
            <Input
              id="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Save
          </Button>
        </div>

        {isRecurring && (
          <div className="mt-2 p-4 border rounded-md">
            <h3 className="font-medium mb-3">Recurring Income Period</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-[130px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date || new Date())
                        setOpenStartCalendar(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Checkbox 
                  id="ongoing" 
                  checked={isOngoing} 
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    setIsOngoing(checked === true)
                    if (checked) {
                      setEndDate(undefined)
                    }
                  }}
                />
                <Label htmlFor="ongoing">Ongoing (no end date)</Label>
              </div>

              {!isOngoing && (
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-[130px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? formatDate(endDate) : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date)
                          setOpenEndCalendar(false)
                        }}
                        disabled={(date) => date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </Card>
  )
} 