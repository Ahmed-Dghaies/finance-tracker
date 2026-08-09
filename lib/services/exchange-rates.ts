// Exchange Rate Service using Open Exchange Rates API
// Free tier: 1000 requests/month, USD base currency only
// API Docs: https://docs.openexchangerates.org/

const OPEN_EXCHANGE_RATES_APP_ID = process.env.NEXT_PUBLIC_OPEN_EXCHANGE_RATES_APP_ID;
const BASE_URL = "https://openexchangerates.org/api";

interface ExchangeRatesResponse {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
  baseCurrency: string;
}

// Cache rates in memory for 1 hour to minimize API calls
let cachedRates: CachedRates | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch latest exchange rates from Open Exchange Rates API
 * Free tier only supports USD as base currency
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION_MS) {
    return cachedRates.rates;
  }

  if (!OPEN_EXCHANGE_RATES_APP_ID) {
    console.warn("NEXT_PUBLIC_OPEN_EXCHANGE_RATES_APP_ID not set. Using fallback rates.");
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/latest.json?app_id=${OPEN_EXCHANGE_RATES_APP_ID}&show_alternative=false`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data: ExchangeRatesResponse = await response.json();

    // Cache the rates
    cachedRates = {
      rates: data.rates,
      timestamp: Date.now(),
      baseCurrency: data.base,
    };

    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

/**
 * Convert an amount from one currency to EUR
 * Open Exchange Rates free tier uses USD as base, so we convert through USD
 */
export async function convertToEUR(amount: number, fromCurrency: string): Promise<number | null> {
  if (fromCurrency === "EUR") {
    return amount;
  }

  const rates = await fetchExchangeRates();
  if (!rates) {
    return null;
  }

  // rates are USD-based: rates[currency] = how many units of currency per 1 USD
  const fromRate = rates[fromCurrency];
  const eurRate = rates["EUR"];

  if (!fromRate || !eurRate) {
    console.error(`Missing rate for ${fromCurrency} or EUR`);
    return null;
  }

  // Convert: fromCurrency -> USD -> EUR
  // amount in fromCurrency / fromRate = amount in USD
  // amount in USD * eurRate = amount in EUR
  // But we want EUR, and eurRate is EUR per USD
  // So: (amount / fromRate) * eurRate... but this gives EUR per USD which is wrong
  // Actually: rates[EUR] = EUR per 1 USD, so to get EUR value:
  // amount_in_fromCurrency / rates[fromCurrency] = USD value
  // USD value / rates[EUR] = EUR value (since rates[EUR] = EUR per USD, we divide)
  // Wait, rates[EUR] means 1 USD = X EUR, so to get EUR: USD_amount * rates[EUR]
  
  const usdAmount = amount / fromRate;
  const eurAmount = usdAmount * eurRate;

  return eurAmount;
}

/**
 * Get the exchange rate from a currency to EUR
 */
export async function getEURRate(currency: string): Promise<number | null> {
  if (currency === "EUR") {
    return 1;
  }

  const rates = await fetchExchangeRates();
  if (!rates) {
    return null;
  }

  const currencyRate = rates[currency];
  const eurRate = rates["EUR"];

  if (!currencyRate || !eurRate) {
    return null;
  }

  // Rate from currency to EUR: (1 / currencyRate) * eurRate
  // This gives: how many EUR for 1 unit of currency
  return eurRate / currencyRate;
}

/**
 * Convert multiple currency amounts to EUR in a single call (efficient)
 */
export async function convertMultipleToEUR(
  amounts: Array<{ currency: string; amount: number }>
): Promise<Array<{ currency: string; amount: number; eurValue: number | null }>> {
  const rates = await fetchExchangeRates();

  return amounts.map(({ currency, amount }) => {
    if (currency === "EUR") {
      return { currency, amount, eurValue: amount };
    }

    if (!rates) {
      return { currency, amount, eurValue: null };
    }

    const currencyRate = rates[currency];
    const eurRate = rates["EUR"];

    if (!currencyRate || !eurRate) {
      return { currency, amount, eurValue: null };
    }

    const eurValue = (amount / currencyRate) * eurRate;
    return { currency, amount, eurValue };
  });
}

/**
 * Fallback rates for when API is unavailable (approximate rates)
 * These should only be used as a last resort
 */
export const FALLBACK_RATES_TO_EUR: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  JPY: 0.0061,
  CHF: 1.04,
  CAD: 0.68,
  AUD: 0.60,
  CNY: 0.13,
  KRW: 0.00067,
  THB: 0.026,
  MAD: 0.092,
  TRY: 0.028,
  TND: 0.30,
};

/**
 * Get EUR value with fallback to approximate rates
 */
export async function convertToEURWithFallback(
  amount: number,
  fromCurrency: string
): Promise<number> {
  const eurValue = await convertToEUR(amount, fromCurrency);
  if (eurValue !== null) {
    return eurValue;
  }

  // Use fallback rate
  const fallbackRate = FALLBACK_RATES_TO_EUR[fromCurrency] || 1;
  return amount * fallbackRate;
}
