"use client"

import { useState } from "react"
import {
  type BudgetEntry,
  type EntryType,
  type Category,
  addEntry,
  updateEntry,
  getCategoriesForType,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface EntryFormProps {
  editEntry?: BudgetEntry
  onClose?: () => void
  triggerButton?: React.ReactNode
}

export function EntryForm({ editEntry, onClose, triggerButton }: EntryFormProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!editEntry

  const [type, setType] = useState<EntryType>(editEntry?.type || "expense")
  const [amount, setAmount] = useState(editEntry?.amount?.toString() || "")
  const [description, setDescription] = useState(editEntry?.description || "")
  const [category, setCategory] = useState<Category | "">(
    editEntry?.category || ""
  )
  const [date, setDate] = useState(
    editEntry?.date || new Date().toISOString().split("T")[0]
  )

  const categories = getCategoriesForType(type)

  function handleTypeChange(newType: EntryType) {
    setType(newType)
    const newCategories = getCategoriesForType(newType)
    if (category && !newCategories.includes(category as Category)) {
      setCategory("")
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !description || !category || !date) return

    const entryData = {
      type,
      amount: parseFloat(amount),
      description,
      category: category as Category,
      date,
    }

    if (isEditing && editEntry) {
      updateEntry(editEntry.id, entryData)
    } else {
      addEntry(entryData)
    }

    if (!isEditing) {
      setAmount("")
      setDescription("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
    }

    setOpen(false)
    onClose?.()
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="entry-type">Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleTypeChange("expense")}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleTypeChange("income")}
          >
            Income
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
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
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(val) => setCategory(val as Category)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="mt-2 w-full">
        {isEditing ? "Save Changes" : "Add Entry"}
      </Button>
    </form>
  )

  if (isEditing) {
    return formContent
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
          <DialogDescription>
            Record an income or expense to track your budget.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
