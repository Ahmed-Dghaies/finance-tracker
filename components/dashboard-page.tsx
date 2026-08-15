import { useState } from "react";

import { Calendar, DollarSign, Plus, Target, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import ExpensesChart from "@/components/dashboard/ExpensesChart";
import { GoalTrackerDialog } from "@/components/dashboard/GoalTrackerDialog";
import IncomeByCategoryChart from "@/components/dashboard/IncomeByCategoryChart";
import StartingBalanceDialog from "@/components/dashboard/StartingBalanceDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCurrencyBalances from "@/hooks/use-currency-balances";
import useExpenses from "@/hooks/use-expenses";
import useIncomes from "@/hooks/use-incomes";
import useInvestments from "@/hooks/use-investments";
import usePossessions from "@/hooks/use-possessions";
import useSettings from "@/hooks/use-settings";
import { getMonthKey } from "@/lib/utils";

import type { NetWorthGoal } from "@/lib/types";

export function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey(new Date()));
  const {
    state: {
      expenses,
      totalExpenses,
      currentMonthExpensesTotal,
      expensesCategoryRanking,
      necessaryExpenses,
      pleasureExpenses,
      isLoading: expensesLoading,
    },
  } = useExpenses({ defaultValues: { selectedMonth } });
  const {
    state: { incomes, totalIncome, currentMonthIncomeTotal, isLoading: incomesLoading },
  } = useIncomes({ defaultValues: { selectedMonth } });
  const {
    state: { possessions, isLoading: possessionsLoading },
  } = usePossessions();
  const {
    state: { investmentsValue, isLoading: investmentsLoading },
  } = useInvestments();
  const {
    state: { settings, isLoading: settingsLoading },
  } = useSettings();
  const {
    state: { totalEurValue: foreignCurrencyValue, isLoading: currencyBalancesLoading },
  } = useCurrencyBalances();

  const startingBalance = parseFloat(settings?.startingBalance || "0");
  const netWorthGoal: NetWorthGoal = {
    targetValue: parseFloat(settings?.netWorthGoalValue || "0"),
    currentYear: parseInt(settings?.netWorthGoalYear || "2026"),
    currency: settings?.defaultCurrency || "EUR",
  };

  const loading =
    expensesLoading ||
    incomesLoading ||
    possessionsLoading ||
    investmentsLoading ||
    settingsLoading ||
    currencyBalancesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalSavings = totalIncome - totalExpenses;
  const currentMonthSavings = currentMonthIncomeTotal - currentMonthExpensesTotal;

  const possessionsValue = possessions.reduce((sum, pos) => sum + Number(pos.currentValue), 0);
  const netWorth =
    startingBalance + investmentsValue + possessionsValue + foreignCurrencyValue + totalSavings;

  const goalProgress = netWorthGoal ? (netWorth / netWorthGoal.targetValue) * 100 : 0;

  const requiredMonthlySavings = netWorthGoal
    ? (netWorthGoal.targetValue - netWorth) / (12 - new Date().getMonth())
    : 0;

  const typeData = [
    { name: "Necessary", value: necessaryExpenses },
    { name: "Pleasure", value: pleasureExpenses },
  ].filter((entry) => entry.value > 0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Private finance workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Financial Overview</h1>
            <p className="text-muted-foreground">
              Track your income, expenses, and net worth progress
            </p>
          </div>

          <div className="flex gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <StartingBalanceDialog balance={startingBalance} />

            <div className="flex w-full flex-row items-center gap-2 sm:w-60">
              <Label htmlFor="month-select" className="block text-sm">
                <Calendar className="mr-1 inline h-4 w-4" />
                Select Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={selectedMonth}>{selectedMonth}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="total-income">
                €{currentMonthIncomeTotal.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{incomes.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="total-expenses">
                €{currentMonthExpensesTotal.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{expenses.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  currentMonthSavings >= 0 ? "text-success" : "text-destructive"
                }`}
                aria-label="monthly-savings"
              >
                €{currentMonthSavings.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentMonthSavings >= 0 ? "Positive" : "Negative"} balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="net-worth">
                €{netWorth.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {startingBalance > 0
                  ? `Includes €${startingBalance.toFixed(2)} starting balance`
                  : "Total assets value"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Net Worth Goal Progress</CardTitle>
                {netWorthGoal && (
                  <CardDescription>
                    Target: €{netWorthGoal.targetValue.toFixed(2)} by end of{" "}
                    {netWorthGoal.currentYear}
                  </CardDescription>
                )}
              </div>
              <GoalTrackerDialog currentGoal={netWorthGoal || undefined} />
            </div>
          </CardHeader>
          <CardContent>
            {netWorthGoal ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Progress</span>
                    {goalProgress > 0 && (
                      <span className="font-medium">{goalProgress.toFixed(1)}%</span>
                    )}
                  </div>
                  <Progress value={Math.min(goalProgress, 100)} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>€{netWorth.toFixed(2)}</span>
                    <span>€{netWorthGoal.targetValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Required Monthly Savings</p>
                    <p className="text-lg font-semibold" aria-label="required-monthly-savings">
                      €{Math.max(0, requiredMonthlySavings).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Current Monthly Savings</p>
                    <p className="text-lg font-semibold" aria-label="current-monthly-savings">
                      €{currentMonthSavings.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Status</p>
                    <p
                      className={`text-lg font-semibold ${
                        currentMonthSavings >= requiredMonthlySavings
                          ? "text-success"
                          : "text-destructive"
                      }`}
                      aria-label="net-worth-goal-status"
                    >
                      {currentMonthSavings >= requiredMonthlySavings ? "On Track" : "Behind"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Target className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="mb-2">No net worth goal set yet</p>
                <p className="mb-4 text-sm">Set a goal to track your progress and stay motivated</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeByCategoryChart selectedMonth={selectedMonth} />

          {typeData.length > 0 && (
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle>Expense Type Distribution</CardTitle>
                <CardDescription>Necessary vs pleasure spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <ExpensesChart data={expensesCategoryRanking} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                asChild
                variant="outline"
                className="h-auto justify-start bg-transparent py-4"
              >
                <Link href="/expenses">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto justify-start bg-transparent py-4"
              >
                <Link href="/income">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto justify-start bg-transparent py-4"
              >
                <Link href="/investments">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Investment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default DashboardPage;
