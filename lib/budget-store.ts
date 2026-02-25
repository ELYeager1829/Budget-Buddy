import { useSyncExternalStore } from "react"

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
