"use client"

import { DashboardMetricsCards } from "@/components/dashboard-metrics"
import { BudgetVsTrackedChart } from "@/components/budget-vs-tracked-chart"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { TopCategories } from "@/components/top-categories"
import { BudgetPlanning } from "@/components/budget-planning"
import { BudgetTracking } from "@/components/budget-tracking"
import { SettingsPanel } from "@/components/settings-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, LayoutDashboard, ClipboardList, BarChart3, Settings } from "lucide-react"

export default function BudgetApp() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            BudgetBuddy
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <Tabs defaultValue="dashboard" className="flex flex-col gap-6">
          <TabsList className="w-full justify-start gap-1 overflow-x-auto">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="flex flex-col gap-6">
              <DashboardMetricsCards />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BudgetVsTrackedChart />
                <ExpensePieChart />
              </div>

              <TopCategories />
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <BudgetPlanning />
          </TabsContent>

          <TabsContent value="tracking">
            <BudgetTracking />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
