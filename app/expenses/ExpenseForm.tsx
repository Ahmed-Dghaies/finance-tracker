"use client";

import { useState } from "react";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { cn, formatDateToDDMMYYYY } from "@/lib/utils";

import type { Expense } from "@/lib/types";

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id"> | Expense) => Promise<void>;
  defaultCurrency: string;
  initialData?: Expense;
  isEditing?: boolean;
}

function parseDDMMYYYY(dateStr: string): Date {
  return parse(dateStr, "dd/MM/yyyy", new Date());
}
export function ExpenseForm({
  onSubmit,
  defaultCurrency,
  initialData,
  isEditing = false,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency);
  const [category, setCategory] = useState(initialData?.category || "");
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState<"necessary" | "pleasure">(initialData?.type || "necessary");
  const [date, setDate] = useState<Date>(
    initialData?.date ? parseDDMMYYYY(initialData.date) : new Date(),
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring?.dayOfMonth);
  const [dayOfMonth, setDayOfMonth] = useState(
    initialData?.recurring?.dayOfMonth?.toString() || "1",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expense: Omit<Expense, "id"> & { id?: string } = {
      amount: Number.parseFloat(amount),
      currency,
      category: category === "custom" ? customCategory : category,
      type,
      date: formatDateToDDMMYYYY(date),
      notes: notes || undefined,
      recurring: isRecurring ? { dayOfMonth: Number.parseInt(dayOfMonth) } : undefined,
    };

    if (isEditing && initialData) {
      expense.id = initialData.id;
    }

    onSubmit(expense);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update expense details" : "Enter the details of your expense"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category === "custom" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="customCategory">Custom Category *</Label>
            <Input
              id="customCategory"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as "necessary" | "pleasure")}
            required
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="necessary">Necessary</SelectItem>
              <SelectItem value="pleasure">Pleasure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal hover:bg-secondary hover:text-foreground",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} autoFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="recurring" className="cursor-pointer">
            Recurring expense
          </Label>
        </div>

        {isRecurring && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="dayOfMonth">Day of Month *</Label>
            <Input
              id="dayOfMonth"
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          {isEditing ? "Update Expense" : "Add Expense"}
        </Button>
      </form>
    </>
  );
}
