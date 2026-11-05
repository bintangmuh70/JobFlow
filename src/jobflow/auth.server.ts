import { createServerFn } from "@tanstack/react-start";
import { SEED_ACCOUNTS, type Role, type Account } from "./data";

export interface ServerLoginPayload {
  email: string;
  password: string;
  role: Role;
}

export interface ServerLoginResult {
  ok: boolean;
  error?: string;
  account?: Account;
  processedBy: string;
  timestamp: string;
}

/**
 * Server Function: Memproses verifikasi kredensial login di sisi backend
 */
export const loginServerFn = createServerFn({ method: "POST" })
  .validator((d: ServerLoginPayload) => d)
  .handler(async ({ data }): Promise<ServerLoginResult> => {
    const { email, password, role } = data;
    const acc = SEED_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

    if (!acc || acc.password !== password) {
      return {
        ok: false,
        error: "Surel atau kata sandi salah",
        processedBy: "JobFlow Nitro Server",
        timestamp: new Date().toISOString(),
      };
    }

    if (acc.role !== role) {
      return {
        ok: false,
        error: `Akun ini terdaftar sebagai ${acc.role === "siswa" ? "Siswa" : "Guru BK"}. Pilih peran yang sesuai.`,
        processedBy: "JobFlow Nitro Server",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      ok: true,
      account: acc,
      processedBy: "JobFlow Nitro Server",
      timestamp: new Date().toISOString(),
    };
  });

