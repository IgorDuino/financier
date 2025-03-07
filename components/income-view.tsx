"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Income } from "@/components/expense-tracker"

type IncomeViewProps = {
  incomes: Income[]
  monthlySalary: number
  onUpdateSalary: (salary: number) => void
  currencySymbol: string
  onIncomeClick: (income: Income) => void
}

export function IncomeView({ 
  incomes, 
  monthlySalary, 
  onUpdateSalary,
  currencySymbol,
  onIncomeClick
}: IncomeViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSalary, setNewSalary] = useState(monthlySalary.toString())

  const handleSalaryUpdate = () => {
    onUpdateSalary(Number.parseFloat(newSalary))
    setIsDialogOpen(false)
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Monthly Income</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Update Salary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Monthly Salary</DialogTitle>
                <DialogDescription>
                  Set your regular monthly income to better track your finances.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">
                    Salary
                  </Label>
                  <div className="relative col-span-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">{currencySymbol}</span>
                    <Input
                      id="salary"
                      type="number"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSalaryUpdate}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencySymbol}{monthlySalary.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Regular monthly income</p>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No income records found.
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow 
                  key={income.id} 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => onIncomeClick(income)}
                >
                  <TableCell>{formatDate(income.date)}</TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>
                    {income.frequency.charAt(0).toUpperCase() + income.frequency.slice(1)}
                  </TableCell>
                  <TableCell>{income.description || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {currencySymbol}{income.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

