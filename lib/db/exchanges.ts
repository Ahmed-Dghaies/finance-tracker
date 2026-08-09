import { createClient } from "../supabase/client";

import type { CurrencyBalance, CurrencyExchange } from "@/lib/types";

export async function addManualBalance(
  currency: string,
  amount: number,
  eurEquivalent: number,
  country?: string
) {
  await createCurrencyBalance(currency, amount, eurEquivalent, country);
}

export async function getAllExchanges(): Promise<CurrencyExchange[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("currency_exchanges")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    date: formatDate(row.date),
    fromCurrency: row.from_currency,
    fromAmount: Number(row.from_amount),
    toCurrency: row.to_currency,
    toAmount: Number(row.to_amount),
    exchangeRate: Number(row.exchange_rate),
    fee: row.fee ? Number(row.fee) : undefined,
    notes: row.notes,
  }));
}

export async function createExchange(exchange: Omit<CurrencyExchange, "id">) {
  const supabase = createClient();

  // Insert the exchange
  const { data, error } = await supabase
    .from("currency_exchanges")
    .insert({
      date: parseDate(exchange.date),
      from_currency: exchange.fromCurrency,
      from_amount: exchange.fromAmount,
      to_currency: exchange.toCurrency,
      to_amount: exchange.toAmount,
      exchange_rate: exchange.exchangeRate,
      fee: exchange.fee,
      notes: exchange.notes,
    })
    .select()
    .single();

  if (error) throw error;

  // Update currency balances
  await updateCurrencyBalance(exchange.toCurrency, exchange.toAmount, exchange.toAmount);

  return data;
}

export async function updateExchange(id: string, exchange: Partial<CurrencyExchange>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("currency_exchanges")
    .update({
      date: exchange.date ? parseDate(exchange.date) : undefined,
      from_currency: exchange.fromCurrency,
      from_amount: exchange.fromAmount,
      to_currency: exchange.toCurrency,
      to_amount: exchange.toAmount,
      exchange_rate: exchange.exchangeRate,
      fee: exchange.fee,
      notes: exchange.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteExchange(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("currency_exchanges").delete().eq("id", id);
  if (error) throw error;
}

export async function getCurrencyBalances(): Promise<CurrencyBalance[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("currency_balances").select("*").order("currency");

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    currency: row.currency,
    amount: Number(row.amount),
    eurEquivalent: Number(row.eur_equivalent),
    country: row.country,
    exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : undefined,
    rateUpdatedAt: row.rate_updated_at,
  }));
}

export async function updateCurrencyBalanceById(
  id: string,
  data: {
    currency?: string;
    amount?: number;
    eurEquivalent?: number;
    country?: string;
    exchangeRate?: number;
    rateUpdatedAt?: string;
  }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("currency_balances")
    .update({
      currency: data.currency,
      amount: data.amount,
      eur_equivalent: data.eurEquivalent,
      country: data.country,
      exchange_rate: data.exchangeRate,
      rate_updated_at: data.rateUpdatedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateBalanceExchangeRate(
  id: string,
  exchangeRate: number,
  eurEquivalent: number
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("currency_balances")
    .update({
      exchange_rate: exchangeRate,
      eur_equivalent: eurEquivalent,
      rate_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCurrencyBalance(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("currency_balances").delete().eq("id", id);
  if (error) throw error;
}

export async function updateCurrencyBalance(
  currency: string,
  amount: number,
  eurEquivalent: number,
  country?: string
) {
  const supabase = createClient();

  // Check if balance exists
  const { data: existing } = await supabase
    .from("currency_balances")
    .select("*")
    .eq("currency", currency)
    .single();

  if (existing) {
    // Update existing balance
    const { error } = await supabase
      .from("currency_balances")
      .update({
        amount: Number(existing.amount) + amount,
        eur_equivalent: Number(existing.eur_equivalent) + eurEquivalent,
        country: country || existing.country,
        updated_at: new Date().toISOString(),
      })
      .eq("currency", currency);

    if (error) throw error;
  } else {
    // Create new balance
    const { error } = await supabase.from("currency_balances").insert({
      currency,
      amount,
      eur_equivalent: eurEquivalent,
      country,
    });

    if (error) throw error;
  }
}

export async function createCurrencyBalance(
  currency: string,
  amount: number,
  eurEquivalent: number,
  country?: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("currency_balances").insert({
    currency,
    amount,
    eur_equivalent: eurEquivalent,
    country,
  });

  if (error) throw error;
}

export async function recalculateCurrencyBalances() {
  const supabase = createClient();

  // Get all exchanges
  const { data: exchanges } = await supabase.from("currency_exchanges").select("*").order("date");

  if (!exchanges) return;

  // Clear existing balances
  await supabase.from("currency_balances").delete().neq("currency", "");

  // Recalculate balances
  const balances: Record<string, { amount: number; eurEquivalent: number }> = {};

  for (const exchange of exchanges) {
    const currency = exchange.to_currency;
    if (!balances[currency]) {
      balances[currency] = { amount: 0, eurEquivalent: 0 };
    }
    balances[currency].amount += Number(exchange.to_amount);
    balances[currency].eurEquivalent += Number(exchange.to_amount);
  }

  // Insert new balances
  for (const [currency, balance] of Object.entries(balances)) {
    await supabase.from("currency_balances").insert({
      currency,
      amount: balance.amount,
      eur_equivalent: balance.eurEquivalent,
    });
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(dateString: string): string {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}
