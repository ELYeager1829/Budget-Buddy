"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  type BudgetEntry,
  useBudgetEntries,
  deleteEntry,
} from "@/lib/budget-store"
import { EntryForm } from "@/components/entry-form"
import { Button } from "@/components/ui/button"
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
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Home,
  Bus,
  Clapperboard,
  Briefcase,
  Code,
  CircleDot,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils className="h-4 w-4" />,
  Rent: <Home className="h-4 w-4" />,
  Transport: <Bus className="h-4 w-4" />,
  Entertainment: <Clapperboard className="h-4 w-4" />,
  Salary: <Briefcase className="h-4 w-4" />,
  Freelance: <Code className="h-4 w-4" />,
  Other: <CircleDot className="h-4 w-4" />,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function EntryRow({ entry }: { entry: BudgetEntry }) {
  const [editOpen, setEditOpen] = useState(false)
  const isIncome = entry.type === "income"

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isIncome
            ? "bg-emerald-100 text-emerald-600"
            : "bg-primary/10 text-primary"
        }`}
      >
        {CATEGORY_ICONS[entry.category] || (
          <CircleDot className="h-4 w-4" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-card-foreground">
            {entry.description}
          </span>
          <Badge
            variant="secondary"
            className="shrink-0 text-xs"
          >
            {entry.category}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(entry.date + "T12:00:00"), "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-right">
          {isIncome ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          )}
          <span
            className={`font-semibold tabular-nums ${
              isIncome ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(entry.amount)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
              aria-label="Edit entry"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Entry</DialogTitle>
                <DialogDescription>
                  Update the details of this transaction.
                </DialogDescription>
              </DialogHeader>
              <EntryForm
                editEntry={entry}
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
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove &quot;{entry.description}&quot;
                  from your records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteEntry(entry.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

export function EntryList() {
  const entries = useBudgetEntries()

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet. Add your first entry above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
