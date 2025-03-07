"use client"

import { useState } from "react"
import { CalendarIcon, Plus, ArrowRight, Trash2 } from "lucide-react"
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
import type { BankAccount, Transfer } from "@/components/expense-tracker"

type BankAccountManagementProps = {
  accounts: BankAccount[]
  transfers: Transfer[]
  onAddAccount: (account: Omit<BankAccount, "id">) => void
  onUpdateAccount: (id: string, updates: Partial<BankAccount>) => void
  onDeleteAccount: (id: string) => void
  onAddTransfer: (transfer: Omit<Transfer, "id">) => void
  currencySymbol: string
}

const accountTypes = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "savings", label: "Savings Account" },
  { value: "investment", label: "Investment Account" },
]

export function BankAccountManagement({
  accounts,
  transfers,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddTransfer,
  currencySymbol
}: BankAccountManagementProps) {
  // Account form state
  const [accountName, setAccountName] = useState("")
  const [accountType, setAccountType] = useState<BankAccount["type"]>("debit")
  const [accountBalance, setAccountBalance] = useState("")
  const [creditLimit, setCreditLimit] = useState("")
  const [accountDescription, setAccountDescription] = useState("")

  // Transfer form state
  const [fromAccountId, setFromAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDate, setTransferDate] = useState<Date>(new Date())
  const [transferDescription, setTransferDescription] = useState("")
  const [openCalendar, setOpenCalendar] = useState(false)

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!accountName || !accountBalance) return

    onAddAccount({
      name: accountName,
      type: accountType,
      balance: Number.parseFloat(accountBalance),
      creditLimit: accountType === "credit" && creditLimit ? Number.parseFloat(creditLimit) : undefined,
      description: accountDescription || undefined,
    })

    // Reset form
    setAccountName("")
    setAccountType("debit")
    setAccountBalance("")
    setCreditLimit("")
    setAccountDescription("")
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromAccountId || !toAccountId || !transferAmount) return

    onAddTransfer({
      fromAccountId,
      toAccountId,
      amount: Number.parseFloat(transferAmount),
      date: transferDate,
      description: transferDescription || undefined,
    })

    // Reset form
    setFromAccountId("")
    setToAccountId("")
    setTransferAmount("")
    setTransferDate(new Date())
    setTransferDescription("")
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <div className="space-y-8">
      {/* Quick Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{account.name}</h3>
                <p className="text-sm text-muted-foreground">{accountTypes.find(t => t.value === account.type)?.label}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                onClick={() => onDeleteAccount(account.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              account.balance < 0 && "text-destructive"
            )}>
              {currencySymbol}{Math.abs(account.balance).toFixed(2)}
              {account.balance < 0 && " DR"}
            </p>
            {account.type === "credit" && account.creditLimit && (
              <p className="text-sm text-muted-foreground">
                Credit Limit: {currencySymbol}{account.creditLimit.toFixed(2)}
              </p>
            )}
            {account.description && (
              <p className="text-sm text-muted-foreground">{account.description}</p>
            )}
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="transfer">Transfer Money</TabsTrigger>
          <TabsTrigger value="new-account">New Account</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer">
          <Card className="p-6">
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <div className="w-full md:w-1/3">
                  <Label>From Account *</Label>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
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

                <div className="w-8 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>

                <div className="w-full md:w-1/3">
                  <Label>To Account *</Label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(account => account.id !== fromAccountId)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({currencySymbol}{account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-1/4">
                  <Label>Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="pl-7"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <div className="w-full md:w-1/4">
                  <Label>Date *</Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDate(transferDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={transferDate}
                        onSelect={(date) => {
                          setTransferDate(date || new Date())
                          setOpenCalendar(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="w-full md:flex-1">
                  <Label>Description</Label>
                  <Input
                    placeholder="Add notes..."
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Transfer Money
              </Button>
            </form>
          </Card>

          {/* Transfer History */}
          {transfers.length > 0 && (
            <Card className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => {
                    const fromAccount = accounts.find(a => a.id === transfer.fromAccountId)
                    const toAccount = accounts.find(a => a.id === transfer.toAccountId)
                    
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell>{formatDate(transfer.date)}</TableCell>
                        <TableCell>{fromAccount?.name || "Unknown Account"}</TableCell>
                        <TableCell>{toAccount?.name || "Unknown Account"}</TableCell>
                        <TableCell>{currencySymbol}{transfer.amount.toFixed(2)}</TableCell>
                        <TableCell>{transfer.description || "-"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new-account">
          <Card className="p-6">
            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <div className="w-full md:w-1/3">
                  <Label>Account Name *</Label>
                  <Input
                    placeholder="Enter account name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="w-full md:w-1/4">
                  <Label>Account Type *</Label>
                  <Select value={accountType} onValueChange={(value: BankAccount["type"]) => setAccountType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-1/4">
                  <Label>Initial Balance *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      required
                      className="pl-7"
                    />
                  </div>
                </div>

                {accountType === "credit" && (
                  <div className="w-full md:w-1/4">
                    <Label>Credit Limit</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full">
                <Label>Description</Label>
                <Input
                  placeholder="Add notes..."
                  value={accountDescription}
                  onChange={(e) => setAccountDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Add Account
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 