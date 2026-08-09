"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import { getCurrencyBalances, updateBalanceExchangeRate } from "@/lib/db/exchanges";
import { fetchExchangeRates, FALLBACK_RATES_TO_EUR } from "@/lib/services/exchange-rates";

import type { CurrencyBalance } from "@/lib/types";

interface UseCurrencyBalancesOptions {
  autoRefreshRates?: boolean;
}

const useCurrencyBalances = (options: UseCurrencyBalancesOptions = {}) => {
  const { autoRefreshRates = true } = options;
  const [balances, setBalances] = useState<CurrencyBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);
  const [ratesAvailable, setRatesAvailable] = useState(false);
  const hasRefreshed = useRef(false);

  const loadBalances = useCallback(async () => {
    setIsLoading(true);
    hasRefreshed.current = false;
    try {
      const data = await getCurrencyBalances();
      setBalances(data);
      return data;
    } catch (error) {
      console.error("Error loading currency balances:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshExchangeRates = useCallback(
    async (currentBalances?: CurrencyBalance[]) => {
      const balancesToRefresh = currentBalances || balances;
      if (balancesToRefresh.length === 0) return;

      setIsRefreshing(true);
      try {
        const rates = await fetchExchangeRates();

        if (!rates) {
          console.warn("Could not fetch exchange rates, using fallback values");
          setRatesAvailable(false);

          // Use fallback rates for display
          const updatedBalances = balancesToRefresh.map((balance) => {
            const fallbackRate = FALLBACK_RATES_TO_EUR[balance.currency] || 1;
            return {
              ...balance,
              liveEurEquivalent: balance.amount * fallbackRate,
            };
          });
          setBalances(updatedBalances);
          return;
        }

        setRatesAvailable(true);
        const eurRate = rates["EUR"];
        const updatedBalances: CurrencyBalance[] = [];

        for (const balance of balancesToRefresh) {
          if (balance.currency === "EUR") {
            updatedBalances.push({
              ...balance,
              liveEurEquivalent: balance.amount,
              exchangeRate: 1,
            });
            continue;
          }

          const currencyRate = rates[balance.currency];
          if (currencyRate && eurRate) {
            // Calculate: how many EUR for 1 unit of this currency
            const toEurRate = eurRate / currencyRate;
            const liveEurEquivalent = balance.amount * toEurRate;

            updatedBalances.push({
              ...balance,
              liveEurEquivalent,
              exchangeRate: toEurRate,
            });

            // Update the database with new rate and EUR equivalent
            try {
              await updateBalanceExchangeRate(balance.id, toEurRate, liveEurEquivalent);
            } catch (error) {
              console.error(`Error updating exchange rate for ${balance.currency}:`, error);
            }
          } else {
            // Use fallback if rate not found
            const fallbackRate = FALLBACK_RATES_TO_EUR[balance.currency] || 1;
            updatedBalances.push({
              ...balance,
              liveEurEquivalent: balance.amount * fallbackRate,
            });
          }
        }

        setBalances(updatedBalances);
        setLastRateUpdate(new Date());
      } catch (error) {
        console.error("Error refreshing exchange rates:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [balances],
  );

  // Initial load and auto-refresh
  useEffect(() => {
    const init = async () => {
      const data = await loadBalances();
      if (autoRefreshRates && data.length > 0 && !hasRefreshed.current) {
        hasRefreshed.current = true;
        await refreshExchangeRates(data);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total EUR value
  const totalEurValue = balances.reduce((sum, balance) => {
    const eurValue = balance.liveEurEquivalent ?? balance.eurEquivalent;
    return sum + eurValue;
  }, 0);

  return {
    state: {
      balances,
      isLoading,
      isRefreshing,
      lastRateUpdate,
      ratesAvailable,
      totalEurValue,
    },
    handlers: {
      loadBalances,
      refreshExchangeRates: () => refreshExchangeRates(),
    },
  };
};

export default useCurrencyBalances;
