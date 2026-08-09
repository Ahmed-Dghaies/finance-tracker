import type { Expense, Income, Investment, Possession, CurrencyExchange } from "@/lib/types";

const currentYear = new Date().getFullYear();
const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, "0");

export const mockExpenses: Expense[] = [
  {
    id: "1",
    amount: 50.0,
    category: "Food & Dining",
    date: `${currentYear}-${currentMonthNum}-01`,
    type: "necessary",
    currency: "EUR",
    notes: "Grocery shopping",
    recurring_day_of_month: 1,
  },
  {
    id: "2",
    amount: 20.0,
    category: "Transport",
    date: `${currentYear}-${currentMonthNum}-02`,
    type: "pleasure",
    currency: "EUR",
  },
] as any;

export const mockIncome: Income[] = [
  {
    id: "1",
    amount: 3500.0,
    currency: "EUR",
    category: "fixed",
    date: `${currentYear}-${currentMonthNum}-01`,
    recurring: true,
  },
  {
    id: "2",
    amount: 500.0,
    currency: "EUR",
    category: "variable",
    date: `${currentYear}-${currentMonthNum}-15`,
    recurring: false,
  },
  {
    id: "3",
    amount: 150.0,
    currency: "USD",
    category: "one-time",
    date: `${currentYear}-${currentMonthNum}-20`,
    recurring: false,
  },
];

export const mockInvestments: Investment[] = [
  {
    id: "1",
    name: "S&P 500 Index Fund",
    type: "stocks",
    initial_amount: 5000.0,
    currency: "EUR",
    current_value: 5250.0,
    expected_yearly_percentage: 8,
    recurring_amount: 200,
    recurring_day_of_month: 1,
    start_date: "2024-01-15",
  },
  {
    id: "2",
    name: "Bitcoin",
    type: "crypto",
    initial_amount: 1000.0,
    currency: "EUR",
    current_value: 1150.0,
    expected_yearly_percentage: 15,
    start_date: "2024-06-01",
  },
  {
    id: "3",
    name: "Apple Stock",
    type: "stocks",
    initial_amount: 2500.0,
    currency: "USD",
    current_value: 2700.0,
    expected_yearly_percentage: 10,
    start_date: "2024-03-10",
  },
] as any;

export const mockPossessions: Possession[] = [
  {
    id: "1",
    name: 'MacBook Pro 16"',
    category: "Electronics",
    purchase_price: 2500.0,
    current_value: 2000.0,
    currency: "EUR",
    purchase_date: "2023-06-15",
    notes: "Work laptop",
  },
  {
    id: "2",
    name: "Toyota Corolla 2020",
    category: "Vehicle",
    purchase_price: 22000.0,
    current_value: 18000.0,
    currency: "EUR",
    purchase_date: "2020-09-01",
  },
  {
    id: "3",
    name: "Rolex Submariner",
    category: "Jewelry",
    purchase_price: 8000.0,
    current_value: 9500.0,
    currency: "EUR",
    purchase_date: "2022-12-25",
    notes: "Birthday gift",
  },
] as any;

export const mockSettings = [
  {
    id: "1",
    key: "startingBalance",
    value: "10000",
  },
  {
    id: "2",
    key: "defaultCurrency",
    value: "EUR",
  },
  {
    id: "3",
    key: "language",
    value: "en",
  },
  {
    id: "4",
    key: "dateFormat",
    value: "DD/MM/YYYY",
  },
  {
    id: "5",
    key: "netWorthGoalValue",
    value: "100000",
  },
  {
    id: "6",
    key: "netWorthGoalYear",
    value: "2030",
  },
];

export const mockExchanges: CurrencyExchange[] = [
  {
    id: "1",
    date: "2024-12-01",
    fromCurrency: "USD",
    fromAmount: 1000.0,
    toCurrency: "EUR",
    toAmount: 920.0,
    exchangeRate: 0.92,
    fee: 5.0,
    notes: "Monthly conversion",
  },
  {
    id: "2",
    date: "2024-12-10",
    fromCurrency: "GBP",
    fromAmount: 500.0,
    toCurrency: "EUR",
    toAmount: 585.0,
    exchangeRate: 1.17,
  },
];
