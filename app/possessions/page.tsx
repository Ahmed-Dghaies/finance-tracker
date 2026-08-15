import { useEffect, useState } from "react";

import { Plus, Trash2, Pencil, PiggyBank, Banknote, ArrowRightLeft, RefreshCw } from "lucide-react";

import { PossessionForm, ExchangeForm } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCIES, COUNTRIES, getCountryFlag } from "@/lib/constants";
import {
  getAllExchanges,
  createExchange,
  updateExchange,
  deleteExchange,
  getCurrencyBalances,
  recalculateCurrencyBalances,
  addManualBalance,
  updateCurrencyBalanceById,
  deleteCurrencyBalance,
  updateBalanceExchangeRate,
} from "@/lib/db/exchanges";
import {
  getAllPossessions,
  createPossession,
  updatePossession,
  deletePossession,
} from "@/lib/db/possessions";
import { getSetting } from "@/lib/db/settings";
import { fetchExchangeRates, convertToEURWithFallback } from "@/lib/services/exchange-rates";

import type { Possession, CurrencyExchange, CurrencyBalance } from "@/lib/types";

export default function PossessionsPage() {
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [currencyExchanges, setCurrencyExchanges] = useState<CurrencyExchange[]>([]);
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalance[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [manualBalance, setManualBalance] = useState<{
    currency: string;
    amount: number;
    country: string;
  }>({
    currency: "EUR",
    amount: 0,
    country: "",
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPossession, setEditingPossession] = useState<Possession | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddExchangeOpen, setIsAddExchangeOpen] = useState(false);
  const [editingExchange, setEditingExchange] = useState<CurrencyExchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<CurrencyBalance | null>(null);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);

  const loadDataAndRefreshRates = async () => {
    const balances = await loadData();
    if (balances.length > 0) {
      await refreshExchangeRates(balances);
    }
  };

  const handleAddManualBalance = async (data: {
    currency: string;
    amount: number;
    country?: string;
  }) => {
    try {
      const eurEquivalent = await convertToEURWithFallback(data.amount, data.currency);
      await addManualBalance(data.currency, data.amount, eurEquivalent, data.country);
      await loadData();
      setIsAddBalanceOpen(false);
      setManualBalance({ currency: "EUR", amount: 0, country: "" });
    } catch (error) {
      console.error("Error adding manual balance:", error);
    }
  };

  const handleUpdateBalance = async (balance: CurrencyBalance) => {
    try {
      const eurEquivalent = await convertToEURWithFallback(balance.amount, balance.currency);
      await updateCurrencyBalanceById(balance.id, {
        currency: balance.currency,
        amount: balance.amount,
        eurEquivalent: eurEquivalent,
        country: balance.country,
      });
      await loadData();
      setEditingBalance(null);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleDeleteBalance = async (balanceId: string) => {
    try {
      await deleteCurrencyBalance(balanceId);
      await loadData();
    } catch (error) {
      console.error("Error deleting balance:", error);
    }
  };

  const refreshExchangeRates = async (balancesToRefresh?: CurrencyBalance[]) => {
    const balances = balancesToRefresh || currencyBalances;
    if (balances.length === 0) return;

    setIsRefreshingRates(true);
    try {
      const rates = await fetchExchangeRates();

      if (!rates) {
        console.warn("Could not fetch exchange rates");
        return;
      }

      const eurRate = rates["EUR"];

      for (const balance of balances) {
        if (balance.currency === "EUR") continue;

        const currencyRate = rates[balance.currency];
        if (currencyRate && eurRate) {
          const toEurRate = eurRate / currencyRate;
          const eurEquivalent = balance.amount * toEurRate;

          await updateBalanceExchangeRate(balance.id, toEurRate, eurEquivalent);
        }
      }

      await loadData();
      setLastRateUpdate(new Date());
    } catch (error) {
      console.error("Error refreshing exchange rates:", error);
    } finally {
      setIsRefreshingRates(false);
    }
  };

  const loadData = async (): Promise<CurrencyBalance[]> => {
    try {
      setLoading(true);
      const [possessionData, exchangeData, balanceData, currency] = await Promise.all([
        getAllPossessions(),
        getAllExchanges(),
        getCurrencyBalances(),
        getSetting("defaultCurrency"),
      ]);
      setPossessions(possessionData);
      setCurrencyExchanges(exchangeData);
      setCurrencyBalances(balanceData);
      setManualBalance((prev) => ({
        ...prev,
        currency: currency || "EUR",
      }));
      setDefaultCurrency(currency || "EUR");
      return balanceData;
    } catch (error) {
      console.error("Error loading possession data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAddPossession = async (possession: Omit<Possession, "id">) => {
    try {
      await createPossession(possession);
      await loadData();
      setIsAddOpen(false);
    } catch (error) {
      console.error("Error adding possession:", error);
    }
  };

  const handleUpdatePossession = async (updatedPossession: Possession) => {
    try {
      await updatePossession(updatedPossession.id, updatedPossession);
      await loadData();
      setEditingPossession(null);
    } catch (error) {
      console.error("Error updating possession:", error);
    }
  };

  const handleDeletePossession = async (possessionId: string) => {
    try {
      await deletePossession(possessionId);
      await loadData();
    } catch (error) {
      console.error("Error deleting possession:", error);
    }
  };

  const handleAddExchange = async (exchange: Omit<CurrencyExchange, "id">) => {
    try {
      await createExchange(exchange);
      await recalculateCurrencyBalances();
      await loadData();
      setIsAddExchangeOpen(false);
    } catch (error) {
      console.error("Error adding exchange:", error);
    }
  };

  const handleUpdateExchange = async (updatedExchange: CurrencyExchange) => {
    try {
      await updateExchange(updatedExchange.id, updatedExchange);
      await recalculateCurrencyBalances();
      await loadData();
      setEditingExchange(null);
    } catch (error) {
      console.error("Error updating exchange:", error);
    }
  };

  const handleDeleteExchange = async (exchangeId: string) => {
    try {
      await deleteExchange(exchangeId);
      await recalculateCurrencyBalances();
      await loadData();
    } catch (error) {
      console.error("Error deleting exchange:", error);
    }
  };

  useEffect(() => {
    loadDataAndRefreshRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return null;
  }

  const totalPurchasePrice = possessions.reduce((sum, pos) => sum + pos.purchasePrice, 0);
  const totalCurrentValue = possessions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalChange = totalCurrentValue - totalPurchasePrice;
  const totalChangePercentage =
    totalPurchasePrice > 0 ? (totalChange / totalPurchasePrice) * 100 : 0;

  const categories = Array.from(new Set(possessions.map((p) => p.category)));

  const possessionsByCategory = possessions.reduce(
    (acc, pos) => {
      acc[pos.category] = (acc[pos.category] || 0) + pos.currentValue;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance">Possessions</h1>
        <p className="text-muted-foreground">Track your possessions and foreign currency</p>
      </div>

      <Tabs defaultValue="foreign-money" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:max-w-md">
          <TabsTrigger value="foreign-money">
            <Banknote className="w-4 h-4 mr-2" />
            Foreign Money
          </TabsTrigger>
          <TabsTrigger value="possessions">
            <PiggyBank className="w-4 h-4 mr-2" />
            Possessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="possessions" className="mt-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Possession
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <PossessionForm onSubmit={handleAddPossession} defaultCurrency={defaultCurrency} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{possessions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Tracked possessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Purchase Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalPurchasePrice.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Original value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  €{totalCurrentValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Estimated worth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Value Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    totalChange >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {totalChange >= 0 ? "+" : ""}
                  {totalChangePercentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalChange >= 0 ? "+" : ""}€{totalChange.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {Object.keys(possessionsByCategory).length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Value by Category</CardTitle>
                <CardDescription>Possession distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(possessionsByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, value]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-lg font-semibold">€{value.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {categories.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-xs">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Your Possessions
              </CardTitle>
              <CardDescription>Manage your tracked possessions</CardDescription>
            </CardHeader>
            <CardContent>
              {possessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No possessions tracked yet.</p>
                  <p className="text-sm mt-1">Add your first possession to start tracking!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {possessions.map((possession) => {
                    const valueChange = possession.currentValue - possession.purchasePrice;
                    const valueChangePercentage =
                      possession.purchasePrice > 0
                        ? (valueChange / possession.purchasePrice) * 100
                        : 0;

                    return (
                      <div
                        key={possession.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-lg">{possession.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {possession.category}
                            </Badge>
                          </div>

                          <div className="mb-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-muted-foreground">Purchase Price</p>
                              <p className="font-medium">
                                {possession.currency} {possession.purchasePrice.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium">
                                {possession.currency} {possession.currentValue.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Change</p>
                              <p
                                className={`font-medium ${
                                  valueChange >= 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {valueChange >= 0 ? "+" : ""}
                                {possession.currency} {valueChange.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Change %</p>
                              <p
                                className={`font-medium ${
                                  valueChangePercentage >= 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {valueChangePercentage >= 0 ? "+" : ""}
                                {valueChangePercentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <span>Purchased: {possession.purchaseDate}</span>
                            {possession.notes && <span>Note: {possession.notes}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 self-start sm:ml-4 sm:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPossession(possession)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePossession(possession.id)}
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
        </TabsContent>

        <TabsContent value="foreign-money" className="mt-6">
          <div className="mb-6 flex items-center justify-end gap-2">
            <Dialog open={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manual Balance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Foreign Currency Balance</DialogTitle>
                  <DialogDescription>
                    Add foreign currency you already have without recording an exchange
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await handleAddManualBalance(manualBalance);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="balance-currency">Currency *</Label>
                    <Select
                      value={manualBalance.currency}
                      onValueChange={(e) => setManualBalance({ ...manualBalance, currency: e })}
                    >
                      <SelectTrigger id="balance-currency">
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
                    <Label htmlFor="balance-country">Country</Label>
                    <Select
                      value={manualBalance.country}
                      onValueChange={(e) => setManualBalance({ ...manualBalance, country: e })}
                    >
                      <SelectTrigger id="balance-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="balance-amount">Amount *</Label>
                    <Input
                      id="balance-amount"
                      type="number"
                      value={manualBalance.amount}
                      onChange={(e) =>
                        setManualBalance({
                          ...manualBalance,
                          amount: Number.parseFloat(e.target.value),
                        })
                      }
                      placeholder="e.g., 1600"
                      required
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    EUR equivalent will be calculated automatically using current exchange rates.
                  </p>

                  <Button type="submit" className="w-full">
                    Add Balance
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddExchangeOpen} onOpenChange={setIsAddExchangeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exchange
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <ExchangeForm onSubmit={handleAddExchange} defaultCurrency={defaultCurrency} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Current Foreign Currency Balances
                  </CardTitle>
                  <CardDescription>
                    Your available foreign cash
                    {lastRateUpdate && (
                      <span className="ml-2">
                        (rates updated: {lastRateUpdate.toLocaleTimeString()})
                      </span>
                    )}
                  </CardDescription>
                </div>
                {currencyBalances.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshExchangeRates()}
                    disabled={isRefreshingRates}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isRefreshingRates ? "animate-spin" : ""}`}
                    />
                    {isRefreshingRates ? "Refreshing..." : "Refresh Rates"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currencyBalances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Banknote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No foreign currency balances yet.</p>
                  <p className="text-sm mt-1">Add your first exchange to start tracking!</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {currencyBalances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCountryFlag(balance.country)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{balance.currency}</p>
                            {balance.country && (
                              <Badge variant="secondary" className="text-xs">
                                {balance.country}
                              </Badge>
                            )}
                          </div>
                          <p className="text-2xl font-bold">{balance.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ≈ €{balance.eurEquivalent.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBalance(balance)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBalance(balance.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Exchange History
              </CardTitle>
              <CardDescription>All your currency exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              {currencyExchanges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No exchanges recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currencyExchanges
                    .slice()
                    .sort((a, b) => {
                      const [dayA, monthA, yearA] = a.date.split("/").map(Number);
                      const [dayB, monthB, yearB] = b.date.split("/").map(Number);
                      const dateA = new Date(yearA, monthA - 1, dayA);
                      const dateB = new Date(yearB, monthB - 1, dayB);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((exchange) => (
                      <div
                        key={exchange.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-lg">
                              {exchange.fromCurrency} → {exchange.toCurrency}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {exchange.date}
                            </Badge>
                          </div>

                          <div className="mb-2 grid gap-2 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-muted-foreground">Paid</p>
                              <p className="font-medium">
                                {exchange.fromCurrency} {exchange.fromAmount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Received</p>
                              <p className="font-medium text-accent">
                                {exchange.toCurrency} {exchange.toAmount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rate</p>
                              <p className="font-medium">1 : {exchange.exchangeRate.toFixed(4)}</p>
                            </div>
                          </div>

                          {exchange.fee && (
                            <p className="text-xs text-muted-foreground">
                              Fee: {exchange.fromCurrency} {exchange.fee.toFixed(2)}
                            </p>
                          )}
                          {exchange.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: {exchange.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 self-start sm:ml-4 sm:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingExchange(exchange)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExchange(exchange.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingPossession && (
        <Dialog open={!!editingPossession} onOpenChange={() => setEditingPossession(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <PossessionForm
              onSubmit={handleUpdatePossession}
              defaultCurrency={defaultCurrency}
              initialData={editingPossession}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}

      {editingExchange && (
        <Dialog open={!!editingExchange} onOpenChange={() => setEditingExchange(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <ExchangeForm
              onSubmit={async (exchange: Omit<CurrencyExchange, "id">) => {
                await handleUpdateExchange({ ...exchange, id: editingExchange.id });
              }}
              defaultCurrency={defaultCurrency}
              initialData={editingExchange}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}

      {editingBalance && (
        <Dialog open={!!editingBalance} onOpenChange={() => setEditingBalance(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Currency Balance</DialogTitle>
              <DialogDescription>Update your foreign currency balance</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await handleUpdateBalance(editingBalance);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-currency">Currency *</Label>
                <Select
                  value={editingBalance.currency}
                  onValueChange={(e) => setEditingBalance({ ...editingBalance, currency: e })}
                >
                  <SelectTrigger id="edit-currency">
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
                <Label htmlFor="edit-country">Country</Label>
                <Select
                  value={editingBalance.country || ""}
                  onValueChange={(e) => setEditingBalance({ ...editingBalance, country: e })}
                >
                  <SelectTrigger id="edit-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingBalance.amount}
                  onChange={(e) =>
                    setEditingBalance({
                      ...editingBalance,
                      amount: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="e.g., 1600"
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground">
                EUR equivalent will be recalculated using current exchange rates.
              </p>

              <Button type="submit" className="w-full">
                Update Balance
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
