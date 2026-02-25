"use client"

import { useBudgetStore, updateSettings, getPeriodLabel } from "@/lib/budget-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

export function PeriodSelector() {
  const store = useBudgetStore()
  const period = store.settings.selected_period
  const label = getPeriodLabel(period)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span className="hidden md:inline">{label}</span>
      </div>
      <Select
        value={period}
        onValueChange={(v) =>
          updateSettings({ selected_period: v as "weekly" | "monthly" | "yearly" })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
