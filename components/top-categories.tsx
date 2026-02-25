"use client"

import { useMemo } from "react"
import { useBudgetStore, getFilteredCategoryBreakdown, formatCurrency } from "@/lib/budget-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Utensils,
  Home,
  Bus,
  Clapperboard,
  Zap,
  HeartPulse,
  PiggyBank,
  CircleDot,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils className="h-4 w-4" />,
  Rent: <Home className="h-4 w-4" />,
  Transport: <Bus className="h-4 w-4" />,
  Entertainment: <Clapperboard className="h-4 w-4" />,
  Utilities: <Zap className="h-4 w-4" />,
  Healthcare: <HeartPulse className="h-4 w-4" />,
  Savings: <PiggyBank className="h-4 w-4" />,
  Other: <CircleDot className="h-4 w-4" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-primary/10 text-primary",
  Rent: "bg-indigo-500/10 text-indigo-600",
  Transport: "bg-sky-500/10 text-sky-600",
  Entertainment: "bg-amber-500/10 text-amber-600",
  Utilities: "bg-yellow-500/10 text-yellow-600",
  Healthcare: "bg-rose-500/10 text-rose-500",
  Savings: "bg-emerald-500/10 text-emerald-600",
  Other: "bg-muted text-muted-foreground",
}

export function TopCategories() {
  const store = useBudgetStore()
  const categories = useMemo(() => getFilteredCategoryBreakdown(store).slice(0, 5), [store])

  if (categories.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Top Categories</CardTitle>
          <CardDescription>Add expenses to see ranking</CardDescription>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Top Categories</CardTitle>
        <CardDescription>Highest spending categories ranked by tracked expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {categories.map((cat, i) => {
            const pct = Math.min(cat.percentage, 100)
            return (
              <div key={cat.category} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{i + 1}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${CATEGORY_COLORS[cat.category] || "bg-muted text-muted-foreground"}`}
                    >
                      {CATEGORY_ICONS[cat.category] || <CircleDot className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-foreground">{formatCurrency(cat.tracked)}</span>
                    <span className="text-muted-foreground">/ {formatCurrency(cat.budgeted)}</span>
                    {cat.overBudget && (
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-500">
                        Over
                      </span>
                    )}
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={`h-2 ${cat.overBudget ? "[&>[data-slot=progress-indicator]]:bg-rose-500" : ""}`}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
