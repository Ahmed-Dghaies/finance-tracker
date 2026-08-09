import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateToDDMMYYYY } from "@/lib/utils";

import type { Investment } from "@/lib/types";

interface InvestmentFormProps {
  onSubmit: (investment: Omit<Investment, "id"> | Investment) => Promise<void>;
  defaultCurrency: string;
  initialData?: Investment;
  isEditing?: boolean;
}

export function InvestmentForm({
  onSubmit,
  defaultCurrency,
  initialData,
  isEditing = false,
}: InvestmentFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<Investment["type"]>(initialData?.type || "stocks");
  const [initialAmount, setInitialAmount] = useState(initialData?.initialAmount?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency);
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() || "");
  const [expectedYearlyPercentage, setExpectedYearlyPercentage] = useState(
    initialData?.expectedYearlyPercentage?.toString() || "",
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate || formatDateToDDMMYYYY(new Date()),
  );
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurringInvestment);
  const [recurringAmount, setRecurringAmount] = useState(
    initialData?.recurringInvestment?.amount?.toString() || "",
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    initialData?.recurringInvestment?.dayOfMonth?.toString() || "1",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const investment: Omit<Investment, "id"> & { id?: string } = {
      name,
      type,
      initialAmount: Number.parseFloat(initialAmount),
      currency,
      currentValue: currentValue ? Number.parseFloat(currentValue) : undefined,
      expectedYearlyPercentage: Number.parseFloat(expectedYearlyPercentage),
      startDate,
      recurringInvestment: isRecurring
        ? {
            amount: Number.parseFloat(recurringAmount),
            dayOfMonth: Number.parseInt(dayOfMonth),
          }
        : undefined,
    };

    if (isEditing && initialData) {
      investment.id = initialData.id;
    }

    onSubmit(investment);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Investment" : "Add New Investment"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update investment details" : "Enter the details of your investment"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Investment Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., S&P 500 ETF, Bitcoin, etc."
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Investment Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as Investment["type"])} required>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="bonds">Bonds</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="fixed-income">Fixed income</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="initialAmount">Initial Amount *</Label>
            <Input
              id="initialAmount"
              type="number"
              step="0.01"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
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
          <Label htmlFor="currentValue">Current Value (Optional)</Label>
          <Input
            id="currentValue"
            type="number"
            step="0.01"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Leave empty to use initial amount"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Manually override the current value if known
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="expectedYearlyPercentage">Expected Yearly % *</Label>
            <Input
              id="expectedYearlyPercentage"
              type="number"
              step="0.01"
              value={expectedYearlyPercentage}
              onChange={(e) => setExpectedYearlyPercentage(e.target.value)}
              placeholder="e.g., 7.5"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              required
            />
          </div>
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
            Recurring investment
          </Label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurringAmount">Monthly Amount *</Label>
              <Input
                id="recurringAmount"
                type="number"
                step="0.01"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(e.target.value)}
                required={isRecurring}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dayOfMonth">Day of Month *</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                required={isRecurring}
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          {isEditing ? "Update Investment" : "Add Investment"}
        </Button>
      </form>
    </>
  );
}
