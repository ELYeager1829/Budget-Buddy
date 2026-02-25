"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  useBudgetStore,
  addTrackedExpense,
  updateTrackedExpense,
  deleteTrackedExpense,
  formatCurrency,
  getFilteredTrackedExpenses,
  type TrackedExpense,
  type BudgetItem,
} from "@/lib/budget-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"

function TrackingForm({
  budgetItems,
  editExpense,
  onClose,
}: {
  budgetItems: BudgetItem[]
  editExpense?: TrackedExpense
  onClose: () => void
}) {
  const isEditing = !!editExpense

  const [budgetItemId, setBudgetItemId] = useState(editExpense?.budget_item_id || "")
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || "")
  const [date, setDate] = useState(editExpense?.date || new Date().toISOString().split("T")[0])
  const [note, setNote] = useState(editExpense?.note || "")
  const [rank, setRank] = useState(editExpense?.tracked_rank?.toString() || "1")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!budgetItemId || !amount || !date) return

    const parsedDate = new Date(date + "T12:00:00")
    const data: Omit<TrackedExpense, "id"> = {
      budget_item_id: budgetItemId,
      amount: parseFloat(amount),
      tracked_rank: parseInt(rank) || 1,
      month_number: parsedDate.getMonth() + 1,
      date,
      note,
    }

    if (isEditing && editExpense) {
      updateTrackedExpense(editExpense.id, data)
    } else {
      addTrackedExpense(data)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="track-budget-item">Budget Item</Label>
        <Select value={budgetItemId} onValueChange={setBudgetItemId}>
          <SelectTrigger id="track-budget-item">
            <SelectValue placeholder="Select budget item" />
          </SelectTrigger>
          <SelectContent>
            {budgetItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} ({item.category}) - {formatCurrency(item.budget_amount)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="track-amount">Amount ($)</Label>
          <Input
            id="track-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="track-rank">Track Rank</Label>
          <Input
            id="track-rank"
            type="number"
            min="1"
            step="1"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="track-date">Date</Label>
        <Input
          id="track-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="track-note">Note</Label>
        <Input
          id="track-note"
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" className="mt-2 w-full">
        {isEditing ? "Save Changes" : "Record Expense"}
      </Button>
    </form>
  )
}

function TrackedRow({
  expense,
  budgetItem,
  budgetItems,
}: {
  expense: TrackedExpense
  budgetItem: BudgetItem | undefined
  budgetItems: BudgetItem[]
}) {
  const [editOpen, setEditOpen] = useState(false)

  const itemName = budgetItem?.name || "Unknown"
  const category = budgetItem?.category || "Other"
  const isIncome = budgetItem?.type === "income"

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
        #{expense.tracked_rank}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{itemName}</span>
          <Badge variant="secondary" className="shrink-0 text-xs">{category}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(expense.date + "T12:00:00"), "MMM d, yyyy")}</span>
          {expense.note && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{expense.note}</span>
            </>
          )}
        </div>
      </div>

      <span className={`text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-600" : "text-foreground"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(expense.amount)}
      </span>

      <div className="flex items-center gap-1">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setEditOpen(true)}
            aria-label="Edit tracked expense"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Tracked Expense</DialogTitle>
              <DialogDescription>Update this tracked expense.</DialogDescription>
            </DialogHeader>
            <TrackingForm
              budgetItems={budgetItems}
              editExpense={expense}
              onClose={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete tracked expense"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this record?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this tracked expense of {formatCurrency(expense.amount)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTrackedExpense(expense.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function ItemBudgetStatus({ item, trackedTotal }: { item: BudgetItem; trackedTotal: number }) {
  if (item.type === "income") return null
  const pct = item.budget_amount > 0 ? Math.min((trackedTotal / item.budget_amount) * 100, 100) : 0
  const isOver = trackedTotal > item.budget_amount

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOver ? (
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-sm font-medium text-foreground">{item.name}</span>
            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-semibold ${isOver ? "text-rose-500" : "text-foreground"}`}>
              {formatCurrency(trackedTotal)}
            </span>
            <span className="text-muted-foreground">/ {formatCurrency(item.budget_amount)}</span>
            {isOver && (
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-500">
                Over Budget
              </span>
            )}
          </div>
        </div>
        <Progress
          value={pct}
          className={`h-2 ${isOver ? "[&>[data-slot=progress-indicator]]:bg-rose-500" : "[&>[data-slot=progress-indicator]]:bg-emerald-500"}`}
        />
      </div>
    </div>
  )
}

export function BudgetTracking() {
  const store = useBudgetStore()
  const [addOpen, setAddOpen] = useState(false)

  const filteredTracked = useMemo(
    () => getFilteredTrackedExpenses(store),
    [store]
  )

  const itemTrackedTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of filteredTracked) {
      map.set(t.budget_item_id, (map.get(t.budget_item_id) || 0) + t.amount)
    }
    return map
  }, [filteredTracked])

  const expenseItems = useMemo(
    () => store.budgetItems.filter((i) => i.type === "expense"),
    [store.budgetItems]
  )

  const sortedTracked = useMemo(
    () => [...filteredTracked].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    [filteredTracked]
  )

  const overBudgetCount = useMemo(
    () => expenseItems.filter((i) => (itemTrackedTotals.get(i.id) || 0) > i.budget_amount).length,
    [expenseItems, itemTrackedTotals]
  )

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-foreground">Budget Status</CardTitle>
              <CardDescription>
                {overBudgetCount > 0
                  ? `${overBudgetCount} item${overBudgetCount !== 1 ? "s" : ""} over budget`
                  : "All items within budget"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {expenseItems.map((item) => (
              <ItemBudgetStatus
                key={item.id}
                item={item}
                trackedTotal={itemTrackedTotals.get(item.id) || 0}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-foreground">Tracked Expenses</CardTitle>
              <CardDescription>
                {store.trackedExpenses.length} record{store.trackedExpenses.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Record Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Expense</DialogTitle>
                  <DialogDescription>
                    Log actual spending against a budget item.
                  </DialogDescription>
                </DialogHeader>
                <TrackingForm budgetItems={store.budgetItems} onClose={() => setAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTracked.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">No tracked expenses yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedTracked.map((expense) => (
                <TrackedRow
                  key={expense.id}
                  expense={expense}
                  budgetItem={store.budgetItems.find((i) => i.id === expense.budget_item_id)}
                  budgetItems={store.budgetItems}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
