import { createClient } from "./client";
import { getSupabaseKey, getSupabaseUrl, hasSupabaseConfig } from "./config";

export { hasSupabaseConfig };

export const supabase = hasSupabaseConfig() ? createClient() : null;

export const supabaseUrl = getSupabaseUrl();
export const supabaseKey = getSupabaseKey();
