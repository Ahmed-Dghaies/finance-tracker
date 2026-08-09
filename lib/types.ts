export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  type: "necessary" | "pleasure";
  date: string; // DD/MM/YYYY
  notes?: string;
  recurring?: {
    dayOfMonth: number;
  };
}

export type IncomeType = "fixed" | "variable" | "refund" | "one-time" | "selling";

export interface Income {
  id: string;
  amount: number;
  currency: string;
  category: IncomeType;
  date: string; // DD/MM/YYYY
  recurring?: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: "stocks" | "bonds" | "crypto" | "fixed-income" | "real-estate" | "other";
  initialAmount: number;
  currency: string;
  currentValue?: number;
  expectedYearlyPercentage: number;
  recurringInvestment?: {
    amount: number;
    dayOfMonth: number;
  };
  contributions?: InvestmentContribution[];
  startDate: string;
}

export interface InvestmentContribution {
  id: string;
  investmentId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Possession {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  purchaseDate: string;
  notes?: string;
}

export interface CurrencyBalance {
  id: string;
  currency: string;
  amount: number;
  eurEquivalent: number;
  country?: string;
  exchangeRate?: number;
  rateUpdatedAt?: string;
  liveEurEquivalent?: number;
}

export interface CurrencyExchange {
  id: string;
  date: string; // DD/MM/YYYY
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  exchangeRate: number;
  fee?: number;
  notes?: string;
}

export interface MonthlyData {
  month: string; // MM/YYYY
  expenses: Expense[];
  income: Income[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    netChange: number;
  };
}

export interface NetWorthGoal {
  targetValue: number;
  currentYear: number;
  currency: string;
}

export interface ProjectSettings {
  startingBalance: string;
  netWorthGoalYear: string;
  defaultCurrency: string;
  language: string;
  netWorthGoalValue: string;
  dateFormat: string;
}

export interface AppData {
  months: { [key: string]: MonthlyData };
  investments: Investment[];
  possessions: Possession[];
  currencyBalances: CurrencyBalance[];
  netWorthGoal?: NetWorthGoal;
  currencyExchanges: CurrencyExchange[];
  startingBalance?: number;
  settings: {
    defaultCurrency: string;
    dateFormat: string;
    language: string;
  };
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Leisure & Entertainment",
  "Utilities",
  "Health & Medical",
  "Subscriptions",
  "Shopping",
  "Rent",
  "Gifts & Donations",
  "Other",
] as const;

export type ExchangeRates = {
  [currency: string]: number; // Rate to EUR
  lastUpdated: number;
};
