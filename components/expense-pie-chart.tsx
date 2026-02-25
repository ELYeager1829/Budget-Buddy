"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useBudgetStore, getCategoryBreakdown, formatCurrency } from "@/lib/budget-store"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#4a90d9",
  Rent: "#6366f1",
  Transport: "#38bdf8",
  Entertainment: "#f59e42",
  Utilities: "#eab308",
  Healthcare: "#ef4444",
  Savings: "#22c55e",
  Other: "#94a3b8",
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  name: string
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: LabelProps) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface TooltipPayloadItem {
  name: string
  value: number
  payload: {
    name: string
    value: number
    fill: string
  }
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0]
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-card-foreground shadow-md">
      <p className="text-sm font-semibold">{data.name}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
    </div>
  )
}

export function ExpensePieChart() {
  const store = useBudgetStore()

  const chartData = useMemo(() => {
    const breakdown = getCategoryBreakdown(store)
    return breakdown.map((d) => ({
      name: d.category,
      value: d.tracked,
      fill: CATEGORY_COLORS[d.category] || "#94a3b8",
    }))
  }, [store])

  const totalTracked = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Expenses by Category</CardTitle>
          <CardDescription>Add expenses to see your spending breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No expense data yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Expenses by Category</CardTitle>
        <CardDescription>Total tracked: {formatCurrency(totalTracked)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
