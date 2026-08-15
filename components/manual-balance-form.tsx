"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type React from "react";

interface ManualBalanceFormProps {
  onSubmit: (data: { currency: string; amount: number; eurEquivalent: number }) => Promise<void>;
}

export function ManualBalanceForm({ onSubmit }: ManualBalanceFormProps) {
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [eurEquivalent, setEurEquivalent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currency || !amount) return;

    setSubmitting(true);
    try {
      await onSubmit({
        currency: currency.toUpperCase(),
        amount: Number.parseFloat(amount),
        eurEquivalent: eurEquivalent ? Number.parseFloat(eurEquivalent) : Number.parseFloat(amount),
      });
      setCurrency("");
      setAmount("");
      setEurEquivalent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency Code</Label>
        <Input
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          placeholder="JPY, USD, GBP..."
          maxLength={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eurEquivalent">EUR Equivalent (optional)</Label>
        <Input
          id="eurEquivalent"
          type="number"
          step="0.01"
          value={eurEquivalent}
          onChange={(e) => setEurEquivalent(e.target.value)}
          placeholder="Leave empty to use same value"
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Adding..." : "Add Balance"}
      </Button>
    </form>
  );
}
