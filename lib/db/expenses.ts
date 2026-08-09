import { createClient } from "../supabase/client";

import type { Expense } from "@/lib/types";

export async function getAllExpenses(): Promise<Expense[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category,
    type: row.type,
    date: formatDate(row.date),
    notes: row.notes,
    recurring: row.recurring_day_of_month ? { dayOfMonth: row.recurring_day_of_month } : undefined,
  }));
}

export async function getExpensesByMonth(month: string): Promise<Expense[]> {
  const supabase = createClient();

  const [monthNum, year] = month.split("/");
  const startDate = `${year}-${monthNum}-01`;
  const nextMonth =
    monthNum === "12"
      ? `${parseInt(year) + 1}-01-01`
      : `${year}-${String(parseInt(monthNum) + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("expenses")
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
    type: row.type,
    date: formatDate(row.date),
    notes: row.notes,
    recurring: row.recurring_day_of_month ? { dayOfMonth: row.recurring_day_of_month } : undefined,
  }));
}

export async function createExpense(expense: Omit<Expense, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: expense.type,
      date: parseDate(expense.date),
      notes: expense.notes,
      recurring_day_of_month: expense.recurring?.dayOfMonth,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: expense.type,
      date: expense.date ? parseDate(expense.date) : undefined,
      notes: expense.notes,
      recurring_day_of_month: expense.recurring?.dayOfMonth,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteExpense(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// Helper functions
export function formatDate(dateString: string): string {
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
