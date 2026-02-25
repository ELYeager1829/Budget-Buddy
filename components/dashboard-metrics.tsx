"use client"

import { useMemo } from "react"
import { useBudgetStore, computeMetrics, formatCurrency } from "@/lib/budget-store"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingDown, Percent } from "lucide-react"

export function DashboardMetricsCards() {
  const store = useBudgetStore()

  const metrics = useMemo(() => computeMetrics(store), [store])

  const pct = Math.min(metrics.percentage_completed, 100)
  const isOver = metrics.percentage_completed > 100

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(metrics.budget_total)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Tracked Expenses</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(metrics.tracked_total)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isOver ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"}`}>
              <Percent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className={`text-2xl font-bold tracking-tight ${isOver ? "text-rose-500" : "text-foreground"}`}>
                {metrics.percentage_completed.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Budget utilization</span>
            <span className={`font-semibold ${isOver ? "text-rose-500" : "text-foreground"}`}>
              {formatCurrency(metrics.tracked_total)} of {formatCurrency(metrics.budget_total)}
            </span>
          </div>
          <Progress
            value={pct}
            className={`h-3 ${isOver ? "[&>[data-slot=progress-indicator]]:bg-rose-500" : ""}`}
          />
          <p className="text-xs text-muted-foreground">
            {isOver
              ? `Over budget by ${formatCurrency(Math.abs(metrics.remaining_budget))}`
              : `${formatCurrency(metrics.remaining_budget)} remaining`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
