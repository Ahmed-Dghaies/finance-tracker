import { useEffect, useState } from "react";

import { Plus, Trash2, Pencil, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIncomeByMonth, createIncome, updateIncome, deleteIncome } from "@/lib/db/income";
import { getSetting } from "@/lib/db/settings";
import { Income } from "@/lib/types";
import { getMonthKey } from "@/lib/utils";

import { IncomeForm } from "./IncomeForm";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [monthOptions] = useState<string[]>(generateMonthOptions());

  function generateMonthOptions(): string[] {
    const options: string[] = [];
    const today = new Date();

    // Past 12 months
    for (let i = 12; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(getMonthKey(date));
    }

    // Future 12 months
    for (let i = 1; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      options.push(getMonthKey(date));
    }

    return options;
  }
  const loadData = async () => {
    try {
      setLoading(true);
      const [incomeData, currency] = await Promise.all([
        getIncomeByMonth(selectedMonth),
        getSetting("defaultCurrency"),
      ]);
      setIncomes(incomeData);
      setDefaultCurrency(currency || "EUR");
    } catch (error) {
      console.error("Error loading income data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const handleAddIncome = async (income: Omit<Income, "id">) => {
    try {
      await createIncome(income);
      await loadData();
      setIsAddOpen(false);
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const handleUpdateIncome = async (updatedIncome: Income | Omit<Income, "id">) => {
    if (!("id" in updatedIncome)) {
      return;
    }

    try {
      await updateIncome(updatedIncome.id, updatedIncome);
      await loadData();
      setEditingIncome(null);
    } catch (error) {
      console.error("Error updating income:", error);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      await deleteIncome(incomeId);
      await loadData();
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  if (loading) {
    return null;
  }

  const filteredIncomes = incomes.filter((income) => {
    const matchesCategory = filterCategory === "all" || income.category === filterCategory;
    return matchesCategory;
  });

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const fixedIncome = incomes
    .filter((i) => i.category === "fixed")
    .reduce((sum, inc) => sum + inc.amount, 0);
  const variableIncome = incomes
    .filter((i) => i.category === "variable")
    .reduce((sum, inc) => sum + inc.amount, 0);
  const otherIncome = incomes
    .filter((i) => i.category === "refund" || i.category === "one-time")
    .reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Income</h1>
          <p className="mt-1 text-muted-foreground">Track and manage your income sources</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="sm:self-start">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <IncomeForm onSubmit={handleAddIncome} defaultCurrency={defaultCurrency} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-accent sm:text-2xl">
              €{totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredIncomes.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fixed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">€{fixedIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Salary & regular income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">€{variableIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Freelance & bonuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Other</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">€{otherIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Refunds & one-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="mb-6">
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                <span className="flex items-center gap-2 text-base font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  Filter Income
                </span>
                <span className="text-sm text-muted-foreground">
                  {isFiltersOpen ? "Hide" : "Show"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <Label htmlFor="month-select">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fixed">Fixed Income</SelectItem>
                    <SelectItem value="variable">Variable Income</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                    <SelectItem value="one-time">One-time Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>View and manage your income sources</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No income found for this period.</p>
              <p className="text-sm mt-1">Add your first income to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium capitalize">
                        {income.category.replace("-", " ")}
                      </span>
                      {income.recurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{income.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <span className="text-lg font-semibold text-accent sm:text-xl">
                      {income.currency} {income.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      <Button variant="ghost" size="icon" onClick={() => setEditingIncome(income)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingIncome && (
        <Dialog open={!!editingIncome} onOpenChange={() => setEditingIncome(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <IncomeForm
              onSubmit={handleUpdateIncome}
              defaultCurrency={defaultCurrency}
              initialData={editingIncome}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
