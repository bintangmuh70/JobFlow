import { supabase } from "@/lib/supabase";
import { SCHOOL_NAME } from "@/lib/constants";
import type { Account, Application, Cv, GuidanceNote, Remind, Role, Schedule, ScheduleType, Status } from "./data";

interface ProfileRow {
  id: string;
  role: Role;
  name: string;
  email: string;
  school: string;
  major: string | null;
  student_status?: string | null;
  nip: string | null;
  phone: string | null;
}

interface CvRow {
  id: string;
  student_id: string;
  name: string;
  size: number;
  storage_path: string;
}

interface StatusHistoryRow {
  id: string;
  application_id: string;
  status: Status;
  changed_at: string;
}

interface ScheduleRow {
  id: string;
  application_id: string;
  type: ScheduleType;
  scheduled_at: string;
  remind: Remind;
}

interface ApplicationRow {
  id: string;
  student_id: string;
  company: string;
  position: string;
  location: string;
  source: string;
  applied_date: string;
  salary: number | null;
  url: string | null;
  status: Status;
  cv_id: string | null;
  followed_up: boolean;
  company_notes: string | null;
  last_updated: string;
  status_history?: StatusHistoryRow[] | null;
  schedules?: ScheduleRow[] | null;
  cvs?: CvRow | null;
}

interface ChecklistRow {
  schedule_id: string;
  items: boolean[];
}

interface GuidanceNoteRow {
  id: string;
  student_id: string;
  guru_id: string;
  guru_name: string;
  note: string;
  created_at: string;
}

function mapGuidanceNote(row: GuidanceNoteRow): GuidanceNote {
  return {
    id: row.id,
    studentId: row.student_id,
    guruId: row.guru_id,
    guruName: row.guru_name,
    note: row.note,
    createdAt: new Date(row.created_at),
  };
}

function mapProfile(row: ProfileRow): Account {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    school: row.school || SCHOOL_NAME,
    major: row.major ?? undefined,
    studentStatus: row.student_status ?? "Kelas XII",
    nip: row.nip ?? undefined,
    phone: row.phone ?? undefined,
  };
}

function mapCv(row: CvRow): Cv {
  return {
    id: row.id,
    name: row.name,
    size: Number(row.size),
    storagePath: row.storage_path,
  };
}

function mapSchedule(row: ScheduleRow): Schedule {
  return {
    id: row.id,
    type: row.type,
    at: new Date(row.scheduled_at),
    remind: row.remind,
  };
}

function mapApplication(row: ApplicationRow): Application {
  const history = (row.status_history ?? [])
    .map((h) => ({ status: h.status, date: new Date(h.changed_at) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const schedules = (row.schedules ?? [])
    .map(mapSchedule)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return {
    id: row.id,
    studentId: row.student_id,
    company: row.company,
    position: row.position,
    location: row.location ?? "",
    source: row.source,
    appliedDate: new Date(row.applied_date),
    salary: row.salary !== null ? Number(row.salary) : undefined,
    url: row.url ?? undefined,
    status: row.status,
    lastUpdated: new Date(row.last_updated),
    history: history.length > 0 ? history : [{ status: row.status, date: new Date(row.applied_date) }],
    schedules,
    cv: row.cvs ? mapCv(row.cvs) : undefined,
    followedUp: row.followed_up,
    companyNotes: row.company_notes ?? undefined,
  };
}

export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Surel atau kata sandi salah";
  if (m.includes("email not confirmed")) return "Surel belum diverifikasi. Silakan cek kotak masuk surelmu.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "Surel sudah terdaftar";
  if (m.includes("password should be at least")) return "Kata sandi minimal 8 karakter";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  if (m.includes("network") || m.includes("fetch")) return "Gagal terhubung ke server. Periksa koneksi internetmu.";
  return message;
}

export async function fetchProfile(userId: string): Promise<Account | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function signInWithSupabase(
  email: string,
  password: string,
  expectedRole: Role,
): Promise<{ ok: true; account: Account } | { ok: false; error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: translateAuthError(error?.message ?? "Gagal masuk") };
  }

  let profile: Account | null = null;
  try {
    profile = await fetchProfile(data.user.id);
  } catch {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Gagal memuat profil pengguna. Silakan coba beberapa saat lagi.",
    };
  }

  if (!profile) {
    await supabase.auth.signOut();
    return { ok: false, error: "Profil pengguna tidak ditemukan di database. Hubungi admin." };
  }

  if (profile.role !== expectedRole) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: `Akun ini terdaftar sebagai ${profile.role === "siswa" ? "Siswa" : "Guru BK"}. Pilih peran yang sesuai.`,
    };
  }

  return { ok: true, account: profile };
}

export async function verifyRegistrationCode(code: string): Promise<boolean> {
  const cleaned = code.trim();
  if (!cleaned) return false;
  const { data, error } = await supabase.rpc("verify_registration_code", { input_code: cleaned });
  if (error) {
    // Fallback aman jika migrasi SQL school_settings belum dijalankan di Supabase
    if (error.message.includes("verify_registration_code") || error.code === "PGRST202") {
      return cleaned.toUpperCase() === "SMKN53-2026";
    }
    throw new Error(error.message);
  }
  return Boolean(data);
}

export async function getSchoolRegistrationCode(): Promise<string | null> {
  const { data, error } = await supabase
    .from("school_settings")
    .select("registration_code")
    .eq("school", SCHOOL_NAME)
    .maybeSingle();
  if (error) {
    if (error.message.includes("school_settings") || error.code === "42P01" || error.code === "PGRST205") {
      return "SMKN53-2026";
    }
    throw new Error(error.message);
  }
  return (data as { registration_code: string } | null)?.registration_code ?? "SMKN53-2026";
}

export async function updateSchoolRegistrationCode(newCode: string): Promise<string> {
  const formatted = newCode.trim().toUpperCase();
  if (formatted.length < 4) throw new Error("Kode akses minimal 4 karakter");
  const { error } = await supabase
    .from("school_settings")
    .update({ registration_code: formatted, updated_at: new Date().toISOString() })
    .eq("school", SCHOOL_NAME);
  if (error) throw new Error(error.message);
  return formatted;
}

export async function signUpStudent(input: {
  name: string;
  email: string;
  password: string;
  major: string;
  studentStatus: string;
  registrationCode: string;
  phone?: string | undefined;
}): Promise<{ ok: true; needsConfirmation: boolean; account?: Account | undefined } | { ok: false; error: string }> {
  try {
    const validCode = await verifyRegistrationCode(input.registrationCode);
    if (!validCode) {
      return {
        ok: false,
        error: "Kode akses SMKN 53 Jakarta tidak valid. Hubungi Guru BK untuk kode terbaru.",
      };
    }
  } catch (err) {
    return { ok: false, error: `Gagal memverifikasi kode akses: ${(err as Error).message}` };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        school: SCHOOL_NAME,
        major: input.major.trim(),
        student_status: input.studentStatus.trim(),
        phone: input.phone?.trim() ?? "",
      },
    },
  });

  if (error) {
    return { ok: false, error: translateAuthError(error.message) };
  }

  // Supabase mengembalikan identities kosong jika email sudah terdaftar saat email-confirm aktif
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, error: "Surel sudah terdaftar" };
  }

  if (!data.session || !data.user) {
    return { ok: true, needsConfirmation: true };
  }

  // Beri jeda singkat jika trigger DB baru saja memasukkan profil
  let profile = await fetchProfile(data.user.id);
  if (!profile) {
    await new Promise((r) => setTimeout(r, 300));
    profile = await fetchProfile(data.user.id);
  }

  return { ok: true, needsConfirmation: false, account: profile ?? undefined };
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    redirectTo ? { redirectTo } : undefined,
  );
  return error ? translateAuthError(error.message) : null;
}

export async function updatePassword(newPassword: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? translateAuthError(error.message) : null;
}

export async function signOutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}

const APP_SELECT = `
  *,
  status_history (*),
  schedules (*),
  cvs (*)
`;

export async function loadStudentWorkspace(studentId: string): Promise<{
  apps: Application[];
  cvs: Cv[];
  checklists: Record<string, boolean[]>;
}> {
  const [appsRes, cvsRes, checksRes] = await Promise.all([
    supabase
      .from("applications")
      .select(APP_SELECT)
      .eq("student_id", studentId)
      .order("last_updated", { ascending: false }),
    supabase.from("cvs").select("*").eq("student_id", studentId).order("created_at", { ascending: false }),
    supabase.from("interview_checklists").select("schedule_id, items").eq("student_id", studentId),
  ]);

  if (appsRes.error) throw new Error(appsRes.error.message);
  if (cvsRes.error) throw new Error(cvsRes.error.message);
  if (checksRes.error) throw new Error(checksRes.error.message);

  const checklists: Record<string, boolean[]> = {};
  for (const row of (checksRes.data ?? []) as ChecklistRow[]) {
    checklists[row.schedule_id] = row.items;
  }

  return {
    apps: ((appsRes.data ?? []) as ApplicationRow[]).map(mapApplication),
    cvs: ((cvsRes.data ?? []) as CvRow[]).map(mapCv),
    checklists,
  };
}

export async function loadGuruWorkspace(): Promise<{
  students: Account[];
  allApps: Application[];
}> {
  const [studentsRes, appsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "siswa").order("name", { ascending: true }),
    supabase.from("applications").select(APP_SELECT).order("last_updated", { ascending: false }),
  ]);

  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (appsRes.error) throw new Error(appsRes.error.message);

  return {
    students: ((studentsRes.data ?? []) as ProfileRow[]).map(mapProfile),
    allApps: ((appsRes.data ?? []) as ApplicationRow[]).map(mapApplication),
  };
}

export async function createApplicationInDb(
  studentId: string,
  input: Omit<Application, "id" | "studentId" | "history" | "schedules" | "status" | "lastUpdated">,
): Promise<Application> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      student_id: studentId,
      company: input.company,
      position: input.position,
      location: input.location,
      source: input.source,
      applied_date: input.appliedDate.toISOString(),
      salary: input.salary ?? null,
      url: input.url ?? null,
      status: "applied",
      cv_id: input.cv?.id ?? null,
      followed_up: input.followedUp ?? false,
      company_notes: input.companyNotes ?? null,
      last_updated: nowIso,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Gagal menyimpan lamaran");

  const appRow = data as ApplicationRow;
  const { error: histErr } = await supabase.from("status_history").insert({
    application_id: appRow.id,
    status: "applied",
    changed_at: input.appliedDate.toISOString(),
  });
  if (histErr) throw new Error(histErr.message);

  return mapApplication({
    ...appRow,
    status_history: [{ id: "init", application_id: appRow.id, status: "applied", changed_at: input.appliedDate.toISOString() }],
    schedules: [],
    cvs: null,
  });
}

export async function updateApplicationInDb(
  id: string,
  patch: Partial<Application>,
): Promise<void> {
  const payload: Record<string, unknown> = {
    last_updated: new Date().toISOString(),
  };
  if (patch.company !== undefined) payload["company"] = patch.company;
  if (patch.position !== undefined) payload["position"] = patch.position;
  if (patch.location !== undefined) payload["location"] = patch.location;
  if (patch.source !== undefined) payload["source"] = patch.source;
  if (patch.appliedDate !== undefined) payload["applied_date"] = patch.appliedDate.toISOString();
  if ("salary" in patch) payload["salary"] = patch.salary ?? null;
  if ("url" in patch) payload["url"] = patch.url ?? null;
  if ("followedUp" in patch) payload["followed_up"] = Boolean(patch.followedUp);
  if ("companyNotes" in patch) payload["company_notes"] = patch.companyNotes ?? null;
  if ("cv" in patch) payload["cv_id"] = patch.cv?.id ?? null;

  const { error } = await supabase.from("applications").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateApplicationStatusInDb(id: string, status: Status): Promise<Date> {
  const now = new Date();
  const iso = now.toISOString();

  const [appRes, histRes] = await Promise.all([
    supabase.from("applications").update({ status, last_updated: iso }).eq("id", id),
    supabase.from("status_history").insert({ application_id: id, status, changed_at: iso }),
  ]);

  if (appRes.error) throw new Error(appRes.error.message);
  if (histRes.error) throw new Error(histRes.error.message);

  return now;
}

export async function deleteApplicationInDb(id: string): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createScheduleInDb(
  applicationId: string,
  input: Omit<Schedule, "id">,
): Promise<Schedule> {
  const { data, error } = await supabase
    .from("schedules")
    .insert({
      application_id: applicationId,
      type: input.type,
      scheduled_at: input.at.toISOString(),
      remind: input.remind,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Gagal menyimpan jadwal");

  await supabase
    .from("applications")
    .update({ last_updated: new Date().toISOString() })
    .eq("id", applicationId);

  return mapSchedule(data as ScheduleRow);
}

export async function deleteScheduleInDb(applicationId: string, scheduleId: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", scheduleId);
  if (error) throw new Error(error.message);

  await supabase
    .from("applications")
    .update({ last_updated: new Date().toISOString() })
    .eq("id", applicationId);
}

export async function saveChecklistInDb(
  studentId: string,
  scheduleId: string,
  items: boolean[],
): Promise<void> {
  const { error } = await supabase.from("interview_checklists").upsert(
    {
      schedule_id: scheduleId,
      student_id: studentId,
      items,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "schedule_id" },
  );
  if (error) throw new Error(error.message);
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

export async function uploadCvPdfToSupabase(studentId: string, file: File): Promise<Cv> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Format berkas harus PDF");
  }
  if (file.size === 0 || file.size > MAX_CV_BYTES) {
    throw new Error("Ukuran berkas harus antara 1 byte hingga 5 MB");
  }

  // Validasi magic bytes (%PDF-) agar berkas non-PDF yang hanya diganti ekstensinya langsung ditolak
  const headerBytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const signature = String.fromCharCode(...headerBytes);
  if (signature !== "%PDF-") {
    throw new Error("Isi berkas tidak valid. Pastikan berkas benar-benar dokumen PDF asli.");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${studentId}/${Date.now()}-${sanitizedName}`;

  const { error: uploadErr } = await supabase.storage.from("cvs").upload(storagePath, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (uploadErr) throw new Error(`Gagal mengunggah berkas: ${uploadErr.message}`);

  const { data, error: dbErr } = await supabase
    .from("cvs")
    .insert({
      student_id: studentId,
      name: file.name,
      size: file.size,
      storage_path: storagePath,
    })
    .select("*")
    .single();

  if (dbErr || !data) {
    await supabase.storage.from("cvs").remove([storagePath]);
    throw new Error(dbErr?.message ?? "Gagal menyimpan metadata CV");
  }

  return mapCv(data as CvRow);
}

export async function getCvSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(storagePath, 300);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Gagal membuat tautan pratinjau CV");
  }
  return data.signedUrl;
}

export async function deleteCvFromSupabase(cv: Cv): Promise<void> {
  if (cv.storagePath) {
    const { error: stErr } = await supabase.storage.from("cvs").remove([cv.storagePath]);
    if (stErr) throw new Error(stErr.message);
  }
  if (cv.id) {
    const { error: dbErr } = await supabase.from("cvs").delete().eq("id", cv.id);
    if (dbErr) throw new Error(dbErr.message);
  }
}

export async function updateProfileInDb(
  userId: string,
  patch: {
    name?: string | undefined;
    major?: string | undefined;
    studentStatus?: string | undefined;
    nip?: string | undefined;
    phone?: string | undefined;
  },
): Promise<Account> {
  const payload: Record<string, unknown> = {
    school: SCHOOL_NAME,
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) payload["name"] = patch.name.trim();
  if ("major" in patch) payload["major"] = patch.major?.trim() || null;
  if ("studentStatus" in patch) payload["student_status"] = patch.studentStatus?.trim() || "Kelas XII";
  if ("nip" in patch) payload["nip"] = patch.nip?.trim() || null;
  if ("phone" in patch) payload["phone"] = patch.phone?.trim() || null;

  const { data, error } = await supabase.from("profiles").update(payload).eq("id", userId).select("*").single();
  if (error || !data) throw new Error(error?.message ?? "Gagal memperbarui profil");
  return mapProfile(data as ProfileRow);
}

export async function loadGuidanceNotes(studentId?: string): Promise<GuidanceNote[]> {
  let query = supabase.from("guidance_notes").select("*").order("created_at", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) {
    // Jika migrasi tabel guidance_notes belum dijalankan di Supabase, jangan sampai aplikasi error
    if (error.message.includes("guidance_notes") || error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }
    throw new Error(error.message);
  }
  return ((data ?? []) as GuidanceNoteRow[]).map(mapGuidanceNote);
}

export async function createGuidanceNoteInDb(input: {
  studentId: string;
  guruId: string;
  guruName: string;
  note: string;
}): Promise<GuidanceNote> {
  const { data, error } = await supabase
    .from("guidance_notes")
    .insert({
      student_id: input.studentId,
      guru_id: input.guruId,
      guru_name: input.guruName,
      note: input.note.trim(),
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Gagal menyimpan catatan bimbingan");
  return mapGuidanceNote(data as GuidanceNoteRow);
}

export async function deleteGuidanceNoteInDb(id: string): Promise<void> {
  const { error } = await supabase.from("guidance_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
