"use client"

import { useState, useMemo } from "react"
import {
  useBudgetStore,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  formatCurrency,
  ALL_CATEGORIES,
  type BudgetItem,
  type BudgetCategory,
  type ItemType,
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
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"

function BudgetItemForm({
  editItem,
  onClose,
}: {
  editItem?: BudgetItem
  onClose: () => void
}) {
  const isEditing = !!editItem

  const [name, setName] = useState(editItem?.name || "")
  const [type, setType] = useState<ItemType>(editItem?.type || "expense")
  const [category, setCategory] = useState<BudgetCategory | "">(editItem?.category || "")
  const [budgetAmount, setBudgetAmount] = useState(editItem?.budget_amount?.toString() || "")
  const [rank, setRank] = useState(editItem?.budget_rank?.toString() || "1")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !category || !budgetAmount) return

    const data = {
      name,
      type,
      category: category as BudgetCategory,
      is_cat: false,
      budget_amount: parseFloat(budgetAmount),
      budget_rank: parseInt(rank) || 1,
    }

    if (isEditing && editItem) {
      updateBudgetItem(editItem.id, data)
    } else {
      addBudgetItem(data)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="item-name">Item Name</Label>
        <Input
          id="item-name"
          placeholder="e.g., Groceries"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("expense")}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("income")}
          >
            Income
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-category">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as BudgetCategory)}>
          <SelectTrigger id="item-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget-amount">Budget Amount ($)</Label>
          <Input
            id="budget-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget-rank">Priority Rank</Label>
          <Input
            id="budget-rank"
            type="number"
            min="1"
            step="1"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="mt-2 w-full">
        {isEditing ? "Save Changes" : "Add Budget Item"}
      </Button>
    </form>
  )
}

function PlanningRow({ item }: { item: BudgetItem }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
        #{item.budget_rank}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
          <Badge variant="secondary" className="shrink-0 text-xs">{item.category}</Badge>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${item.type === "income" ? "border-emerald-300 text-emerald-600" : "border-primary/30 text-primary"}`}
          >
            {item.type}
          </Badge>
        </div>
      </div>

      <span className="text-sm font-semibold tabular-nums text-foreground">
        {formatCurrency(item.budget_amount)}
      </span>

      <div className="flex items-center gap-1">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setEditOpen(true)}
            aria-label="Edit item"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Budget Item</DialogTitle>
              <DialogDescription>Update budget item details.</DialogDescription>
            </DialogHeader>
            <BudgetItemForm editItem={item} onClose={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete budget item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove &quot;{item.name}&quot; and all its tracked expenses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteBudgetItem(item.id)}
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

export function BudgetPlanning() {
  const store = useBudgetStore()
  const [addOpen, setAddOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"rank" | "category" | "amount">("rank")

  const sorted = useMemo(() => {
    const items = [...store.budgetItems]
    if (sortBy === "rank") items.sort((a, b) => a.budget_rank - b.budget_rank)
    else if (sortBy === "category") items.sort((a, b) => a.category.localeCompare(b.category))
    else items.sort((a, b) => b.budget_amount - a.budget_amount)
    return items
  }, [store.budgetItems, sortBy])

  const totals = useMemo(() => {
    let expense = 0
    let income = 0
    for (const item of store.budgetItems) {
      if (item.type === "expense") expense += item.budget_amount
      else income += item.budget_amount
    }
    return { expense, income, net: income - expense }
  }, [store.budgetItems])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Planned Income</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.income)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Planned Expenses</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totals.expense)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Net Planned</p>
            <p className={`text-xl font-bold ${totals.net >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {formatCurrency(totals.net)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-foreground">Budget Items</CardTitle>
              <CardDescription>
                {store.budgetItems.length} item{store.budgetItems.length !== 1 ? "s" : ""} planned
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-36">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">By Rank</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                  <SelectItem value="amount">By Amount</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Budget Item</DialogTitle>
                    <DialogDescription>Plan a new income or expense item.</DialogDescription>
                  </DialogHeader>
                  <BudgetItemForm onClose={() => setAddOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">No budget items yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((item) => (
                <PlanningRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
