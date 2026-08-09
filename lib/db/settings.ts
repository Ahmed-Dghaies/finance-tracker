import { createClient } from "../supabase/client";
import { ProjectSettings } from "../types";

export async function getSetting(key: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).single();

  if (error) return null;
  return data?.value || null;
}

export async function getAllSettigs(): Promise<ProjectSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("settings").select("*");

  if (error || !data) return null;
  const settings: Record<string, any> = {};
  for (let index = 0; index < data.length; index++) {
    const element = data[index] as { key: string; value: any };
    settings[element.key] = element.value;
  }
  return settings as ProjectSettings;
}

export async function setSetting(key: string, value: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) throw error;
}

export async function getStartingBalance(): Promise<number> {
  const value = await getSetting("startingBalance");
  return value ? Number(value) : 0;
}

export async function setStartingBalance(amount: number) {
  await setSetting("startingBalance", amount.toString());
}

export async function getNetWorthGoal(): Promise<{
  targetValue: number;
  currentYear: number;
} | null> {
  const value = await getSetting("netWorthGoalValue");
  const year = await getSetting("netWorthGoalYear");

  if (!value || !year) return null;

  return {
    targetValue: Number(value),
    currentYear: Number(year),
  };
}

export async function setNetWorthGoal(targetValue: number, currentYear: number) {
  await setSetting("netWorthGoalValue", targetValue.toString());
  await setSetting("netWorthGoalYear", currentYear.toString());
}
