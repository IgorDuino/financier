"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { Expense, Income } from "@/components/expense-tracker"

type TransactionDetailProps = {
  transaction: Expense | Income
  isOpen: boolean
  onClose: () => void
  type: "expense" | "income"
  currencySymbol: string
}

export function TransactionDetail({ 
  transaction, 
  isOpen, 
  onClose, 
  type,
  currencySymbol
}: TransactionDetailProps) {
  function formatDate(date: Date | undefined): string {
    if (!date) return "Not specified";
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      weekday: "long"
    }
    return date.toLocaleDateString("en-US", options)
  }

  const isIncome = type === "income"
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isIncome ? "Income" : "Expense"} Details
          </DialogTitle>
          <DialogDescription>
            View details for this {isIncome ? "income" : "expense"} transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-[1fr_2fr] gap-y-4">
                <dt className="font-medium text-muted-foreground">
                  {isIncome ? "Source" : "Category"}:
                </dt>
                <dd>
                  {isIncome 
                    ? (transaction as Income).source 
                    : (transaction as Expense).category}
                </dd>
                
                <dt className="font-medium text-muted-foreground">Amount:</dt>
                <dd className="font-semibold">
                  {currencySymbol}{transaction.amount.toFixed(2)}
                </dd>
                
                {isIncome && (
                  <>
                    <dt className="font-medium text-muted-foreground">Frequency:</dt>
                    <dd>
                      {(transaction as Income).frequency.charAt(0).toUpperCase() + 
                       (transaction as Income).frequency.slice(1)}
                    </dd>
                    
                    {(transaction as Income).frequency !== "one-time" && (
                      <>
                        <dt className="font-medium text-muted-foreground">Period:</dt>
                        <dd>
                          {formatDate((transaction as Income).startDate || transaction.date)}
                          {(transaction as Income).endDate ? 
                            ` to ${formatDate((transaction as Income).endDate)}` : 
                            " (ongoing)"}
                        </dd>
                      </>
                    )}
                  </>
                )}
                
                <dt className="font-medium text-muted-foreground">Date:</dt>
                <dd>{formatDate(transaction.date)}</dd>
                
                <dt className="font-medium text-muted-foreground">Description:</dt>
                <dd>{transaction.description || "-"}</dd>
                
                <dt className="font-medium text-muted-foreground">Transaction ID:</dt>
                <dd className="text-xs text-muted-foreground">{transaction.id}</dd>
              </dl>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 