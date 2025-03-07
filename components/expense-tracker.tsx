"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseTable } from "@/components/expense-table"
import { ExpenseFilters } from "@/components/expense-filters"
import { IncomeView } from "@/components/income-view"
import { IncomeForm } from "@/components/income-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencySelector } from "@/components/currency-selector"
import { TransactionDetail } from "@/components/transaction-detail"
import { LoanManagement } from "@/components/loan-management"
import { RecurringManagement } from "@/components/recurring-management"
import { BankAccountManagement } from "./bank-account-management"

export type Expense = {
  id: string
  amount: number
  category: string
  date: Date
  description?: string
  accountId: string
}

export type Income = {
  id: string
  source: string
  amount: number
  frequency: "one-time" | "monthly" | "weekly" | "yearly"
  date: Date
  startDate?: Date
  endDate?: Date
  description?: string
}

export type Currency = {
  code: string
  symbol: string
  name: string
}

export type Loan = {
  id: string
  person: string
  amount: number
  type: "borrowed" | "lent"
  date: Date
  dueDate?: Date
  description?: string
  status: "active" | "paid" | "overdue"
}

export type RecurringPaymentBase = {
  id: string
  name: string
  amount: number
  frequency: "monthly" | "yearly" | "weekly"
  category: string
  startDate: Date
  endDate?: Date
  description?: string
  lastPaymentDate?: Date
  nextPaymentDate: Date
  isActive: boolean
}

export type Subscription = RecurringPaymentBase & {
  type: "subscription"
  serviceUrl?: string
  cancelUrl?: string
  reminderDays: number // days before to remind about renewal
}

export type RecurringPayment = RecurringPaymentBase & {
  type: "recurring"
  recipient?: string
}

export type RecurringItem = Subscription | RecurringPayment

export type BankAccount = {
  id: string
  name: string
  type: "cash" | "credit" | "debit" | "savings" | "investment"
  balance: number
  creditLimit?: number
  description?: string
}

export type Transfer = {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: Date
  description?: string
}

interface ExpenseTrackerProps {
  activeTab: string
}

export function ExpenseTracker({ activeTab }: ExpenseTrackerProps) {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 42.99,
      category: "Groceries",
      date: new Date(2023, 5, 15),
      description: "Weekly shopping",
      accountId: "2" // Main Debit Card
    },
    {
      id: "2",
      amount: 9.99,
      category: "Entertainment",
      date: new Date(2023, 5, 18),
      description: "Movie ticket",
      accountId: "1" // Cash
    },
    {
      id: "3",
      amount: 29.99,
      category: "Utilities",
      date: new Date(2023, 5, 20),
      description: "Internet bill",
      accountId: "3" // Credit Card
    },
  ])

  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      source: "Salary",
      amount: 3500,
      frequency: "monthly",
      date: new Date(2023, 5, 1),
      description: "Monthly salary",
    },
    {
      id: "2",
      source: "Freelance",
      amount: 500,
      frequency: "one-time",
      date: new Date(2023, 5, 15),
      description: "Website design project",
    },
    {
      id: "3",
      source: "Debt Repayment",
      amount: 200,
      frequency: "monthly",
      date: new Date(2023, 5, 10),
      description: "Friend paying back loan",
    },
  ])

  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "1",
      person: "John Doe",
      amount: 1000,
      type: "borrowed",
      date: new Date(2023, 5, 1),
      dueDate: new Date(2023, 6, 1),
      description: "Emergency loan",
      status: "active"
    },
    {
      id: "2",
      person: "Jane Smith",
      amount: 500,
      type: "lent",
      date: new Date(2023, 5, 15),
      dueDate: new Date(2023, 7, 15),
      description: "Car repair loan",
      status: "active"
    }
  ])

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([
    {
      id: "1",
      type: "subscription",
      name: "Netflix",
      amount: 999,
      frequency: "monthly",
      category: "Entertainment",
      startDate: new Date(2023, 0, 1),
      nextPaymentDate: new Date(2024, 3, 1),
      lastPaymentDate: new Date(2024, 2, 1),
      serviceUrl: "https://netflix.com/account",
      cancelUrl: "https://netflix.com/cancel",
      reminderDays: 3,
      isActive: true
    },
    {
      id: "2",
      type: "recurring",
      name: "Rent",
      amount: 50000,
      frequency: "monthly",
      category: "Housing",
      startDate: new Date(2023, 0, 1),
      nextPaymentDate: new Date(2024, 3, 1),
      lastPaymentDate: new Date(2024, 2, 1),
      recipient: "Landlord Name",
      isActive: true
    }
  ])

  const [monthlySalary, setMonthlySalary] = useState(3500)
  const [currency, setCurrency] = useState<Currency>({ code: "RUB", symbol: "₽", name: "Russian Ruble" })
  
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | Income | null>(null)
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense")
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false)

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      name: "Cash",
      type: "cash",
      balance: 5000,
      description: "Physical cash"
    },
    {
      id: "2",
      name: "Main Debit Card",
      type: "debit",
      balance: 15000,
      description: "Primary bank account"
    },
    {
      id: "3",
      name: "Credit Card",
      type: "credit",
      balance: -2000,
      creditLimit: 50000,
      description: "Main credit card"
    }
  ])

  const [transfers, setTransfers] = useState<Transfer[]>([])

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substring(2, 9),
    }
    setExpenses([...expenses, newExpense])

    // Update account balance
    setBankAccounts(accounts =>
      accounts.map(account =>
        account.id === expense.accountId
          ? { ...account, balance: account.balance - expense.amount }
          : account
      )
    )
  }

  const addIncome = (income: Omit<Income, "id">) => {
    const newIncome = {
      ...income,
      id: Math.random().toString(36).substring(2, 9),
    }
    setIncomes([...incomes, newIncome])
  }

  const addLoan = (loan: Omit<Loan, "id">) => {
    const newLoan = {
      ...loan,
      id: Math.random().toString(36).substring(2, 9),
    }
    setLoans([...loans, newLoan])
  }

  const addRecurringItem = (item: Omit<RecurringItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    const newItem: RecurringItem = item.type === "subscription"
      ? {
          ...item,
          id,
          type: "subscription",
          reminderDays: (item as Omit<Subscription, "id">).reminderDays,
          serviceUrl: (item as Omit<Subscription, "id">).serviceUrl,
          cancelUrl: (item as Omit<Subscription, "id">).cancelUrl,
        }
      : {
          ...item,
          id,
          type: "recurring",
          recipient: (item as Omit<RecurringPayment, "id">).recipient,
        }

    setRecurringItems(prevItems => [...prevItems, newItem])
  }

  const updateRecurringItem = (id: string, updates: Partial<RecurringItem>) => {
    setRecurringItems(items => 
      items.map(item => {
        if (item.id !== id) return item
        return { ...item, ...updates } as RecurringItem
      })
    )
  }

  const deleteRecurringItem = (id: string) => {
    setRecurringItems(items => items.filter(item => item.id !== id))
  }

  const handleExpenseClick = (expense: Expense) => {
    setSelectedTransaction(expense)
    setTransactionType("expense")
    setIsTransactionDetailOpen(true)
  }

  const handleIncomeClick = (income: Income) => {
    setSelectedTransaction(income)
    setTransactionType("income")
    setIsTransactionDetailOpen(true)
  }

  const handleCloseTransactionDetail = () => {
    setIsTransactionDetailOpen(false)
    setSelectedTransaction(null)
  }

  const filteredExpenses = expenses.filter((expense) => {
    // Filter by custom date range if set
    if (dateRange.from && dateRange.to) {
      return expense.date >= dateRange.from && expense.date <= dateRange.to
    }

    // Filter by month if selected
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-")
      return (
        expense.date.getFullYear() === Number.parseInt(year) && expense.date.getMonth() === Number.parseInt(month) - 1
      )
    }

    return true
  })

  const updateLoanStatus = (loanId: string, status: Loan["status"]) => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ))
  }

  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = {
      ...account,
      id: Math.random().toString(36).substring(2, 9),
    }
    setBankAccounts([...bankAccounts, newAccount])
  }

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(accounts => 
      accounts.map(account => 
        account.id === id ? { ...account, ...updates } : account
      )
    )
  }

  const deleteBankAccount = (id: string) => {
    setBankAccounts(accounts => accounts.filter(account => account.id !== id))
  }

  const addTransfer = (transfer: Omit<Transfer, "id">) => {
    const newTransfer = {
      ...transfer,
      id: Math.random().toString(36).substring(2, 9),
    }
    
    // Update account balances
    setBankAccounts(accounts => 
      accounts.map(account => {
        if (account.id === transfer.fromAccountId) {
          return { ...account, balance: account.balance - transfer.amount }
        }
        if (account.id === transfer.toAccountId) {
          return { ...account, balance: account.balance + transfer.amount }
        }
        return account
      })
    )
    
    setTransfers([...transfers, newTransfer])
  }

  const handleTabChange = (value: string) => {
    router.push(`/?tab=${value}`, { scroll: false })
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Financial Tracker</h1>
          <div className="flex items-center gap-2">
            <CurrencySelector onCurrencyChange={setCurrency} />
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
                  <p className="text-muted-foreground">
                    Track and manage your expenses here.
                  </p>
                </div>
                <ExpenseForm 
                  onAddExpense={addExpense} 
                  currencySymbol={currency.symbol}
                  accounts={bankAccounts}
                />
                <div className="mt-8">
                  <ExpenseFilters
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                  />
                  <ExpenseTable 
                    expenses={filteredExpenses} 
                    currencySymbol={currency.symbol}
                    onExpenseClick={handleExpenseClick}
                    accounts={bankAccounts}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="income" className="w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Income</h2>
                  <p className="text-muted-foreground">
                    Track and manage your income here.
                  </p>
                </div>
                <IncomeForm onAddIncome={addIncome} currencySymbol={currency.symbol} />
                <div className="mt-8">
                  <IncomeView
                    incomes={incomes}
                    monthlySalary={monthlySalary}
                    onUpdateSalary={setMonthlySalary}
                    currencySymbol={currency.symbol}
                    onIncomeClick={handleIncomeClick}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                  <p className="text-muted-foreground">
                    Manage your bank accounts and balances.
                  </p>
                </div>
                <BankAccountManagement
                  accounts={bankAccounts}
                  transfers={transfers}
                  onAddAccount={addBankAccount}
                  onUpdateAccount={updateBankAccount}
                  onDeleteAccount={deleteBankAccount}
                  onAddTransfer={addTransfer}
                  currencySymbol={currency.symbol}
                />
              </div>
            </TabsContent>

            <TabsContent value="loans" className="w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Loans</h2>
                  <p className="text-muted-foreground">
                    Track your loans and payments.
                  </p>
                </div>
                <LoanManagement
                  loans={loans}
                  onAddLoan={addLoan}
                  onUpdateLoanStatus={updateLoanStatus}
                  currencySymbol={currency.symbol}
                />
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Recurring</h2>
                  <p className="text-muted-foreground">
                    Manage your recurring transactions.
                  </p>
                </div>
                <RecurringManagement
                  items={recurringItems}
                  onAddItem={addRecurringItem}
                  onUpdateItem={updateRecurringItem}
                  onDeleteItem={deleteRecurringItem}
                  currencySymbol={currency.symbol}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          isOpen={isTransactionDetailOpen}
          onClose={handleCloseTransactionDetail}
          type={transactionType}
          currencySymbol={currency.symbol}
          accounts={bankAccounts}
        />
      )}
    </div>
  )
}

