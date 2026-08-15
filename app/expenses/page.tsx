import { useState } from "react";

import { Plus, Trash2, Pencil, Filter } from "lucide-react";

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
import useExpenses from "@/hooks/use-expenses";
import { Expense, EXPENSE_CATEGORIES } from "@/lib/types";
import { getMonthKey } from "@/lib/utils";

import { ExpenseForm } from "./ExpenseForm";

export default function ExpensesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "necessary" | "pleasure">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [monthOptions] = useState<string[]>(generateMonthOptions());

  const {
    state: { isLoading, expenses, selectedMonth },
    actions: {
      copyRecurringExpenses,
      handleMonthChange,
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense,
    },
  } = useExpenses();

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

  const handleExpenseFormSubmit = async (expense: Expense | Omit<Expense, "id">) => {
    if ("id" in expense) {
      handleUpdateExpense(expense)
        .then(() => setEditingExpense(null))
        .catch(() => {
          console.error("Error updating expense");
        });
    } else {
      handleAddExpense(expense)
        .then(() => setIsAddOpen(false))
        .catch(() => {
          console.error("Error adding expense");
        });
    }
  };

  const handleExpenseDelete = async (expenseId: string) => {
    handleDeleteExpense(expenseId).catch(() => {
      console.error("Error deleting expense");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const hasRecurringExpenses = expenses.some((exp) => exp.recurring);

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    const matchesType = filterType === "all" || expense.type === filterType;
    return matchesCategory && matchesType;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const necessaryExpenses = expenses
    .filter((e) => e.type === "necessary")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pleasureExpenses = expenses
    .filter((e) => e.type === "pleasure")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Expenses</h1>
          <p className="mt-1 text-muted-foreground">Track and manage your spending</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button aria-label="open-add-expense-form" className="sm:self-start">
              <Plus className="mr-2 h-4 w-4" />
              Add expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <ExpenseForm onSubmit={handleExpenseFormSubmit} defaultCurrency="EUR" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl" aria-label="total-expenses">
              €{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Necessary</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-xl font-bold text-muted-foreground sm:text-2xl"
              aria-label="necessary-expenses"
            >
              €{necessaryExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((necessaryExpenses / (necessaryExpenses + pleasureExpenses || 1)) * 100).toFixed(0)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pleasure</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-xl font-bold text-accent sm:text-2xl"
              aria-label="pleasure-expenses"
            >
              €{pleasureExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((pleasureExpenses / (necessaryExpenses + pleasureExpenses || 1)) * 100).toFixed(0)}%
              of total
            </p>
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
                  <Filter className="h-4 w-4" />
                  Filters
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
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
                    <SelectItem value="all">All categories</SelectItem>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                  <SelectTrigger id="type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="necessary">Necessary</SelectItem>
                    <SelectItem value="pleasure">Pleasure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Expenses List */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <span className="flex flex-col gap-2">
              <CardTitle>Expense history</CardTitle>
              <CardDescription>View and manage your expenses</CardDescription>
            </span>
            {!hasRecurringExpenses && (
              <Button aria-label="open-add-expense-form" onClick={copyRecurringExpenses}>
                <Plus className="w-4 h-4 mr-2" />
                Copy recurring expenses
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No expenses found for this period.</p>
              <p className="text-sm mt-1">Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  aria-label={`expense-item-${index}`}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium">{expense.category}</span>
                      <Badge
                        variant={expense.type === "necessary" ? "secondary" : "outline"}
                        className="text-xs"
                        aria-label={`expense-type-${expense.type}`}
                      >
                        {expense.type}
                      </Badge>
                      {expense.recurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{expense.date}</span>
                      {expense.notes && <span>• {expense.notes}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <span className="text-lg font-semibold sm:text-xl">
                      {expense.currency} {Number(expense.amount).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingExpense(expense)}
                        aria-label={`edit-expense-${index}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExpenseDelete(expense.id)}
                        aria-label={`delete-expense-${index}`}
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
      {editingExpense && (
        <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <ExpenseForm
              onSubmit={handleExpenseFormSubmit}
              defaultCurrency="EUR"
              initialData={editingExpense}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
