"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Expense, Income, BankAccount } from "@/components/expense-tracker"

type TransactionDetailProps = {
  transaction: Expense | Income
  isOpen: boolean
  onClose: () => void
  type: "expense" | "income"
  currencySymbol: string
  accounts: BankAccount[]
}

export function TransactionDetail({ 
  transaction, 
  isOpen, 
  onClose, 
  type, 
  currencySymbol,
  accounts
}: TransactionDetailProps) {
  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">{currencySymbol}{transaction.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(transaction.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {type === "expense" ? "Category" : "Source"}
              </p>
              <p className="font-medium">
                {type === "expense" 
                  ? (transaction as Expense).category
                  : (transaction as Income).source
                }
              </p>
            </div>
            {type === "expense" && (
              <div>
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="font-medium">
                  {accounts.find(a => a.id === (transaction as Expense).accountId)?.name || "Unknown Account"}
                </p>
              </div>
            )}
            {type === "income" && (transaction as Income).frequency !== "one-time" && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-medium capitalize">{(transaction as Income).frequency}</p>
                </div>
                {(transaction as Income).startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate((transaction as Income).startDate!)}</p>
                  </div>
                )}
                {(transaction as Income).endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate((transaction as Income).endDate!)}</p>
                  </div>
                )}
              </>
            )}
          </div>
          {transaction.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 