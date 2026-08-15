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
import { cn, formatDateToDDMMYYYY } from "@/lib/utils";

import type { Income, IncomeType } from "@/lib/types";

interface IncomeFormProps {
  onSubmit: (updatedIncome: Income | Omit<Income, "id">) => Promise<void>;
  defaultCurrency: string;
  initialData?: Income;
  isEditing?: boolean;
}

function parseDDMMYYYY(dateStr: string): Date {
  return parse(dateStr, "dd/MM/yyyy", new Date());
}
export function IncomeForm({
  onSubmit,
  defaultCurrency,
  initialData,
  isEditing = false,
}: IncomeFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency);
  const [category, setCategory] = useState<IncomeType>(initialData?.category || "fixed");
  const [date, setDate] = useState<Date>(
    initialData?.date ? parseDDMMYYYY(initialData.date) : new Date(),
  );
  const [isRecurring, setIsRecurring] = useState(initialData?.recurring || false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    const income: Omit<Income, "id"> & { id?: string } = {
      amount: Number.parseFloat(amount),
      currency,
      category,
      date: formatDateToDDMMYYYY(date),
      recurring: isRecurring,
    };

    if (isEditing && initialData) {
      income.id = initialData.id;
    }

    onSubmit(income);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Income" : "Add New Income"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update income details" : "Enter the details of your income"}
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
          <Select value={category} onValueChange={(v) => setCategory(v as IncomeType)} required>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed (Salary)</SelectItem>
              <SelectItem value="variable">Variable (Freelance/Bonus)</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="selling">Selling</SelectItem>
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="recurring" className="cursor-pointer">
            Recurring monthly income
          </Label>
        </div>

        <Button type="submit" className="w-full">
          {isEditing ? "Update Income" : "Add Income"}
        </Button>
      </form>
    </>
  );
}
