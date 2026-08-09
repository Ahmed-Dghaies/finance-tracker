import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseKey, getSupabaseUrl } from "./config";

export function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
