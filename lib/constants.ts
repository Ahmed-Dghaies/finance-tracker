// Centralized currency and country options
// Single source of truth: each country must have a currency

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

// Define all countries with their currencies - adding a country requires specifying its currency
const COUNTRY_CONFIG = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "THB" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", currency: "MAD" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", currency: "TND" },
] as const satisfies readonly CountryConfig[];

// Derive currencies from country config (unique values)
const uniqueCurrencies = [...new Set(COUNTRY_CONFIG.map((c) => c.currency))];
export const CURRENCIES = uniqueCurrencies.map((currency) => ({
  value: currency,
  label: currency,
}));

// Derive countries for dropdowns
export const COUNTRIES = COUNTRY_CONFIG.map((c) => ({
  value: c.code,
  label: `${c.flag} ${c.name}`,
  flag: c.flag,
  currency: c.currency,
}));

// Map of country codes to flags for quick lookup
export const COUNTRY_FLAGS: Record<string, string> = Object.fromEntries(
  COUNTRY_CONFIG.map((c) => [c.code, c.flag]),
);

// Map of country codes to currencies
export const COUNTRY_CURRENCIES: Record<string, string> = Object.fromEntries(
  COUNTRY_CONFIG.map((c) => [c.code, c.currency]),
);

// Helper to get flag by country code, with fallback
export function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return "🌍";
  return COUNTRY_FLAGS[countryCode] || "🌍";
}

// Helper to get currency by country code
export function getCurrencyByCountry(countryCode: string): string | undefined {
  return COUNTRY_CURRENCIES[countryCode];
}

// Type exports for use in components
export type CountryCode = (typeof COUNTRY_CONFIG)[number]["code"];
export type CurrencyCode = (typeof COUNTRY_CONFIG)[number]["currency"];
