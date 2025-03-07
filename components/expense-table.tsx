"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Expense } from "@/components/expense-tracker"

type ExpenseTableProps = {
  expenses: Expense[]
  currencySymbol: string
  onExpenseClick: (expense: Expense) => void
}

export function ExpenseTable({ expenses, currencySymbol, onExpenseClick }: ExpenseTableProps) {
  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No expenses found.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow 
                key={expense.id} 
                className="cursor-pointer hover:bg-muted/80"
                onClick={() => onExpenseClick(expense)}
              >
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description || "-"}</TableCell>
                <TableCell className="text-right font-medium">{currencySymbol}{expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

