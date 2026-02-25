import { useSyncExternalStore } from "react"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns"

// ─── Types ───────────────────────────────────────────────────────────────────

export type BudgetCategory =
  | "Food"
  | "Rent"
  | "Transport"
  | "Entertainment"
  | "Utilities"
  | "Healthcare"
  | "Savings"
  | "Other"

export const ALL_CATEGORIES: BudgetCategory[] = [
  "Food",
  "Rent",
  "Transport",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Savings",
  "Other",
]

export type ItemType = "expense" | "income"

export interface BudgetItem {
  id: string
  name: string
  type: ItemType
  category: BudgetCategory
  is_cat: boolean
  budget_amount: number
  budget_rank: number
}

export interface TrackedExpense {
  id: string
  budget_item_id: string
  amount: number
  tracked_rank: number
  month_number: number
  date: string
  note: string
}

export interface UserSettings {
  selected_year: number
  starting_year: number
  selected_period: "monthly" | "weekly" | "yearly"
  savings_rate_calculation_type: "gross" | "net"
  shift_late_income_starting_day: number
  shift_late_income_status: boolean
}

export interface DashboardMetrics {
  budget_total: number
  tracked_total: number
  remaining_budget: number
  percentage_completed: number
  income_total: number
  tracked_income: number
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  { id: "b1", name: "Groceries", type: "expense", category: "Food", is_cat: false, budget_amount: 500, budget_rank: 1 },
  { id: "b2", name: "Dining Out", type: "expense", category: "Food", is_cat: false, budget_amount: 200, budget_rank: 2 },
  { id: "b3", name: "Apartment Rent", type: "expense", category: "Rent", is_cat: false, budget_amount: 1200, budget_rank: 1 },
  { id: "b4", name: "Metro Pass", type: "expense", category: "Transport", is_cat: false, budget_amount: 120, budget_rank: 1 },
  { id: "b5", name: "Gas & Parking", type: "expense", category: "Transport", is_cat: false, budget_amount: 80, budget_rank: 2 },
  { id: "b6", name: "Streaming & Movies", type: "expense", category: "Entertainment", is_cat: false, budget_amount: 60, budget_rank: 1 },
  { id: "b7", name: "Concerts & Events", type: "expense", category: "Entertainment", is_cat: false, budget_amount: 100, budget_rank: 2 },
  { id: "b8", name: "Electric & Water", type: "expense", category: "Utilities", is_cat: false, budget_amount: 150, budget_rank: 1 },
  { id: "b9", name: "Internet", type: "expense", category: "Utilities", is_cat: false, budget_amount: 60, budget_rank: 2 },
  { id: "b10", name: "Monthly Salary", type: "income", category: "Other", is_cat: false, budget_amount: 4500, budget_rank: 1 },
  { id: "b11", name: "Freelance Work", type: "income", category: "Other", is_cat: false, budget_amount: 750, budget_rank: 2 },
]

const INITIAL_TRACKED: TrackedExpense[] = [
  { id: "t1", budget_item_id: "b1", amount: 420, tracked_rank: 1, month_number: 2, date: "2026-02-05", note: "Weekly grocery runs" },
  { id: "t2", budget_item_id: "b2", amount: 175, tracked_rank: 2, month_number: 2, date: "2026-02-08", note: "Restaurant dinners" },
  { id: "t3", budget_item_id: "b3", amount: 1200, tracked_rank: 1, month_number: 2, date: "2026-02-01", note: "February rent" },
  { id: "t4", budget_item_id: "b4", amount: 120, tracked_rank: 1, month_number: 2, date: "2026-02-01", note: "Monthly metro pass" },
  { id: "t5", budget_item_id: "b5", amount: 95, tracked_rank: 2, month_number: 2, date: "2026-02-12", note: "Parking and gas" },
  { id: "t6", budget_item_id: "b6", amount: 45, tracked_rank: 1, month_number: 2, date: "2026-02-01", note: "Netflix & Spotify" },
  { id: "t7", budget_item_id: "b7", amount: 120, tracked_rank: 2, month_number: 2, date: "2026-02-15", note: "Concert tickets" },
  { id: "t8", budget_item_id: "b8", amount: 135, tracked_rank: 1, month_number: 2, date: "2026-02-10", note: "Electric & water bill" },
  { id: "t9", budget_item_id: "b9", amount: 60, tracked_rank: 2, month_number: 2, date: "2026-02-05", note: "Internet bill" },
  { id: "t10", budget_item_id: "b10", amount: 4500, tracked_rank: 1, month_number: 2, date: "2026-02-01", note: "Salary deposit" },
  { id: "t11", budget_item_id: "b11", amount: 600, tracked_rank: 2, month_number: 2, date: "2026-02-18", note: "Freelance project payment" },
]

const INITIAL_SETTINGS: UserSettings = {
  selected_year: 2026,
  starting_year: 2026,
  selected_period: "monthly",
  savings_rate_calculation_type: "gross",
  shift_late_income_starting_day: 25,
  shift_late_income_status: false,
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface StoreState {
  budgetItems: BudgetItem[]
  trackedExpenses: TrackedExpense[]
  settings: UserSettings
}

let state: StoreState = {
  budgetItems: INITIAL_BUDGET_ITEMS,
  trackedExpenses: INITIAL_TRACKED,
  settings: INITIAL_SETTINGS,
}

let listeners: (() => void)[] = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function useBudgetStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// ─── Budget Item Actions ─────────────────────────────────────────────────────

export function addBudgetItem(item: Omit<BudgetItem, "id">) {
  state = {
    ...state,
    budgetItems: [...state.budgetItems, { ...item, id: crypto.randomUUID() }],
  }
  emitChange()
}

export function updateBudgetItem(id: string, update: Partial<BudgetItem>) {
  state = {
    ...state,
    budgetItems: state.budgetItems.map((i) => (i.id === id ? { ...i, ...update } : i)),
  }
  emitChange()
}

export function deleteBudgetItem(id: string) {
  state = {
    ...state,
    budgetItems: state.budgetItems.filter((i) => i.id !== id),
    trackedExpenses: state.trackedExpenses.filter((t) => t.budget_item_id !== id),
  }
  emitChange()
}

// ─── Tracked Expense Actions ─────────────────────────────────────────────────

export function addTrackedExpense(expense: Omit<TrackedExpense, "id">) {
  state = {
    ...state,
    trackedExpenses: [...state.trackedExpenses, { ...expense, id: crypto.randomUUID() }],
  }
  emitChange()
}

export function updateTrackedExpense(id: string, update: Partial<TrackedExpense>) {
  state = {
    ...state,
    trackedExpenses: state.trackedExpenses.map((t) => (t.id === id ? { ...t, ...update } : t)),
  }
  emitChange()
}

export function deleteTrackedExpense(id: string) {
  state = {
    ...state,
    trackedExpenses: state.trackedExpenses.filter((t) => t.id !== id),
  }
  emitChange()
}

// ─── Settings Actions ────────────────────────────────────────────────────────

export function updateSettings(update: Partial<UserSettings>) {
  state = {
    ...state,
    settings: { ...state.settings, ...update },
  }
  emitChange()
}

// ─── Computed Metrics ────────────────────────────────────────────────────────

export function computeMetrics(s: StoreState): DashboardMetrics {
  const expenseItems = s.budgetItems.filter((i) => i.type === "expense")
  const incomeItems = s.budgetItems.filter((i) => i.type === "income")

  const budget_total = expenseItems.reduce((sum, i) => sum + i.budget_amount, 0)
  const income_total = incomeItems.reduce((sum, i) => sum + i.budget_amount, 0)

  const expenseItemIds = new Set(expenseItems.map((i) => i.id))
  const incomeItemIds = new Set(incomeItems.map((i) => i.id))

  const tracked_total = s.trackedExpenses
    .filter((t) => expenseItemIds.has(t.budget_item_id))
    .reduce((sum, t) => sum + t.amount, 0)

  const tracked_income = s.trackedExpenses
    .filter((t) => incomeItemIds.has(t.budget_item_id))
    .reduce((sum, t) => sum + t.amount, 0)

  const remaining_budget = budget_total - tracked_total
  const percentage_completed = budget_total > 0 ? (tracked_total / budget_total) * 100 : 0

  return { budget_total, tracked_total, remaining_budget, percentage_completed, income_total, tracked_income }
}

export function getCategoryBreakdown(s: StoreState) {
  const expenseItems = s.budgetItems.filter((i) => i.type === "expense")
  const categoryMap = new Map<string, { budgeted: number; tracked: number }>()

  for (const item of expenseItems) {
    const current = categoryMap.get(item.category) || { budgeted: 0, tracked: 0 }
    current.budgeted += item.budget_amount
    categoryMap.set(item.category, current)
  }

  for (const tracked of s.trackedExpenses) {
    const budgetItem = s.budgetItems.find((i) => i.id === tracked.budget_item_id)
    if (budgetItem && budgetItem.type === "expense") {
      const current = categoryMap.get(budgetItem.category) || { budgeted: 0, tracked: 0 }
      current.tracked += tracked.amount
      categoryMap.set(budgetItem.category, current)
    }
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      budgeted: data.budgeted,
      tracked: data.tracked,
      remaining: data.budgeted - data.tracked,
      overBudget: data.tracked > data.budgeted,
      percentage: data.budgeted > 0 ? (data.tracked / data.budgeted) * 100 : 0,
    }))
    .sort((a, b) => b.tracked - a.tracked)
}

export function getTopRankedCategories(s: StoreState) {
  return getCategoryBreakdown(s).slice(0, 5)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Period Filtering ────────────────────────────────────────────────────────

export function getPeriodRange(period: "weekly" | "monthly" | "yearly", referenceDate?: Date) {
  const now = referenceDate || new Date()
  switch (period) {
    case "weekly":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case "monthly":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "yearly":
      return { start: startOfYear(now), end: endOfYear(now) }
  }
}

export function getPeriodLabel(period: "weekly" | "monthly" | "yearly") {
  const now = new Date()
  switch (period) {
    case "weekly": {
      const range = getPeriodRange("weekly")
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return `Week of ${fmt(range.start)} - ${fmt(range.end)}`
    }
    case "monthly":
      return now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    case "yearly":
      return now.getFullYear().toString()
  }
}

export function getFilteredTrackedExpenses(s: StoreState) {
  const range = getPeriodRange(s.settings.selected_period)
  return s.trackedExpenses.filter((t) => {
    const d = new Date(t.date + "T12:00:00")
    return isWithinInterval(d, { start: range.start, end: range.end })
  })
}

export function computeFilteredMetrics(s: StoreState): DashboardMetrics {
  const filtered = getFilteredTrackedExpenses(s)
  const expenseItems = s.budgetItems.filter((i) => i.type === "expense")
  const incomeItems = s.budgetItems.filter((i) => i.type === "income")

  const budget_total = expenseItems.reduce((sum, i) => sum + i.budget_amount, 0)
  const income_total = incomeItems.reduce((sum, i) => sum + i.budget_amount, 0)

  const expenseItemIds = new Set(expenseItems.map((i) => i.id))
  const incomeItemIds = new Set(incomeItems.map((i) => i.id))

  const tracked_total = filtered
    .filter((t) => expenseItemIds.has(t.budget_item_id))
    .reduce((sum, t) => sum + t.amount, 0)

  const tracked_income = filtered
    .filter((t) => incomeItemIds.has(t.budget_item_id))
    .reduce((sum, t) => sum + t.amount, 0)

  const remaining_budget = budget_total - tracked_total
  const percentage_completed = budget_total > 0 ? (tracked_total / budget_total) * 100 : 0

  return { budget_total, tracked_total, remaining_budget, percentage_completed, income_total, tracked_income }
}

export function getFilteredCategoryBreakdown(s: StoreState) {
  const filtered = getFilteredTrackedExpenses(s)
  const expenseItems = s.budgetItems.filter((i) => i.type === "expense")
  const categoryMap = new Map<string, { budgeted: number; tracked: number }>()

  for (const item of expenseItems) {
    const current = categoryMap.get(item.category) || { budgeted: 0, tracked: 0 }
    current.budgeted += item.budget_amount
    categoryMap.set(item.category, current)
  }

  for (const tracked of filtered) {
    const budgetItem = s.budgetItems.find((i) => i.id === tracked.budget_item_id)
    if (budgetItem && budgetItem.type === "expense") {
      const current = categoryMap.get(budgetItem.category) || { budgeted: 0, tracked: 0 }
      current.tracked += tracked.amount
      categoryMap.set(budgetItem.category, current)
    }
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      budgeted: data.budgeted,
      tracked: data.tracked,
      remaining: data.budgeted - data.tracked,
      overBudget: data.tracked > data.budgeted,
      percentage: data.budgeted > 0 ? (data.tracked / data.budgeted) * 100 : 0,
    }))
    .sort((a, b) => b.tracked - a.tracked)
}

// ─── Overspending Detection ──────────────────────────────────────────────────

export interface OverspendingItem {
  itemId: string
  itemName: string
  category: string
  budgeted: number
  tracked: number
  overBy: number
}

export function getOverspendingItems(s: StoreState): OverspendingItem[] {
  const filtered = getFilteredTrackedExpenses(s)
  const expenseItems = s.budgetItems.filter((i) => i.type === "expense")

  const trackedMap = new Map<string, number>()
  for (const t of filtered) {
    trackedMap.set(t.budget_item_id, (trackedMap.get(t.budget_item_id) || 0) + t.amount)
  }

  return expenseItems
    .filter((item) => {
      const tracked = trackedMap.get(item.id) || 0
      return tracked > item.budget_amount
    })
    .map((item) => {
      const tracked = trackedMap.get(item.id) || 0
      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        budgeted: item.budget_amount,
        tracked,
        overBy: tracked - item.budget_amount,
      }
    })
}

// ─── Export Utilities ─────────────────────────────────────────────────────────

export function generateCSV(s: StoreState): string {
  const metrics = computeFilteredMetrics(s)
  const breakdown = getFilteredCategoryBreakdown(s)
  const filtered = getFilteredTrackedExpenses(s)
  const period = s.settings.selected_period
  const periodLabel = getPeriodLabel(period)

  let csv = "BudgetBuddy Export\n"
  csv += `Period,${periodLabel}\n`
  csv += `Generated,${new Date().toLocaleDateString()}\n\n`

  csv += "SUMMARY\n"
  csv += "Metric,Amount\n"
  csv += `Total Budget,${metrics.budget_total}\n`
  csv += `Tracked Expenses,${metrics.tracked_total}\n`
  csv += `Remaining,${metrics.remaining_budget}\n`
  csv += `Completion,${metrics.percentage_completed.toFixed(1)}%\n`
  csv += `Planned Income,${metrics.income_total}\n`
  csv += `Tracked Income,${metrics.tracked_income}\n\n`

  csv += "CATEGORY BREAKDOWN\n"
  csv += "Category,Budgeted,Tracked,Remaining,Over Budget\n"
  for (const c of breakdown) {
    csv += `${c.category},${c.budgeted},${c.tracked},${c.remaining},${c.overBudget ? "Yes" : "No"}\n`
  }
  csv += "\n"

  csv += "TRACKED TRANSACTIONS\n"
  csv += "Date,Item,Category,Type,Amount,Note\n"
  for (const t of filtered) {
    const item = s.budgetItems.find((i) => i.id === t.budget_item_id)
    csv += `${t.date},${item?.name || "Unknown"},${item?.category || "Other"},${item?.type || "expense"},${t.amount},"${t.note}"\n`
  }

  return csv
}

export function downloadCSV(s: StoreState) {
  const csv = generateCSV(s)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `budget-buddy-${s.settings.selected_period}-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadPDF(s: StoreState) {
  const metrics = computeFilteredMetrics(s)
  const breakdown = getFilteredCategoryBreakdown(s)
  const filtered = getFilteredTrackedExpenses(s)
  const periodLabel = getPeriodLabel(s.settings.selected_period)
  const overspending = getOverspendingItems(s)

  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `<!DOCTYPE html>
<html><head><title>BudgetBuddy Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a2332; }
  h1 { font-size: 24px; margin-bottom: 4px; color: #1a2332; }
  h2 { font-size: 16px; margin: 28px 0 12px; color: #4a90d9; border-bottom: 2px solid #e8ecf0; padding-bottom: 6px; }
  .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 8px; }
  .metric { background: #f0f5fa; border-radius: 8px; padding: 16px; }
  .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
  .metric-value { font-size: 22px; font-weight: 700; }
  .over { color: #e11d48; }
  .ok { color: #059669; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f0f5fa; font-weight: 600; color: #475569; }
  td { padding: 8px 12px; border-bottom: 1px solid #e8ecf0; }
  .alert { background: #fef2f2; border-left: 3px solid #e11d48; padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; font-size: 13px; }
  .alert strong { color: #e11d48; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <h1>BudgetBuddy Report</h1>
  <p class="subtitle">${periodLabel} &mdash; Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

  <div class="metrics">
    <div class="metric"><div class="metric-label">Total Budget</div><div class="metric-value">$${metrics.budget_total.toLocaleString()}</div></div>
    <div class="metric"><div class="metric-label">Tracked</div><div class="metric-value ${metrics.percentage_completed > 100 ? "over" : ""}">$${metrics.tracked_total.toLocaleString()}</div></div>
    <div class="metric"><div class="metric-label">Remaining</div><div class="metric-value ${metrics.remaining_budget < 0 ? "over" : "ok"}">$${metrics.remaining_budget.toLocaleString()}</div></div>
  </div>

  ${overspending.length > 0 ? `
  <h2>Overspending Alerts</h2>
  ${overspending.map((o) => `<div class="alert"><strong>${o.itemName}</strong> (${o.category}) &mdash; Over by $${o.overBy.toLocaleString()} (tracked $${o.tracked.toLocaleString()} of $${o.budgeted.toLocaleString()} budget)</div>`).join("")}
  ` : ""}

  <h2>Category Breakdown</h2>
  <table>
    <thead><tr><th>Category</th><th>Budgeted</th><th>Tracked</th><th>Remaining</th><th>Status</th></tr></thead>
    <tbody>${breakdown.map((c) => `<tr><td>${c.category}</td><td>$${c.budgeted.toLocaleString()}</td><td>$${c.tracked.toLocaleString()}</td><td>$${c.remaining.toLocaleString()}</td><td class="${c.overBudget ? "over" : "ok"}">${c.overBudget ? "Over Budget" : "On Track"}</td></tr>`).join("")}</tbody>
  </table>

  <h2>Transactions (${filtered.length})</h2>
  <table>
    <thead><tr><th>Date</th><th>Item</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
    <tbody>${filtered.map((t) => {
      const item = s.budgetItems.find((i) => i.id === t.budget_item_id)
      return `<tr><td>${t.date}</td><td>${item?.name || "Unknown"}</td><td>${item?.category || ""}</td><td>$${t.amount.toLocaleString()}</td><td>${t.note}</td></tr>`
    }).join("")}</tbody>
  </table>

  <script>window.onload = function() { window.print(); }</script>
</body></html>`

  printWindow.document.write(html)
  printWindow.document.close()
}
