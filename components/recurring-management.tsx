"use client"

import { useState, useMemo } from "react"
import { CalendarIcon, ExternalLink, AlertCircle, Copy, Check, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RecurringItem, Subscription, RecurringPayment } from "@/components/expense-tracker"

type RecurringManagementProps = {
  items: RecurringItem[]
  onAddItem: (item: Omit<RecurringItem, "id">) => void
  onUpdateItem: (id: string, updates: Partial<RecurringItem>) => void
  onDeleteItem: (id: string) => void
  currencySymbol: string
}

const categories = [
  "Housing",
  "Utilities",
  "Entertainment",
  "Software",
  "Insurance",
  "Education",
  "Gym",
  "Other"
]

export function RecurringManagement({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  currencySymbol
}: RecurringManagementProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [frequency, setFrequency] = useState<"monthly" | "yearly" | "weekly">("monthly")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"subscription" | "recurring">("subscription")
  const [serviceUrl, setServiceUrl] = useState("")
  const [cancelUrl, setCancelUrl] = useState("")
  const [reminderDays, setReminderDays] = useState("3")
  const [recipient, setRecipient] = useState("")
  const [openStartCalendar, setOpenStartCalendar] = useState(false)
  const [openEndCalendar, setOpenEndCalendar] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"name" | "amount" | "nextPaymentDate">("nextPaymentDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterCategory, setFilterCategory] = useState<string | "all">("all")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !category) return

    const baseItem = {
      name,
      amount: Number.parseFloat(amount),
      category,
      frequency,
      startDate,
      endDate,
      description: description || undefined,
      nextPaymentDate: calculateNextPaymentDate(startDate, frequency),
      isActive: true,
    }

    if (type === "subscription") {
      onAddItem({
        ...baseItem,
        type: "subscription",
        serviceUrl: serviceUrl || undefined,
        cancelUrl: cancelUrl || undefined,
        reminderDays: Number.parseInt(reminderDays),
      })
    } else {
      onAddItem({
        ...baseItem,
        type: "recurring",
        recipient: recipient || undefined,
      })
    }

    // Reset form
    setName("")
    setAmount("")
    setCategory("")
    setFrequency("monthly")
    setStartDate(new Date())
    setEndDate(undefined)
    setDescription("")
    setServiceUrl("")
    setCancelUrl("")
    setReminderDays("3")
    setRecipient("")
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return "Not specified"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  function calculateNextPaymentDate(startDate: Date, frequency: "monthly" | "yearly" | "weekly"): Date {
    const now = new Date()
    const next = new Date(startDate)

    while (next <= now) {
      switch (frequency) {
        case "monthly":
          next.setMonth(next.getMonth() + 1)
          break
        case "yearly":
          next.setFullYear(next.getFullYear() + 1)
          break
        case "weekly":
          next.setDate(next.getDate() + 7)
          break
      }
    }

    return next
  }

  const subscriptions = items.filter((item): item is Subscription => item.type === "subscription")
  const recurringPayments = items.filter((item): item is RecurringPayment => item.type === "recurring")

  const totalMonthlySubscriptions = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => {
      if (sub.frequency === "monthly") return sum + sub.amount
      if (sub.frequency === "yearly") return sum + (sub.amount / 12)
      if (sub.frequency === "weekly") return sum + (sub.amount * 52 / 12)
      return sum
    }, 0)

  const totalMonthlyRecurring = recurringPayments
    .filter(payment => payment.isActive)
    .reduce((sum, payment) => {
      if (payment.frequency === "monthly") return sum + payment.amount
      if (payment.frequency === "yearly") return sum + (payment.amount / 12)
      if (payment.frequency === "weekly") return sum + (payment.amount * 52 / 12)
      return sum
    }, 0)

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions
      .filter(sub => {
        if (searchQuery) {
          return (
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        return true
      })
      .filter(sub => {
        if (filterCategory === "all") return true
        return sub.category === filterCategory
      })

    return filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortField === "amount") {
        return sortDirection === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount
      }
      return sortDirection === "asc"
        ? new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
        : new Date(b.nextPaymentDate).getTime() - new Date(a.nextPaymentDate).getTime()
    })
  }, [subscriptions, searchQuery, filterCategory, sortField, sortDirection])

  const filteredAndSortedRecurring = useMemo(() => {
    let filtered = recurringPayments
      .filter(payment => {
        if (searchQuery) {
          return (
            payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.recipient?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        return true
      })
      .filter(payment => {
        if (filterCategory === "all") return true
        return payment.category === filterCategory
      })

    return filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortField === "amount") {
        return sortDirection === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount
      }
      return sortDirection === "asc"
        ? new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
        : new Date(b.nextPaymentDate).getTime() - new Date(a.nextPaymentDate).getTime()
    })
  }, [recurringPayments, searchQuery, filterCategory, sortField, sortDirection])

  // Calculate statistics
  const statistics = useMemo(() => {
    const activeItems = items.filter(item => item.isActive)
    const totalMonthly = activeItems.reduce((sum, item) => {
      const monthlyAmount = 
        item.frequency === "monthly" ? item.amount :
        item.frequency === "yearly" ? item.amount / 12 :
        item.amount * 52 / 12
      return sum + monthlyAmount
    }, 0)

    const byCategory = activeItems.reduce((acc, item) => {
      const monthlyAmount = 
        item.frequency === "monthly" ? item.amount :
        item.frequency === "yearly" ? item.amount / 12 :
        item.amount * 52 / 12
      acc[item.category] = (acc[item.category] || 0) + monthlyAmount
      return acc
    }, {} as Record<string, number>)

    const categoriesData = Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalMonthly) * 100
      }))
      .sort((a, b) => b.amount - a.amount)

    return {
      totalMonthly,
      categoriesData
    }
  }, [items])

  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="w-full">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: "subscription" | "recurring") => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="recurring">Recurring Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "subscription" ? "Netflix, Spotify, etc." : "Rent, Insurance, etc."}
                required
              />
            </div>

            <div className="w-full">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="w-full">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={frequency} 
                onValueChange={(value: "monthly" | "yearly" | "weekly") => setFrequency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="w-full">
              <Label>Start Date</Label>
              <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
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

            <div className="w-full">
              <Label>End Date (Optional)</Label>
              <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate) : "No end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes..."
              />
            </div>
          </div>

          {type === "subscription" ? (
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="w-full">
                <Label htmlFor="serviceUrl">Service URL (Optional)</Label>
                <Input
                  id="serviceUrl"
                  type="url"
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="w-full">
                <Label htmlFor="cancelUrl">Cancellation URL (Optional)</Label>
                <Input
                  id="cancelUrl"
                  type="url"
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="w-full">
                <Label htmlFor="reminderDays">Remind Days Before</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  min="1"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Label htmlFor="recipient">Recipient (Optional)</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Who to pay..."
              />
            </div>
          )}

          <Button type="submit" className="w-full md:w-auto">
            Add {type === "subscription" ? "Subscription" : "Recurring Payment"}
          </Button>
        </form>
      </Card>

      {/* Statistics Card */}
      <Card className="p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Monthly</h3>
            <p className="text-2xl font-bold">{currencySymbol}{statistics.totalMonthly.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">By Category</h3>
            <div className="space-y-2">
              {statistics.categoriesData.map(({ category, amount, percentage }) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category}</span>
                    <span>{currencySymbol}{amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name, category, or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSortField("name")
              setSortDirection(prev => prev === "asc" ? "desc" : "asc")
            }}>
              Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSortField("amount")
              setSortDirection(prev => prev === "asc" ? "desc" : "asc")
            }}>
              Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSortField("nextPaymentDate")
              setSortDirection(prev => prev === "asc" ? "desc" : "asc")
            }}>
              Next Payment {sortField === "nextPaymentDate" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscriptions Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Subscriptions</h2>
            <div className="text-sm text-muted-foreground">
              Monthly: {currencySymbol}{totalMonthlySubscriptions.toFixed(2)}
            </div>
          </div>

          {filteredAndSortedSubscriptions.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSubscriptions.map((sub) => (
                    <TableRow 
                      key={sub.id}
                      className={cn(
                        !sub.isActive && "opacity-50",
                        new Date(sub.nextPaymentDate) <= new Date(Date.now() + sub.reminderDays * 24 * 60 * 60 * 1000) &&
                        "bg-yellow-50 dark:bg-yellow-950/20"
                      )}
                    >
                      <TableCell>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-sm text-muted-foreground">{sub.category}</div>
                      </TableCell>
                      <TableCell>
                        <div>{currencySymbol}{sub.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground capitalize">{sub.frequency}</div>
                      </TableCell>
                      <TableCell>
                        {formatDate(sub.nextPaymentDate)}
                        {new Date(sub.nextPaymentDate) <= new Date(Date.now() + sub.reminderDays * 24 * 60 * 60 * 1000) && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Upcoming
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {sub.serviceUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(sub.serviceUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {(sub.serviceUrl || sub.cancelUrl) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(sub.serviceUrl || sub.cancelUrl || "")}
                          >
                            {copiedUrl === (sub.serviceUrl || sub.cancelUrl) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Switch
                          checked={sub.isActive}
                          onCheckedChange={(checked) => 
                            onUpdateItem(sub.id, { isActive: checked })
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteItem(sub.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              {searchQuery || filterCategory !== "all" 
                ? "No subscriptions match your filters."
                : "No subscriptions added yet."}
            </div>
          )}
        </div>

        {/* Recurring Payments Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recurring Payments</h2>
            <div className="text-sm text-muted-foreground">
              Monthly: {currencySymbol}{totalMonthlyRecurring.toFixed(2)}
            </div>
          </div>

          {filteredAndSortedRecurring.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRecurring.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      className={cn(
                        !payment.isActive && "opacity-50",
                        new Date(payment.nextPaymentDate) <= new Date() &&
                        "bg-yellow-50 dark:bg-yellow-950/20"
                      )}
                    >
                      <TableCell>
                        <div className="font-medium">{payment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.category}
                          {payment.recipient && ` • ${payment.recipient}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{currencySymbol}{payment.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground capitalize">{payment.frequency}</div>
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.nextPaymentDate)}
                        {new Date(payment.nextPaymentDate) <= new Date() && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Due
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Switch
                          checked={payment.isActive}
                          onCheckedChange={(checked) => 
                            onUpdateItem(payment.id, { isActive: checked })
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteItem(payment.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              {searchQuery || filterCategory !== "all"
                ? "No recurring payments match your filters."
                : "No recurring payments added yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 