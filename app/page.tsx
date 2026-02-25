"use client"

import { BalanceSummary } from "@/components/balance-summary"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { EntryForm } from "@/components/entry-form"
import { EntryList } from "@/components/entry-list"
import { Wallet } from "lucide-react"

export default function BudgetDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              BudgetBuddy
            </h1>
          </div>
          <EntryForm />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8">
          <section aria-label="Financial summary">
            <BalanceSummary />
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <section
              className="lg:col-span-2"
              aria-label="Expense breakdown chart"
            >
              <ExpensePieChart />
            </section>

            <section
              className="lg:col-span-3"
              aria-label="Transaction history"
            >
              <EntryList />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
