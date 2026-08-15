import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateToDDMMYYYY } from "@/lib/utils";

import type { InvestmentContribution } from "@/lib/types";

interface InvestmentContributionFormProps {
  investmentName: string;
  onSubmit: (contribution: Omit<InvestmentContribution, "id" | "investmentId">) => Promise<void>;
}

export function InvestmentContributionForm({
  investmentName,
  onSubmit,
}: InvestmentContributionFormProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(formatDateToDDMMYYYY(new Date()));
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      amount: Number.parseFloat(amount),
      date,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Contribution</DialogTitle>
        <DialogDescription>Add an individual contribution to {investmentName}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contributionAmount">Amount *</Label>
            <Input
              id="contributionAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contributionDate">Date *</Label>
            <Input
              id="contributionDate"
              type="text"
              placeholder="DD/MM/YYYY"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contributionNotes">Notes (Optional)</Label>
          <Input
            id="contributionNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., extra monthly buy, bonus top-up"
          />
        </div>

        <Button type="submit" className="w-full">
          Add Contribution
        </Button>
      </form>
    </>
  );
}
