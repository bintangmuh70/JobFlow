import { createServerFn } from "@tanstack/react-start";
import { SUPABASE_URL } from "@/lib/supabase";

export interface BackendStatusResponse {
  status: "ok";
  service: string;
  supabaseUrl: string;
  timestamp: string;
}

/**
 * Server Function: Memeriksa kesehatan server & konfigurasi koneksi backend.
 */
export const getBackendStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BackendStatusResponse> => ({
    status: "ok",
    service: "JobFlow Production Server",
    supabaseUrl: SUPABASE_URL,
    timestamp: new Date().toISOString(),
  }),
);
