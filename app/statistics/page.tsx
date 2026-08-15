import { BarChart3, Award, AlertCircle } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ExpensesChart from "@/components/dashboard/ExpensesChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import useExpenses from "@/hooks/use-expenses";
import useIncomes from "@/hooks/use-incomes";

export default function StatisticsPage() {
  const {
    state: { isLoading: isLoadingExpenses, allExpensesCategoryRanking, allExpenses },
  } = useExpenses();
  const {
    state: { isLoading: isLoadingIncome, allIncome },
  } = useIncomes();

  if (isLoadingExpenses || isLoadingIncome) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const monthlyData: Record<
    string,
    {
      income: number;
      expenses: number;
      savings: number;
      necessary: number;
      pleasure: number;
    }
  > = {};

  allExpenses.forEach((expense) => {
    const month = expense.date.split("/")[1] + "/" + expense.date.split("/")[2];
    if (!monthlyData[month]) {
      monthlyData[month] = {
        income: 0,
        expenses: 0,
        savings: 0,
        necessary: 0,
        pleasure: 0,
      };
    }
    monthlyData[month].expenses += expense.amount;
    if (expense.type === "necessary") {
      monthlyData[month].necessary += expense.amount;
    } else {
      monthlyData[month].pleasure += expense.amount;
    }
  });

  allIncome.forEach((inc) => {
    // date is DD/MM/YYYY
    const month = inc.date.split("/")[1] + "/" + inc.date.split("/")[2];
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0, savings: 0, necessary: 0, pleasure: 0 };
    }
    monthlyData[month].income += inc.amount;
  });

  Object.keys(monthlyData).forEach((month) => {
    monthlyData[month].savings = monthlyData[month].income - monthlyData[month].expenses;
  });

  const months = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split("/");
    const [monthB, yearB] = b.split("/");
    return (
      Number.parseInt(yearA) * 12 +
      Number.parseInt(monthA) -
      (Number.parseInt(yearB) * 12 + Number.parseInt(monthB))
    );
  });

  let bestIncomeMonth = { month: "", value: 0 };
  let bestSavingsMonth = { month: "", value: Number.NEGATIVE_INFINITY };
  let worstExpenseMonth = { month: "", value: 0 };

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  let totalNecessary = 0;
  let totalPleasure = 0;
  const monthsCount = months.length;

  months.forEach((monthKey) => {
    const data = monthlyData[monthKey];
    totalIncome += data.income;
    totalExpenses += data.expenses;
    totalSavings += data.savings;
    totalNecessary += data.necessary;
    totalPleasure += data.pleasure;

    if (data.income > bestIncomeMonth.value) {
      bestIncomeMonth = { month: monthKey, value: data.income };
    }

    if (data.savings > bestSavingsMonth.value) {
      bestSavingsMonth = { month: monthKey, value: data.savings };
    }

    if (data.expenses > worstExpenseMonth.value) {
      worstExpenseMonth = { month: monthKey, value: data.expenses };
    }
  });

  const averageIncome = monthsCount > 0 ? totalIncome / monthsCount : 0;
  const averageExpenses = monthsCount > 0 ? totalExpenses / monthsCount : 0;
  const averageSavings = monthsCount > 0 ? totalSavings / monthsCount : 0;

  const trendData = months.map((monthKey) => ({
    month: monthKey,
    income: monthlyData[monthKey].income,
    expenses: monthlyData[monthKey].expenses,
    savings: monthlyData[monthKey].savings,
  }));

  const necessaryRatio = totalExpenses > 0 ? (totalNecessary / totalExpenses) * 100 : 0;
  const pleasureRatio = totalExpenses > 0 ? (totalPleasure / totalExpenses) * 100 : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-balance">
          <BarChart3 className="h-8 w-8" />
          Statistics & Analytics
        </h1>
        <p className="text-muted-foreground">Insights and trends from your financial data</p>
      </div>

      {months.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No data available yet.</p>
            <p className="text-sm mt-1">Add some income and expenses to see your statistics!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  Best Income Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-accent sm:text-2xl">
                  €{bestIncomeMonth.value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{bestIncomeMonth.month}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-success" />
                  Best Savings Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-success sm:text-2xl">
                  €{bestSavingsMonth.value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{bestSavingsMonth.month}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Highest Expense Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive sm:text-2xl">
                  €{worstExpenseMonth.value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{worstExpenseMonth.month}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl font-bold sm:text-2xl ${
                    averageSavings >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  €{averageSavings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Over {monthsCount} months</p>
              </CardContent>
            </Card>
          </div>

          {/* Averages */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold sm:text-2xl">€{averageIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold sm:text-2xl">€{averageExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Necessary vs Pleasure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold sm:text-2xl">
                  {necessaryRatio.toFixed(0)}% / {pleasureRatio.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Spending ratio</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Charts */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle>Income & Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={54}
                        tickFormatter={(value) => value.split("/")[0]}
                      />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="var(--accent)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle>Savings Trend</CardTitle>
                <CardDescription>Monthly savings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={54}
                        tickFormatter={(value) => value.split("/")[0]}
                      />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="var(--success)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <ExpensesChart
            data={allExpensesCategoryRanking}
            title="Top Expense Categories (All Time)"
            description="Where your money goes the most"
          />
        </>
      )}
    </main>
  );
}
