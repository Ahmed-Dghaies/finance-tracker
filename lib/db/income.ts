import { createClient } from "../supabase/client";

import type { Income } from "@/lib/types";

export async function getAllIncome(): Promise<Income[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category,
    date: formatDate(row.date),
    recurring: row.recurring,
  }));
}

export async function getIncomeByMonth(month: string): Promise<Income[]> {
  const [monthNum, year] = month.split("/");
  const supabase = createClient();
  const startDate = `${year}-${monthNum}-01`;
  const nextMonth =
    monthNum === "12"
      ? `${parseInt(year) + 1}-01-01`
      : `${year}-${String(parseInt(monthNum) + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("income")
    .select("*")
    .gte("date", startDate)
    .lt("date", nextMonth)
    .order("date", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category,
    date: formatDate(row.date),
    recurring: row.recurring,
  }));
}

export async function createIncome(income: Omit<Income, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .insert({
      amount: income.amount,
      currency: income.currency,
      category: income.category,
      date: parseDate(income.date),
      recurring: income.recurring,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncome(id: string, income: Partial<Income>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("income")
    .update({
      amount: income.amount,
      currency: income.currency,
      category: income.category,
      date: income.date ? parseDate(income.date) : undefined,
      recurring: income.recurring,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteIncome(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("income").delete().eq("id", id);
  if (error) throw error;
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
