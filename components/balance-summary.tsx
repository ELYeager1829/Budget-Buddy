"use client"

import { useMemo } from "react"
import { useBudgetEntries } from "@/lib/budget-store"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function BalanceSummary() {
  const entries = useBudgetEntries()

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0
    let expenses = 0
    for (const entry of entries) {
      if (entry.type === "income") income += entry.amount
      else expenses += entry.amount
    }
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    }
  }, [entries])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-none bg-primary text-primary-foreground shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">
              Current Balance
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Income
            </p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </p>
            <p className="text-2xl font-bold tracking-tight text-rose-500">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
