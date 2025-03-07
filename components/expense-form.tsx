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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense, BankAccount } from "@/components/expense-tracker"

type ExpenseFormProps = {
  onAddExpense: (expense: Omit<Expense, "id">) => void
  currencySymbol: string
  accounts: BankAccount[]
}

const categories = [
  "Groceries",
  "Utilities",
  "Entertainment",
  "Transportation",
  "Dining",
  "Shopping",
  "Healthcare",
  "Housing",
  "Education",
  "Travel",
  "Personal Care",
  "Gifts",
  "Miscellaneous",
]

export function ExpenseForm({ onAddExpense, currencySymbol, accounts }: ExpenseFormProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [accountId, setAccountId] = useState("")
  const [openCategory, setOpenCategory] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !date || !accountId) return

    onAddExpense({
      amount: Number.parseFloat(amount),
      category,
      date,
      description: description || undefined,
      accountId,
    })

    // Reset form
    setAmount("")
    setCategory("")
    setDate(new Date())
    setDescription("")
    setAccountId("")
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <Card className="p-6 shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-wrap md:flex-nowrap items-end gap-3">
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
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <Popover open={openCategory} onOpenChange={setOpenCategory}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={openCategory} className="w-full justify-between">
                {category || "Select category..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat}
                        value={cat}
                        onSelect={(currentValue) => {
                          setCategory(currentValue)
                          setOpenCategory(false)
                        }}
                      >
                        {cat}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full md:w-1/4">
          <label htmlFor="account" className="block text-sm font-medium mb-1">
            Account
          </label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({currencySymbol}{account.balance.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      </form>
    </Card>
  )
}

