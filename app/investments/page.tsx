"use client";

import { useState } from "react";

import { Plus, Trash2, Pencil, Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useInvestments from "@/hooks/use-investments";
import useSettings from "@/hooks/use-settings";
import { Investment } from "@/lib/types";

import { InvestmentContributionForm } from "./InvestmentContributionForm";
import { InvestmentForm } from "./InvestmentForm";

export default function InvestmentsPage() {
  const {
    state: { investments, isLoading: investmentsLoading },
    handlers: {
      handleAddInvestment,
      handleUpdateInvestment,
      handleAddInvestmentContribution,
      handleDeleteInvestment,
      getAddedValuePerInvestment,
      getTotalInvestedPerInvestment,
    },
  } = useInvestments();
  const {
    state: { settings, isLoading: settingsLoading },
  } = useSettings();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [contributionInvestment, setContributionInvestment] = useState<Investment | null>(null);

  const defaultCurrency = settings?.defaultCurrency || "EUR";

  const isLoading = investmentsLoading || settingsLoading;

  const openContributionDialog = (investment: Investment) => {
    setContributionInvestment(investment);
  };

  const closeContributionDialog = () => {
    setContributionInvestment(null);
  };

  if (isLoading) {
    return null;
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + getTotalInvestedPerInvestment(inv),
    0,
  );
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + (inv.currentValue || getTotalInvestedPerInvestment(inv)),
    0,
  );
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const investmentsByType = investments.reduce(
    (acc, inv) => {
      const value = inv.currentValue || getTotalInvestedPerInvestment(inv);
      acc[inv.type] = (acc[inv.type] || 0) + value;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Investments</h1>
          <p className="mt-1 text-muted-foreground">Track your investment portfolio</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="sm:self-start">
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <InvestmentForm
              onSubmit={async (investment) => {
                await handleAddInvestment(investment);
                setIsAddOpen(false);
              }}
              defaultCurrency={defaultCurrency}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">€{totalInvested.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Initial investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-accent sm:text-2xl">
              €{totalCurrentValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold sm:text-2xl ${
                totalReturn >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              €{totalReturn.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profit/Loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Return %</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold sm:text-2xl ${
                totalReturnPercentage >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {totalReturnPercentage >= 0 ? "+" : ""}
              {totalReturnPercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(investmentsByType).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Breakdown</CardTitle>
            <CardDescription>Investment distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(investmentsByType).map(([type, value]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <span className="text-sm font-medium capitalize">{type.replace("-", " ")}</span>
                  <span className="text-lg font-semibold">€{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Your Investments
          </CardTitle>
          <CardDescription>Manage your investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Landmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No investments tracked yet.</p>
              <p className="text-sm mt-1">
                Add your first investment to start tracking your portfolio!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((investment) => {
                const totalInvestedPerInvestment = getTotalInvestedPerInvestment(investment);
                const returnAmount = getAddedValuePerInvestment(investment);
                const currentValue = investment.currentValue || totalInvestedPerInvestment;
                const returnPercentage =
                  totalInvestedPerInvestment > 0
                    ? (returnAmount / totalInvestedPerInvestment) * 100
                    : 0;
                const contributionsTotal = (investment.contributions || []).reduce(
                  (sum, contribution) => sum + contribution.amount,
                  0,
                );
                const contributionCount = investment.contributions?.length || 0;

                return (
                  <div
                    key={investment.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-lg">{investment.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {investment.type.replace("-", " ")}
                        </Badge>
                        {investment.recurringInvestment && (
                          <Badge variant="secondary" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                        {contributionCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {contributionCount} Contribution{contributionCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Invested so far</p>
                          <p className="font-medium">
                            {investment.currency} {totalInvestedPerInvestment.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium">
                            {investment.currency} {currentValue.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Return</p>
                          <p
                            className={`font-medium ${
                              returnAmount >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {returnAmount >= 0 ? "+" : ""}
                            {investment.currency} {returnAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Return %</p>
                          <p
                            className={`font-medium ${
                              returnPercentage >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {returnPercentage >= 0 ? "+" : ""}
                            {returnPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>Expected: {investment.expectedYearlyPercentage}% yearly</span>
                        {contributionCount > 0 && (
                          <span>
                            Contributions: {investment.currency} {contributionsTotal.toFixed(2)}
                          </span>
                        )}
                        {investment.recurringInvestment && (
                          <span>
                            Recurring: {investment.currency} {investment.recurringInvestment.amount}{" "}
                            on day {investment.recurringInvestment.dayOfMonth}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-start sm:ml-4 sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openContributionDialog(investment)}
                        aria-label={`Add contribution to ${investment.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingInvestment(investment)}
                        aria-label={`Edit ${investment.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInvestment(investment.id)}
                        aria-label={`Delete ${investment.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {editingInvestment && (
        <Dialog open={!!editingInvestment} onOpenChange={() => setEditingInvestment(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <InvestmentForm
              onSubmit={async (investment) => {
                await handleUpdateInvestment(investment as Investment);
                setEditingInvestment(null);
              }}
              defaultCurrency={defaultCurrency}
              initialData={editingInvestment}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}

      {contributionInvestment && (
        <Dialog open={!!contributionInvestment} onOpenChange={closeContributionDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <InvestmentContributionForm
              investmentName={contributionInvestment.name}
              onSubmit={async (contribution) => {
                await handleAddInvestmentContribution(contributionInvestment.id, contribution);
                closeContributionDialog();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
