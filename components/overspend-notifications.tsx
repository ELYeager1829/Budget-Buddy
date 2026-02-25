"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import {
  useBudgetStore,
  getOverspendingItems,
  formatCurrency,
  type OverspendingItem,
} from "@/lib/budget-store"

export function useOverspendNotifications() {
  const store = useBudgetStore()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const overspending = getOverspendingItems(store)

    for (const item of overspending) {
      if (!notifiedRef.current.has(item.itemId)) {
        notifiedRef.current.add(item.itemId)
        toast.error(`${item.itemName} is over budget`, {
          description: `Spent ${formatCurrency(item.tracked)} of ${formatCurrency(item.budgeted)} (${formatCurrency(item.overBy)} over)`,
          duration: 6000,
        })
      }
    }

    // Clear notifications for items no longer over budget
    const currentOverIds = new Set(overspending.map((o) => o.itemId))
    for (const id of notifiedRef.current) {
      if (!currentOverIds.has(id)) {
        notifiedRef.current.delete(id)
      }
    }
  }, [store])
}

export function OverspendBanner() {
  const store = useBudgetStore()
  const overspending = getOverspendingItems(store)

  if (overspending.length === 0) return null

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-semibold text-rose-800">
            {overspending.length} item{overspending.length !== 1 ? "s" : ""} over budget
          </p>
          <div className="flex flex-wrap gap-2">
            {overspending.map((item) => (
              <span
                key={item.itemId}
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700"
              >
                {item.itemName}
                <span className="text-rose-500">+{formatCurrency(item.overBy)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
