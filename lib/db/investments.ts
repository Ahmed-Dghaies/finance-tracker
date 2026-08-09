import { createClient } from "../supabase/client";
import { formatDateToDDMMYYYY, parseDate } from "../utils";

import type { Investment, InvestmentContribution } from "@/lib/types";

export async function getAllInvestments(): Promise<Investment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investments")
    .select("*, investment_contributions(*)")
    .order("start_date", { ascending: false });

  if (error) throw error;

  const mapContribution = (contribution: {
    id: string;
    investment_id: string;
    amount: number | string;
    date: string;
    notes: string | null;
  }): InvestmentContribution => ({
    id: contribution.id,
    investmentId: contribution.investment_id,
    amount: Number(contribution.amount),
    date: formatDateToDDMMYYYY(new Date(contribution.date)),
    notes: contribution.notes || undefined,
  });

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    initialAmount: Number(row.initial_amount),
    currency: row.currency,
    currentValue: row.current_value ? Number(row.current_value) : undefined,
    expectedYearlyPercentage: Number(row.expected_yearly_percentage),
    recurringInvestment:
      row.recurring_amount && row.recurring_day_of_month
        ? {
            amount: Number(row.recurring_amount),
            dayOfMonth: row.recurring_day_of_month,
          }
        : undefined,
    contributions: Array.isArray(row.investment_contributions)
      ? row.investment_contributions
          .map(mapContribution)
          .sort((a: InvestmentContribution, b: InvestmentContribution) => {
            return new Date(parseDate(b.date)).getTime() - new Date(parseDate(a.date)).getTime();
          })
      : [],
    startDate: formatDateToDDMMYYYY(new Date(row.start_date)),
  }));
}

export async function createInvestment(investment: Omit<Investment, "id">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("investments")
    .insert({
      name: investment.name,
      type: investment.type,
      initial_amount: investment.initialAmount,
      currency: investment.currency,
      current_value: investment.currentValue,
      expected_yearly_percentage: investment.expectedYearlyPercentage,
      recurring_amount: investment.recurringInvestment?.amount,
      recurring_day_of_month: investment.recurringInvestment?.dayOfMonth,
      start_date: parseDate(investment.startDate),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvestment(id: string, investment: Partial<Investment>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("investments")
    .update({
      name: investment.name,
      type: investment.type,
      initial_amount: investment.initialAmount,
      currency: investment.currency,
      current_value: investment.currentValue,
      expected_yearly_percentage: investment.expectedYearlyPercentage,
      recurring_amount: investment.recurringInvestment?.amount,
      recurring_day_of_month: investment.recurringInvestment?.dayOfMonth,
      start_date: investment.startDate ? parseDate(investment.startDate) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function createInvestmentContribution(
  investmentId: string,
  contribution: Omit<InvestmentContribution, "id" | "investmentId">,
) {
  const supabase = createClient();
  const { error } = await supabase.from("investment_contributions").insert({
    investment_id: investmentId,
    amount: contribution.amount,
    date: parseDate(contribution.date),
    notes: contribution.notes,
  });

  if (error) throw error;
}

export async function deleteInvestment(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("investments").delete().eq("id", id);
  if (error) throw error;
}
