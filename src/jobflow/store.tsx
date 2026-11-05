import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  seed, seedClassmates, uid, authenticate, SEED_ACCOUNTS, DEMO,
  type Application, type Status, type Schedule, type Account, type Role, type Cv,
} from "./data";

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

interface Store {
  /** Lamaran milik siswa yang sedang masuk. */
  apps: Application[];
  /** Semua lamaran (dipakai portal Guru BK). */
  allApps: Application[];
  accounts: Account[];
  students: Account[];
  user: Account | null;
  /** Daftar CV milik siswa yang sedang masuk; hanya berisi CV yang benar-benar diunggah. */
  cvs: Cv[];
  screen: Screen;
  now: Date;
  notifAsked: boolean;
  setNotifAsked: (v: boolean) => void;
  go: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  login: (email: string, password: string, role: Role) => string | null;
  loginDemo: (role: Role) => void;
  register: (a: Omit<Account, "id" | "role">) => string | null;
  logout: () => void;
  setStatus: (id: string, s: Status) => void;
  update: (id: string, patch: Partial<Application>) => void;
  add: (a: Omit<Application, "id" | "studentId" | "history" | "schedules" | "status" | "lastUpdated">) => void;
  remove: (id: string) => void;
  addSchedule: (id: string, s: Omit<Schedule, "id">) => void;
  removeSchedule: (id: string, sid: string) => void;
  addCv: (cv: Cv) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => useContext(Ctx)!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allApps, setApps] = useState<Application[]>(() => {
    const now = new Date();
    return [...seed(now), ...seedClassmates(now)];
  });
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [userId, setUserId] = useState<string | null>(null);
  const [cvLib, setCvLib] = useState<Record<string, Cv[]>>({});
  const [stack, setStack] = useState<Screen[]>([{ name: "login" }]);
  const [notifAsked, setNotifAsked] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const user = accounts.find((a) => a.id === userId) ?? null;
  const screen = stack[stack.length - 1] ?? { name: "login" };
  const touch = (id: string, fn: (a: Application) => Application) =>
    setApps((xs) => xs.map((a) => (a.id === id ? { ...fn(a), lastUpdated: new Date() } : a)));
  const enter = (acc: Account) => {
    setUserId(acc.id);
    setStack([{ name: acc.role === "siswa" ? "home" : "gb-dashboard" }]);
    window.scrollTo(0, 0);
  };

  const store: Store = {
    apps: user?.role === "siswa" ? allApps.filter((a) => a.studentId === user.id) : [],
    allApps,
    accounts,
    students: accounts.filter((a) => a.role === "siswa"),
    user,
    cvs: (user && cvLib[user.id]) || [],
    screen,
    now,
    notifAsked,
    setNotifAsked,
    go: (s) => {
      setStack((st) => [...st, s]);
      window.scrollTo(0, 0);
    },
    replace: (s) => {
      setStack((st) => [...st.slice(0, -1), s]);
      window.scrollTo(0, 0);
    },
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    login: (email, password, role) => {
      const r = authenticate(accounts, email, password, role);
      if (!r.ok) return r.error;
      enter(r.account);
      return null;
    },
    loginDemo: (role) => {
      const r = authenticate(accounts, DEMO[role].email, DEMO[role].password, role);
      if (r.ok) enter(r.account);
    },
    register: (a) => {
      if (accounts.some((x) => x.email.toLowerCase() === a.email.trim().toLowerCase())) return "Surel sudah terdaftar";
      setAccounts((xs) => [...xs, { ...a, email: a.email.trim(), id: uid(), role: "siswa" }]);
      return null;
    },
    logout: () => {
      setUserId(null);
      setStack([{ name: "login" }]);
    },
    setStatus: (id, s) =>
      touch(id, (a) => (a.status === s ? a : { ...a, status: s, history: [...a.history, { status: s, date: new Date() }] })),
    update: (id, patch) => touch(id, (a) => ({ ...a, ...patch })),
    add: (a) =>
      setApps((xs) => [
        { ...a, id: uid(), studentId: userId ?? "", status: "applied", history: [{ status: "applied", date: a.appliedDate }], schedules: [], lastUpdated: new Date() },
        ...xs,
      ]),
    remove: (id) => setApps((xs) => xs.filter((a) => a.id !== id)),
    addSchedule: (id, s) => touch(id, (a) => ({ ...a, schedules: [...a.schedules, { ...s, id: uid() }] })),
    removeSchedule: (id, sid) => touch(id, (a) => ({ ...a, schedules: a.schedules.filter((x) => x.id !== sid) })),
    addCv: (cv) => {
      if (!userId) return;
      setCvLib((m) => {
        const list = (m[userId] ?? []).filter((c) => c.name !== cv.name);
        return { ...m, [userId]: [cv, ...list] };
      });
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
