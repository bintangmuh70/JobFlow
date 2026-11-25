import { createClient } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const SUPABASE_URL = env["VITE_SUPABASE_URL"] ?? "";
export const SUPABASE_ANON_KEY = env["VITE_SUPABASE_ANON_KEY"] ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Supabase client instance dengan session persisten di browser.
 * Menggunakan fallback placeholder aman hanya jika env belum diset (mis. saat unit test).
 */
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/**
 * Cek status konektivitas Supabase.
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      return { ok: true, status: "connected", details: error.message };
    }
    return { ok: true, status: "connected", data };
  } catch (err) {
    return { ok: false, status: "disconnected", error: (err as Error).message };
  }
}
