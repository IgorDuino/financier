"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Loan } from "@/components/expense-tracker"

type LoanManagementProps = {
  loans: Loan[]
  onAddLoan: (loan: Omit<Loan, "id">) => void
  onUpdateLoanStatus: (loanId: string, status: Loan["status"]) => void
  currencySymbol: string
}

export function LoanManagement({ 
  loans, 
  onAddLoan, 
  onUpdateLoanStatus,
  currencySymbol 
}: LoanManagementProps) {
  const [person, setPerson] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"borrowed" | "lent">("borrowed")
  const [date, setDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openDueCalendar, setOpenDueCalendar] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!person || !amount) return

    onAddLoan({
      person,
      amount: Number.parseFloat(amount),
      type,
      date,
      dueDate,
      description: description || undefined,
      status: "active"
    })

    // Reset form
    setPerson("")
    setAmount("")
    setType("borrowed")
    setDate(new Date())
    setDueDate(undefined)
    setDescription("")
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return "Not specified"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  const activeBorrowedLoans = loans.filter(loan => loan.status === "active" && loan.type === "borrowed")
  const activeLentLoans = loans.filter(loan => loan.status === "active" && loan.type === "lent")
  const overdueBorrowedLoans = loans.filter(loan => loan.status === "overdue" && loan.type === "borrowed")
  const overdueLentLoans = loans.filter(loan => loan.status === "overdue" && loan.type === "lent")
  const paidLoans = loans.filter(loan => loan.status === "paid")

  const totalBorrowed = [...activeBorrowedLoans, ...overdueBorrowedLoans]
    .reduce((sum, loan) => sum + loan.amount, 0)
  const totalLent = [...activeLentLoans, ...overdueLentLoans]
    .reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
            <div className="w-full md:w-1/4">
              <label htmlFor="person" className="block text-sm font-medium mb-1">
                Person
              </label>
              <Input
                id="person"
                placeholder="Enter person name"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                required
                className="w-full"
              />
            </div>

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

            <div className="w-full md:w-1/5">
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <Select value={type} onValueChange={(value: "borrowed" | "lent") => setType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="lent">Lent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-[130px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(date)}
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

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-1">Due Date </label>
              <Popover open={openDueCalendar} onOpenChange={setOpenDueCalendar}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-[130px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatDate(dueDate) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date)
                      setOpenDueCalendar(false)
                    }}
                    disabled={(date) => date < date}
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
              Add Loan
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money You Borrowed */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Money You Borrowed</h2>
            <div className="text-lg font-semibold">
              Total: {currencySymbol}{totalBorrowed.toFixed(2)}
            </div>
          </div>
          
          {(activeBorrowedLoans.length > 0 || overdueBorrowedLoans.length > 0) ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...activeBorrowedLoans, ...overdueBorrowedLoans].map((loan) => (
                    <TableRow 
                      key={loan.id}
                      className={cn(
                        loan.status === "overdue" && "bg-red-50 dark:bg-red-950/20"
                      )}
                    >
                      <TableCell>{loan.person}</TableCell>
                      <TableCell>{currencySymbol}{loan.amount.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(loan.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateLoanStatus(loan.id, "paid")}
                        >
                          Mark as Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              You haven&apos;t borrowed any money.
            </div>
          )}
        </div>

        {/* Money Others Owe You */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Money Others Owe You</h2>
            <div className="text-lg font-semibold">
              Total: {currencySymbol}{totalLent.toFixed(2)}
            </div>
          </div>
          
          {(activeLentLoans.length > 0 || overdueLentLoans.length > 0) ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...activeLentLoans, ...overdueLentLoans].map((loan) => (
                    <TableRow 
                      key={loan.id}
                      className={cn(
                        loan.status === "overdue" && "bg-red-50 dark:bg-red-950/20"
                      )}
                    >
                      <TableCell>{loan.person}</TableCell>
                      <TableCell>{currencySymbol}{loan.amount.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(loan.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateLoanStatus(loan.id, "paid")}
                        >
                          Mark as Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              No one owes you money.
            </div>
          )}
        </div>
      </div>

      {paidLoans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-green-500">Paid Loans</h2>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.person}</TableCell>
                    <TableCell className="capitalize">{loan.type}</TableCell>
                    <TableCell>{currencySymbol}{loan.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(loan.date)}</TableCell>
                    <TableCell>{formatDate(loan.dueDate)}</TableCell>
                    <TableCell>{loan.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
} 