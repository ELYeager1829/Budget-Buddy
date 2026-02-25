import { useSyncExternalStore } from "react"

export type EntryType = "income" | "expense"

export type Category =
  | "Food"
  | "Rent"
  | "Transport"
  | "Entertainment"
  | "Salary"
  | "Freelance"
  | "Other"

export interface BudgetEntry {
  id: string
  type: EntryType
  amount: number
  description: string
  category: Category
  date: string
}

const EXPENSE_CATEGORIES: Category[] = [
  "Food",
  "Rent",
  "Transport",
  "Entertainment",
  "Other",
]

const INCOME_CATEGORIES: Category[] = ["Salary", "Freelance", "Other"]

export function getCategoriesForType(type: EntryType): Category[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

// Simple external store for sharing state
let entries: BudgetEntry[] = [
  {
    id: "1",
    type: "income",
    amount: 4500,
    description: "Monthly Salary",
    category: "Salary",
    date: "2026-02-01",
  },
  {
    id: "2",
    type: "expense",
    amount: 1200,
    description: "Apartment rent",
    category: "Rent",
    date: "2026-02-01",
  },
  {
    id: "3",
    type: "expense",
    amount: 320,
    description: "Groceries & dining",
    category: "Food",
    date: "2026-02-05",
  },
  {
    id: "4",
    type: "expense",
    amount: 85,
    description: "Metro pass",
    category: "Transport",
    date: "2026-02-03",
  },
  {
    id: "5",
    type: "expense",
    amount: 60,
    description: "Movie night & streaming",
    category: "Entertainment",
    date: "2026-02-10",
  },
  {
    id: "6",
    type: "income",
    amount: 750,
    description: "Freelance project",
    category: "Freelance",
    date: "2026-02-12",
  },
  {
    id: "7",
    type: "expense",
    amount: 150,
    description: "Weekly groceries",
    category: "Food",
    date: "2026-02-15",
  },
]

let listeners: (() => void)[] = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getSnapshot() {
  return entries
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function addEntry(entry: Omit<BudgetEntry, "id">) {
  entries = [...entries, { ...entry, id: crypto.randomUUID() }]
  emitChange()
}

export function updateEntry(id: string, update: Partial<BudgetEntry>) {
  entries = entries.map((e) => (e.id === id ? { ...e, ...update } : e))
  emitChange()
}

export function deleteEntry(id: string) {
  entries = entries.filter((e) => e.id !== id)
  emitChange()
}

export function useBudgetEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
