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
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/constants";
import { formatDateToDDMMYYYY } from "@/lib/utils";

import type { Possession, CurrencyExchange } from "@/lib/types";

interface PossessionFormProps {
  onSubmit: (possession: Possession) => Promise<void>;
  defaultCurrency: string;
  initialData?: Possession;
  isEditing?: boolean;
}

export function PossessionForm({
  onSubmit,
  defaultCurrency,
  initialData,
  isEditing = false,
}: PossessionFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toString() || "");
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency);
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchaseDate || formatDateToDDMMYYYY(new Date()),
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const possession: any = {
        name,
        category,
        purchasePrice: Number.parseFloat(purchasePrice),
        currentValue: Number.parseFloat(currentValue),
        currency,
        purchaseDate,
        notes: notes || undefined,
      };

      if (isEditing && initialData) {
        possession.id = initialData.id;
      }

      await onSubmit(possession);

      // Reset form if not editing
      if (!isEditing) {
        setName("");
        setCategory("");
        setPurchasePrice("");
        setCurrentValue("");
        setPurchaseDate(formatDateToDDMMYYYY(new Date()));
        setNotes("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Possession" : "Add New Possession"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update possession details" : "Track a money-related possession"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Laptop, Watch, etc."
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Electronics, Jewelry, etc."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price *</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="currentValue">Current Value *</Label>
            <Input
              id="currentValue"
              type="number"
              step="0.01"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            type="text"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            placeholder="DD/MM/YYYY"
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Possession" : "Add Possession"}
        </Button>
      </form>
    </>
  );
}

interface ExchangeFormProps {
  onSubmit: (exchange: Omit<CurrencyExchange, "id"> | CurrencyExchange) => Promise<void>;
  defaultCurrency: string;
  initialData?: CurrencyExchange;
  isEditing?: boolean;
}

export function ExchangeForm({
  onSubmit,
  defaultCurrency,
  initialData,
  isEditing = false,
}: ExchangeFormProps) {
  const [date, setDate] = useState(initialData?.date || formatDateToDDMMYYYY(new Date()));
  const [fromCurrency, setFromCurrency] = useState(initialData?.fromCurrency || defaultCurrency);
  const [fromAmount, setFromAmount] = useState(initialData?.fromAmount?.toString() || "");
  const [toCurrency, setToCurrency] = useState(initialData?.toCurrency || "USD");
  const [toAmount, setToAmount] = useState(initialData?.toAmount?.toString() || "");
  const [fee, setFee] = useState(initialData?.fee?.toString() || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculate exchange rate when amounts change
  const exchangeRate =
    fromAmount && toAmount
      ? (Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)
      : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const exchange: any = {
        date,
        fromCurrency,
        fromAmount: Number.parseFloat(fromAmount),
        toCurrency,
        toAmount: Number.parseFloat(toAmount),
        exchangeRate: Number.parseFloat(exchangeRate),
        fee: fee ? Number.parseFloat(fee) : undefined,
        notes: notes || undefined,
      };

      if (isEditing && initialData) {
        exchange.id = initialData.id;
      }

      await onSubmit(exchange);

      // Reset form if not editing
      if (!isEditing) {
        setDate(formatDateToDDMMYYYY(new Date()));
        setFromAmount("");
        setToAmount("");
        setFee("");
        setNotes("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Exchange" : "Record Currency Exchange"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update exchange details" : "Enter the details of your currency exchange"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="DD/MM/YYYY"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromCurrency">From Currency *</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="fromCurrency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fromAmount">Amount Paid *</Label>
            <Input
              id="fromAmount"
              type="number"
              step="0.01"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="e.g., 1600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="toCurrency">To Currency *</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="toCurrency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="toAmount">Amount Received *</Label>
            <Input
              id="toAmount"
              type="number"
              step="0.01"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="e.g., 300000"
              required
            />
          </div>
        </div>

        {fromAmount && toAmount && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Exchange Rate: 1 {fromCurrency} = {exchangeRate} {toCurrency}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="fee">Fee (optional)</Label>
          <Input
            id="fee"
            type="number"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about the exchange"
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Exchange" : "Record Exchange"}
        </Button>
      </form>
    </>
  );
}
