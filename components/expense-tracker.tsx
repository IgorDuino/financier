"use client"

import { useState } from "react"
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

export type Expense = {
  id: string
  amount: number
  category: string
  date: Date
  description?: string
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

export default function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("expenses")
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 42.99,
      category: "Groceries",
      date: new Date(2023, 5, 15),
      description: "Weekly shopping",
    },
    {
      id: "2",
      amount: 9.99,
      category: "Entertainment",
      date: new Date(2023, 5, 18),
      description: "Movie ticket",
    },
    {
      id: "3",
      amount: 29.99,
      category: "Utilities",
      date: new Date(2023, 5, 20),
      description: "Internet bill",
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

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substring(2, 9),
    }
    setExpenses([...expenses, newExpense])
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="expenses" className="w-full">
              <ExpenseForm onAddExpense={addExpense} currencySymbol={currency.symbol} />
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
                />
              </div>
            </TabsContent>

            <TabsContent value="income" className="w-full">
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
            </TabsContent>

            <TabsContent value="loans" className="w-full">
              <LoanManagement
                loans={loans}
                onAddLoan={addLoan}
                onUpdateLoanStatus={updateLoanStatus}
                currencySymbol={currency.symbol}
              />
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
        />
      )}
    </div>
  )
}

