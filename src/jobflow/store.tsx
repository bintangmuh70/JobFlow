import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Application, Status, Schedule, Account, Role, Cv, GuidanceNote } from "./data";
import { pathToScreen, screenToPath } from "./url";
import {
  createApplicationInDb,
  createGuidanceNoteInDb,
  createScheduleInDb,
  deleteApplicationInDb,
  deleteCvFromSupabase,
  deleteGuidanceNoteInDb,
  deleteScheduleInDb,
  fetchProfile,
  getSchoolRegistrationCode,
  loadGuidanceNotes,
  loadGuruWorkspace,
  loadStudentWorkspace,
  requestPasswordReset,
  saveChecklistInDb,
  signInWithSupabase,
  signOutSupabase,
  signUpStudent,
  updateApplicationInDb,
  updateApplicationStatusInDb,
  updatePassword,
  updateProfileInDb,
  updateSchoolRegistrationCode,
  uploadCvPdfToSupabase,
} from "./api";

export type Screen =
  | { name: "login"; email?: string | undefined }
  | { name: "register" }
  | { name: "home" }
  | { name: "kanban" }
  | { name: "radar" }
  | { name: "dashboard" }
  | { name: "form"; editId?: string | undefined }
  | { name: "detail"; id: string }
  | { name: "gb-dashboard" }
  | { name: "gb-students" }
  | { name: "gb-student"; id: string }
  | { name: "gb-progress" }
  | { name: "gb-stats" }
  | { name: "gb-profile" };

export const GURU_SCREENS = ["gb-dashboard", "gb-students", "gb-student", "gb-progress", "gb-stats", "gb-profile"];
export const STUDENT_TABS = ["home", "kanban", "radar", "dashboard"];

function isAllowedForRole(screen: Screen, role: Role): boolean {
  if (screen.name === "login" || screen.name === "register") return false;
  return role === "gurubk" ? screen.name.startsWith("gb-") : !screen.name.startsWith("gb-");
}

function defaultScreenForRole(role: Role): Screen {
  return role === "gurubk" ? { name: "gb-dashboard" } : { name: "home" };
}

function syncBrowserUrl(screen: Screen, mode: "push" | "replace") {
  if (typeof window === "undefined") return;
  const target = screenToPath(screen);
  if (window.location.pathname === target) return;
  if (mode === "push") {
    window.history.pushState({ screen }, "", target);
  } else {
    window.history.replaceState({ screen }, "", target);
  }
}

export interface RegisterResult {
  error?: string | undefined;
  needsConfirmation?: boolean | undefined;
}

export interface ProfilePatch {
  name?: string | undefined;
  major?: string | undefined;
  studentStatus?: string | undefined;
  nip?: string | undefined;
  phone?: string | undefined;
}

interface Store {
  apps: Application[];
  allApps: Application[];
  students: Account[];
  user: Account | null;
  cvs: Cv[];
  checklists: Record<string, boolean[]>;
  guidanceNotes: GuidanceNote[];
  /** Kode akses pendaftaran SMKN 53 (khusus Guru BK). */
  registrationCode: string;
  loading: boolean;
  recoveryMode: boolean;
  clearRecoveryMode: () => void;
  /** Kontrol modal Profil, CV & Keamanan siswa agar bisa dibuka dari Sidebar maupun Header. */
  profileSheetOpen: boolean;
  setProfileSheetOpen: (open: boolean) => void;
  screen: Screen;
  now: Date;
  notifAsked: boolean;
  setNotifAsked: (v: boolean) => void;
  go: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  login: (email: string, password: string, role: Role) => Promise<string | null>;
  register: (a: {
    name: string;
    email: string;
    password: string;
    major: string;
    studentStatus: string;
    registrationCode: string;
    phone?: string | undefined;
  }) => Promise<RegisterResult>;
  forgotPassword: (email: string) => Promise<string | null>;
  changePassword: (newPassword: string) => Promise<string | null>;
  updateProfile: (patch: ProfilePatch) => Promise<boolean>;
  updateRegistrationCode: (newCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  setStatus: (id: string, s: Status) => Promise<boolean>;
  update: (id: string, patch: Partial<Application>) => Promise<boolean>;
  add: (
    a: Omit<Application, "id" | "studentId" | "history" | "schedules" | "status" | "lastUpdated">,
  ) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  addSchedule: (id: string, s: Omit<Schedule, "id">) => Promise<boolean>;
  removeSchedule: (id: string, sid: string) => Promise<boolean>;
  uploadCv: (file: File) => Promise<Cv>;
  deleteCv: (cv: Cv) => Promise<void>;
  toggleChecklist: (scheduleId: string, index: number, length: number) => Promise<void>;
  addGuidanceNote: (studentId: string, note: string) => Promise<boolean>;
  removeGuidanceNote: (id: string) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => useContext(Ctx)!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allApps, setApps] = useState<Application[]>([]);
  const [students, setStudents] = useState<Account[]>([]);
  const [user, setUser] = useState<Account | null>(null);
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>({});
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNote[]>([]);
  const [registrationCode, setRegistrationCode] = useState("SMKN53-2026");
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [stack, setStack] = useState<Screen[]>(() => {
    if (typeof window === "undefined") return [{ name: "login" }];
    const initial = pathToScreen(window.location.pathname);
    return [initial?.name === "register" ? { name: "register" } : { name: "login" }];
  });
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [notifAsked, setNotifAsked] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hydrateForAccount = useCallback(async (acc: Account) => {
    if (acc.role === "siswa") {
      const [ws, notes] = await Promise.all([loadStudentWorkspace(acc.id), loadGuidanceNotes(acc.id)]);
      setApps(ws.apps);
      setCvs(ws.cvs);
      setChecklists(ws.checklists);
      setGuidanceNotes(notes);
      setStudents([]);
    } else {
      const [ws, notes, code] = await Promise.all([
        loadGuruWorkspace(),
        loadGuidanceNotes(),
        getSchoolRegistrationCode().catch(() => "SMKN53-2026"),
      ]);
      setStudents(ws.students);
      setApps(ws.allApps);
      setGuidanceNotes(notes);
      setRegistrationCode(code ?? "SMKN53-2026");
      setCvs([]);
      setChecklists({});
    }
  }, []);

  const enter = useCallback(
    async (acc: Account, preferred?: Screen | null) => {
      setUser(acc);
      const target = preferred && isAllowedForRole(preferred, acc.role) ? preferred : defaultScreenForRole(acc.role);
      setStack([target]);
      syncBrowserUrl(target, "replace");
      window.scrollTo(0, 0);
      try {
        await hydrateForAccount(acc);
      } catch (err) {
        toast.error(`Gagal memuat data: ${(err as Error).message}`);
      }
    },
    [hydrateForAccount],
  );

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      const requested = typeof window !== "undefined" ? pathToScreen(window.location.pathname) : null;
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        if (sessionUser && active) {
          const profile = await fetchProfile(sessionUser.id);
          if (profile && active) {
            const target =
              requested && isAllowedForRole(requested, profile.role)
                ? requested
                : defaultScreenForRole(profile.role);
            setUser(profile);
            setStack([target]);
            syncBrowserUrl(target, "replace");
            await hydrateForAccount(profile);
            return;
          }
        }
        if (active) {
          const fallback: Screen = requested?.name === "register" ? { name: "register" } : { name: "login" };
          setStack([fallback]);
          syncBrowserUrl(fallback, "replace");
        }
      } catch (err) {
        console.error("Gagal memulihkan sesi:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setApps([]);
        setStudents([]);
        setCvs([]);
        setChecklists({});
        setGuidanceNotes([]);
        setProfileSheetOpen(false);
        setStack([{ name: "login" }]);
        syncBrowserUrl({ name: "login" }, "replace");
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [hydrateForAccount]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = pathToScreen(window.location.pathname);
      if (!user) {
        const next: Screen = parsed?.name === "register" ? { name: "register" } : { name: "login" };
        setStack([next]);
        return;
      }
      const next = parsed && isAllowedForRole(parsed, user.role) ? parsed : defaultScreenForRole(user.role);
      setStack([next]);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [user]);

  const screen = stack[stack.length - 1] ?? { name: "login" };

  const store: Store = {
    apps: user?.role === "siswa" ? allApps : [],
    allApps,
    students,
    user,
    cvs,
    checklists,
    guidanceNotes,
    registrationCode,
    loading,
    recoveryMode,
    clearRecoveryMode: () => setRecoveryMode(false),
    profileSheetOpen,
    setProfileSheetOpen,
    screen,
    now,
    notifAsked,
    setNotifAsked,

    go: (s) => {
      setStack((st) => [...st, s]);
      syncBrowserUrl(s, "push");
      window.scrollTo(0, 0);
    },
    replace: (s) => {
      setStack((st) => [...st.slice(0, -1), s]);
      syncBrowserUrl(s, "replace");
      window.scrollTo(0, 0);
    },
    back: () => {
      setStack((st) => {
        if (st.length > 1) {
          const next = st.slice(0, -1);
          const top = next[next.length - 1];
          if (top) syncBrowserUrl(top, "replace");
          return next;
        }
        const fallback = user ? defaultScreenForRole(user.role) : ({ name: "login" } as Screen);
        syncBrowserUrl(fallback, "replace");
        return [fallback];
      });
    },

    login: async (email, password, role) => {
      const res = await signInWithSupabase(email, password, role);
      if (!res.ok) return res.error;
      await enter(res.account);
      return null;
    },

    register: async (a) => {
      const res = await signUpStudent(a);
      if (!res.ok) return { error: res.error };
      if (!res.needsConfirmation && res.account) {
        await enter(res.account);
      }
      return { needsConfirmation: res.needsConfirmation };
    },

    forgotPassword: async (email) => requestPasswordReset(email),
    changePassword: async (newPassword) => {
      const err = await updatePassword(newPassword);
      if (!err) setRecoveryMode(false);
      return err;
    },

    updateProfile: async (patch) => {
      if (!user) return false;
      try {
        const updated = await updateProfileInDb(user.id, patch);
        setUser(updated);
        toast.success("Profil berhasil diperbarui");
        return true;
      } catch (err) {
        toast.error(`Gagal memperbarui profil: ${(err as Error).message}`);
        return false;
      }
    },

    updateRegistrationCode: async (newCode) => {
      try {
        const saved = await updateSchoolRegistrationCode(newCode);
        setRegistrationCode(saved);
        toast.success(`Kode akses pendaftaran diperbarui menjadi ${saved}`);
        return true;
      } catch (err) {
        toast.error(`Gagal memperbarui kode akses: ${(err as Error).message}`);
        return false;
      }
    },

    logout: async () => {
      await signOutSupabase();
      setUser(null);
      setApps([]);
      setStudents([]);
      setCvs([]);
      setChecklists({});
      setGuidanceNotes([]);
      setProfileSheetOpen(false);
      setStack([{ name: "login" }]);
      syncBrowserUrl({ name: "login" }, "replace");
    },

    refreshWorkspace: async () => {
      if (!user) return;
      try {
        await hydrateForAccount(user);
      } catch (err) {
        toast.error(`Gagal menyegarkan data: ${(err as Error).message}`);
      }
    },

    setStatus: async (id, s) => {
      const prev = allApps;
      const target = allApps.find((a) => a.id === id);
      if (!target || target.status === s) return false;

      const nowDate = new Date();
      setApps((xs) =>
        xs.map((a) =>
          a.id === id
            ? { ...a, status: s, lastUpdated: nowDate, history: [...a.history, { status: s, date: nowDate }] }
            : a,
        ),
      );

      try {
        await updateApplicationStatusInDb(id, s);
        return true;
      } catch (err) {
        setApps(prev);
        toast.error(`Gagal mengubah status: ${(err as Error).message}`);
        return false;
      }
    },

    update: async (id, patch) => {
      const prev = allApps;
      const nowDate = new Date();
      setApps((xs) => xs.map((a) => (a.id === id ? { ...a, ...patch, lastUpdated: nowDate } : a)));

      try {
        await updateApplicationInDb(id, patch);
        return true;
      } catch (err) {
        setApps(prev);
        toast.error(`Gagal menyimpan perubahan: ${(err as Error).message}`);
        return false;
      }
    },

    add: async (a) => {
      if (!user) return false;
      try {
        const created = await createApplicationInDb(user.id, a);
        setApps((xs) => [created, ...xs]);
        return true;
      } catch (err) {
        toast.error(`Gagal menambahkan lamaran: ${(err as Error).message}`);
        return false;
      }
    },

    remove: async (id) => {
      const prev = allApps;
      setApps((xs) => xs.filter((a) => a.id !== id));
      try {
        await deleteApplicationInDb(id);
        return true;
      } catch (err) {
        setApps(prev);
        toast.error(`Gagal menghapus lamaran: ${(err as Error).message}`);
        return false;
      }
    },

    addSchedule: async (id, s) => {
      try {
        const created = await createScheduleInDb(id, s);
        const nowDate = new Date();
        setApps((xs) =>
          xs.map((a) =>
            a.id === id ? { ...a, lastUpdated: nowDate, schedules: [...a.schedules, created] } : a,
          ),
        );
        return true;
      } catch (err) {
        toast.error(`Gagal menyimpan jadwal: ${(err as Error).message}`);
        return false;
      }
    },

    removeSchedule: async (id, sid) => {
      const prev = allApps;
      const nowDate = new Date();
      setApps((xs) =>
        xs.map((a) =>
          a.id === id
            ? { ...a, lastUpdated: nowDate, schedules: a.schedules.filter((x) => x.id !== sid) }
            : a,
        ),
      );
      try {
        await deleteScheduleInDb(id, sid);
        return true;
      } catch (err) {
        setApps(prev);
        toast.error(`Gagal menghapus jadwal: ${(err as Error).message}`);
        return false;
      }
    },

    uploadCv: async (file) => {
      if (!user) throw new Error("Sesi pengguna tidak ditemukan");
      const uploaded = await uploadCvPdfToSupabase(user.id, file);
      setCvs((prev) => [uploaded, ...prev]);
      return uploaded;
    },

    deleteCv: async (cv) => {
      const prevCvs = cvs;
      const prevApps = allApps;
      setCvs((xs) => xs.filter((c) => (c.id && cv.id ? c.id !== cv.id : c.name !== cv.name)));
      setApps((xs) =>
        xs.map((a) => (a.cv?.id && cv.id && a.cv.id === cv.id ? { ...a, cv: undefined } : a)),
      );
      try {
        await deleteCvFromSupabase(cv);
        toast.success("CV berhasil dihapus");
      } catch (err) {
        setCvs(prevCvs);
        setApps(prevApps);
        toast.error(`Gagal menghapus CV: ${(err as Error).message}`);
      }
    },

    toggleChecklist: async (scheduleId, index, length) => {
      if (!user) return;
      const current = checklists[scheduleId] ?? Array.from({ length }, () => false);
      const next = current.map((v, i) => (i === index ? !v : v));
      setChecklists((prev) => ({ ...prev, [scheduleId]: next }));
      try {
        await saveChecklistInDb(user.id, scheduleId, next);
      } catch (err) {
        setChecklists((prev) => ({ ...prev, [scheduleId]: current }));
        toast.error(`Gagal menyimpan checklist: ${(err as Error).message}`);
      }
    },

    addGuidanceNote: async (studentId, note) => {
      if (!user || user.role !== "gurubk") return false;
      try {
        const created = await createGuidanceNoteInDb({
          studentId,
          guruId: user.id,
          guruName: user.name,
          note,
        });
        setGuidanceNotes((prev) => [created, ...prev]);
        toast.success("Catatan bimbingan dikirim ke siswa");
        return true;
      } catch (err) {
        toast.error(`Gagal menyimpan catatan: ${(err as Error).message}`);
        return false;
      }
    },

    removeGuidanceNote: async (id) => {
      const prev = guidanceNotes;
      setGuidanceNotes((xs) => xs.filter((n) => n.id !== id));
      try {
        await deleteGuidanceNoteInDb(id);
        toast("Catatan bimbingan dihapus");
      } catch (err) {
        setGuidanceNotes(prev);
        toast.error(`Gagal menghapus catatan: ${(err as Error).message}`);
      }
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
