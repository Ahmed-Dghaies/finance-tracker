import { createClient } from "../supabase/client";

import type { Possession } from "@/lib/types";

export async function getAllPossessions(): Promise<Possession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("possessions")
    .select("*")
    .order("purchase_date", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    purchasePrice: Number(row.purchase_price),
    currentValue: Number(row.current_value),
    currency: row.currency,
    purchaseDate: formatDate(row.purchase_date),
    notes: row.notes,
  }));
}

export async function createPossession(possession: Omit<Possession, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("possessions")
    .insert({
      name: possession.name,
      category: possession.category,
      purchase_price: possession.purchasePrice,
      current_value: possession.currentValue,
      currency: possession.currency,
      purchase_date: parseDate(possession.purchaseDate),
      notes: possession.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePossession(id: string, possession: Partial<Possession>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("possessions")
    .update({
      name: possession.name,
      category: possession.category,
      purchase_price: possession.purchasePrice,
      current_value: possession.currentValue,
      currency: possession.currency,
      purchase_date: possession.purchaseDate ? parseDate(possession.purchaseDate) : undefined,
      notes: possession.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deletePossession(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("possessions").delete().eq("id", id);
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
