"use client"

import { useBudgetStore, updateSettings, getPeriodLabel } from "@/lib/budget-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function SettingsPanel() {
  const store = useBudgetStore()
  const s = store.settings

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Period & Year</CardTitle>
          <CardDescription>
            Configure the budget timeframe. Currently viewing: {getPeriodLabel(s.selected_period)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="selected-year">Selected Year</Label>
              <Input
                id="selected-year"
                type="number"
                min="2020"
                max="2030"
                value={s.selected_year}
                onChange={(e) => updateSettings({ selected_year: parseInt(e.target.value) || 2026 })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="starting-year">Starting Year</Label>
              <Input
                id="starting-year"
                type="number"
                min="2020"
                max="2030"
                value={s.starting_year}
                onChange={(e) => updateSettings({ starting_year: parseInt(e.target.value) || 2026 })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="selected-period">Budget Period</Label>
              <Select
                value={s.selected_period}
                onValueChange={(v) =>
                  updateSettings({ selected_period: v as "monthly" | "weekly" | "yearly" })
                }
              >
                <SelectTrigger id="selected-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Savings Calculation</CardTitle>
          <CardDescription>How to calculate your savings rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="savings-type">Calculation Type</Label>
            <Select
              value={s.savings_rate_calculation_type}
              onValueChange={(v) =>
                updateSettings({ savings_rate_calculation_type: v as "gross" | "net" })
              }
            >
              <SelectTrigger id="savings-type" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gross">Gross Income</SelectItem>
                <SelectItem value="net">Net Income</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {s.savings_rate_calculation_type === "gross"
                ? "Savings rate is calculated as a percentage of total gross income."
                : "Savings rate is calculated as a percentage of income after taxes and deductions."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Late Income Handling</CardTitle>
          <CardDescription>
            Shift income received after a certain day to the next period.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="shift-status" className="text-sm font-medium text-foreground">
                Enable Late Income Shift
              </Label>
              <p className="text-xs text-muted-foreground">
                Income received after the starting day will be counted in the next period.
              </p>
            </div>
            <Switch
              id="shift-status"
              checked={s.shift_late_income_status}
              onCheckedChange={(checked) =>
                updateSettings({ shift_late_income_status: checked })
              }
            />
          </div>

          {s.shift_late_income_status && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="shift-day">Starting Day of Month</Label>
              <Input
                id="shift-day"
                type="number"
                min="1"
                max="31"
                className="w-32"
                value={s.shift_late_income_starting_day}
                onChange={(e) =>
                  updateSettings({
                    shift_late_income_starting_day: parseInt(e.target.value) || 25,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Income received on or after day {s.shift_late_income_starting_day} will shift to the next period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
