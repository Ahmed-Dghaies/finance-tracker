import { FormEvent, useState } from "react";

import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSettings from "@/hooks/use-settings";

import type { NetWorthGoal } from "@/lib/types";

interface GoalTrackerDialogProps {
  currentGoal?: NetWorthGoal;
  children?: React.ReactNode;
}

export function GoalTrackerDialog({ currentGoal, children }: GoalTrackerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetValue, setTargetValue] = useState(currentGoal?.targetValue?.toString() || "");
  const [currentYear, setCurrentYear] = useState(
    currentGoal?.currentYear?.toString() || new Date().getFullYear().toString(),
  );
  const [currency, setCurrency] = useState(currentGoal?.currency || "EUR");
  const {
    handlers: { refetch: refetchSettings, updateSettingsKey },
  } = useSettings();

  const handleSaveGoal = async (e: FormEvent) => {
    try {
      e.preventDefault();

      const goal: NetWorthGoal = {
        targetValue: Number.parseFloat(targetValue),
        currentYear: Number.parseInt(currentYear),
        currency,
      };

      await updateSettingsKey("netWorthGoalValue", goal.targetValue.toString());
      await updateSettingsKey("netWorthGoalYear", goal.currentYear.toString());
      refetchSettings();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            {currentGoal ? "Update Goal" : "Set Goal"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentGoal ? "Update Net Worth Goal" : "Set Net Worth Goal"}</DialogTitle>
          <DialogDescription>Define your target net worth for the year</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetValue">Target Net Worth *</Label>
            <Input
              id="targetValue"
              type="number"
              step="0.01"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g., 50000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Target Year *</Label>
              <Select value={currentYear} onValueChange={setCurrentYear}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="TND">TND</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="YEN">YEN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {currentGoal ? "Update Goal" : "Set Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
