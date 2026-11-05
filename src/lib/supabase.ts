import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || "https://egkjtrbieirjmaathxub.supabase.co";
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] || "sb_publishable_t8yCSGKR08B1QZvu2WEyIg_gYaVK7lu";

/**
 * Supabase client instance untuk browser dan server
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cek status konektivitas Supabase
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
