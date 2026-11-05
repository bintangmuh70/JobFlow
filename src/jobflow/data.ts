export type Status = "applied" | "screening" | "interview" | "offer" | "accepted" | "rejected";
export type Role = "siswa" | "gurubk";
export type ScheduleType = "Tes" | "Wawancara" | "Tenggat";
export type Remind = "1 jam sebelumnya" | "1 hari sebelumnya" | "2 hari sebelumnya";

export interface Schedule {
  id: string;
  type: ScheduleType;
  at: Date;
  remind: Remind;
}
export interface Cv {
  name: string;
  size: number;
}
export interface Account {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  school: string;
  major?: string | undefined; // jurusan (siswa)
  nip?: string | undefined; // Guru BK
  phone?: string | undefined;
}
export interface Application {
  id: string;
  studentId: string;
  company: string;
  position: string;
  location: string;
  source: string;
  appliedDate: Date;
  salary?: number | undefined;
  url?: string | undefined;
  status: Status;
  lastUpdated: Date;
  history: { status: Status; date: Date }[];
  schedules: Schedule[];
  cv?: Cv | undefined;
  followedUp?: boolean | undefined;
}

export const STATUSES: Status[] = ["applied", "screening", "interview", "offer", "accepted", "rejected"];
export const STATUS_LABEL: Record<Status, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offering",
  accepted: "Diterima",
  rejected: "Ditolak",
};
export const SOURCES = ["JobStreet", "LinkedIn", "Glints", "Kalibrr", "Situs perusahaan", "Lainnya"];
export const REMINDS: Remind[] = ["1 jam sebelumnya", "1 hari sebelumnya", "2 hari sebelumnya"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const pad = (n: number) => String(n).padStart(2, "0");

export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtTime = (d: Date) => `${pad(d.getHours())}.${pad(d.getMinutes())}`;
export const fmtShortDay = (d: Date) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}, ${fmtTime(d)}`;
export const fmtDateTime = (d: Date) => `${DAYS[d.getDay()]}, ${fmtDate(d)} · ${fmtTime(d)}`;
export const fmtRp = (n: number) => "Rp" + n.toLocaleString("id-ID");
export const fmtSize = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.round(b / 1024)} KB`;

export function fmtCountdown(ms: number) {
  if (ms <= 0) return "0 j 0 m";
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  return d > 0 ? `${d} hari ${h} j ${m} m` : `${h} j ${m} m`;
}

export function businessDaysBetween(from: Date, to: Date) {
  let n = 0;
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (d < end) {
    d.setDate(d.getDate() + 1);
    const w = d.getDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}
export function subBusinessDays(date: Date, n: number) {
  const d = new Date(date);
  while (n > 0) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n--;
  }
  return d;
}

export const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

export function computeStats(apps: Application[]) {
  const total = apps.length;
  const count = (...ss: Status[]) => apps.filter((a) => ss.includes(a.status)).length;
  const reached = count("interview", "offer", "accepted");
  const offer = count("offer", "accepted");
  const accepted = count("accepted");
  return {
    total,
    reached,
    offer,
    accepted,
    reachedPct: pct(reached, total),
    offerPct: pct(offer, total),
    acceptedPct: pct(accepted, total),
    interviewToOffer: pct(offer, reached),
    waiting: count("applied", "screening"),
    rejected: count("rejected"),
  };
}

export const countByStatus = (apps: Application[]) =>
  Object.fromEntries(STATUSES.map((s) => [s, apps.filter((a) => a.status === s).length])) as Record<Status, number>;

/** Tahap karier terjauh seorang siswa, dipakai Guru BK untuk memantau progres. */
export type Stage = "none" | "searching" | "interview" | "offer" | "accepted";
export const STAGES: Stage[] = ["none", "searching", "interview", "offer", "accepted"];
export const STAGE_LABEL: Record<Stage, string> = {
  none: "Belum melamar",
  searching: "Sedang melamar",
  interview: "Tahap interview",
  offer: "Mendapat offering",
  accepted: "Sudah diterima",
};
export function furthestStage(apps: Application[]): Stage {
  if (apps.some((a) => a.status === "accepted")) return "accepted";
  if (apps.some((a) => a.status === "offer")) return "offer";
  if (apps.some((a) => a.status === "interview")) return "interview";
  return apps.length ? "searching" : "none";
}

export function placementStats(students: Account[], apps: Application[]) {
  const byStudent = (id: string) => apps.filter((a) => a.studentId === id);
  const stages = students.map((s) => furthestStage(byStudent(s.id)));
  const stageCount = Object.fromEntries(STAGES.map((st) => [st, stages.filter((x) => x === st).length])) as Record<Stage, number>;
  const placed = stageCount.accepted;
  return {
    students: students.length,
    applications: apps.length,
    active: students.length - stageCount.none,
    offerApps: apps.filter((a) => a.status === "offer").length,
    acceptedApps: apps.filter((a) => a.status === "accepted").length,
    placed,
    placementPct: pct(placed, students.length),
    stageCount,
  };
}

export type AuthResult = { ok: true; account: Account } | { ok: false; error: string };
export function authenticate(accounts: Account[], email: string, password: string, role: Role): AuthResult {
  const acc = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || acc.password !== password) return { ok: false, error: "Surel atau kata sandi salah" };
  if (acc.role !== role)
    return { ok: false, error: `Akun ini terdaftar sebagai ${acc.role === "siswa" ? "Siswa" : "Guru BK"}. Pilih peran yang sesuai.` };
  return { ok: true, account: acc };
}

export const DEMO = {
  siswa: { email: "rahima@email.com", password: "rahima123" },
  gurubk: { email: "gurubk@jobflow.id", password: "gurubk123" },
} as const;
const SCHOOL = "SMK Negeri 1 Jakarta";
export const SEED_ACCOUNTS: Account[] = [
  { id: "rahima", role: "siswa", name: "Rahima", email: DEMO.siswa.email, password: DEMO.siswa.password, school: SCHOOL, major: "Rekayasa Perangkat Lunak", phone: "0812-0000-0000" },
  { id: "gurubk", role: "gurubk", name: "Ibu Sri Wahyuni, S.Pd.", email: DEMO.gurubk.email, password: DEMO.gurubk.password, school: SCHOOL, nip: "19800512 200501 2 004", phone: "0813-1111-2222" },
  { id: "dimas", role: "siswa", name: "Dimas Pratama", email: "dimas@email.com", password: "dimas1234", school: SCHOOL, major: "Teknik Komputer dan Jaringan" },
  { id: "siti", role: "siswa", name: "Siti Nurhaliza", email: "siti@email.com", password: "siti12345", school: SCHOOL, major: "Akuntansi dan Keuangan" },
  { id: "bagus", role: "siswa", name: "Bagus Saputra", email: "bagus@email.com", password: "bagus1234", school: SCHOOL, major: "Rekayasa Perangkat Lunak" },
  { id: "ayu", role: "siswa", name: "Ayu Lestari", email: "ayu@email.com", password: "ayu123456", school: SCHOOL, major: "Bisnis Digital" },
  { id: "nadia", role: "siswa", name: "Nadia Putri", email: "nadia@email.com", password: "nadia1234", school: SCHOOL, major: "Rekayasa Perangkat Lunak" },
  { id: "rizky", role: "siswa", name: "Rizky Ramadhan", email: "rizky@email.com", password: "rizky1234", school: SCHOOL, major: "Teknik Komputer dan Jaringan" },
];

let idc = 100;
export const uid = () => `id${++idc}`;

export function seed(now = new Date()): Application[] {
  const day = (y: number, m: number, d: number, h = 9, mi = 0) => new Date(y, m, d, h, mi);
  const hrs = (h: number, m = 0) => new Date(now.getTime() + (h * 60 + m) * 60000);
  const recent = (days: number) => new Date(now.getTime() - days * 86400000);
  const mk = (
    p: Partial<Application> & Pick<Application, "id" | "company" | "position" | "location" | "status" | "appliedDate">,
  ): Application => ({
    studentId: "rahima",
    source: "LinkedIn",
    lastUpdated: recent(1),
    history: [{ status: "applied", date: p.appliedDate }],
    schedules: [],
    ...p,
  });
  return [
    mk({
      id: "tokopedia", company: "Tokopedia", position: "Junior Data Analyst", location: "Jakarta Selatan",
      source: "LinkedIn", appliedDate: day(2026, 9, 19), salary: 7000000, status: "applied",
      url: "https://www.tokopedia.com/careers", lastUpdated: subBusinessDays(now, 8),
    }),
    mk({
      id: "telkom", company: "Telkom Indonesia", position: "Software Engineer", location: "Bandung",
      source: "JobStreet", appliedDate: day(2026, 9, 21), salary: 8000000, status: "applied",
      schedules: [{ id: "s-telkom", type: "Tes", at: day(2026, 10, 2, 19, 27), remind: "1 hari sebelumnya" }],
    }),
    mk({
      id: "unilever", company: "Unilever", position: "Marketing Trainee", location: "Tangerang",
      source: "Situs perusahaan", appliedDate: day(2026, 9, 24), status: "screening",
      history: [{ status: "applied", date: day(2026, 9, 24) }, { status: "screening", date: day(2026, 9, 30) }],
    }),
    mk({
      id: "gojek", company: "Gojek", position: "Associate Product Manager", location: "Jakarta Selatan",
      source: "Glints", appliedDate: day(2026, 9, 10), salary: 9500000, status: "interview",
      history: [{ status: "applied", date: day(2026, 9, 10) }, { status: "interview", date: day(2026, 9, 22) }],
      schedules: [{ id: "s-gojek", type: "Wawancara", at: hrs(20), remind: "1 jam sebelumnya" }],
    }),
    mk({
      id: "bca", company: "Bank BCA", position: "Management Trainee", location: "Jakarta Pusat",
      source: "Situs perusahaan", appliedDate: day(2026, 9, 8), status: "interview",
      history: [{ status: "applied", date: day(2026, 9, 8) }, { status: "interview", date: day(2026, 9, 20) }],
      schedules: [{ id: "s-bca", type: "Tes", at: hrs(39), remind: "1 hari sebelumnya" }],
    }),
    mk({
      id: "traveloka", company: "Traveloka", position: "UI/UX Designer", location: "Tangerang",
      source: "Kalibrr", appliedDate: day(2026, 8, 28), salary: 10000000, status: "offer",
      history: [
        { status: "applied", date: day(2026, 8, 28) },
        { status: "interview", date: day(2026, 9, 6) },
        { status: "offer", date: day(2026, 9, 26) },
      ],
    }),
    mk({
      id: "shopee", company: "Shopee", position: "Business Analyst", location: "Jakarta Barat",
      source: "LinkedIn", appliedDate: day(2026, 8, 30), status: "rejected",
      history: [{ status: "applied", date: day(2026, 8, 30) }, { status: "rejected", date: day(2026, 9, 15) }],
    }),
  ];
}

/** Lamaran dummy teman sekelas, hanya untuk pemantauan Guru BK. */
export function seedClassmates(now = new Date()): Application[] {
  const day = (m: number, d: number) => new Date(2026, m, d, 9);
  const recent = (days: number) => new Date(now.getTime() - days * 86400000);
  type Row = [string, string, string, string, string, Status[], number, number, number?];
  const rows: Row[] = [
    ["dimas", "Indosat Ooredoo", "Network Engineer Trainee", "Jakarta Pusat", "JobStreet", ["applied", "screening", "interview"], 9, 12, 2],
    ["dimas", "Biznet", "Teknisi Jaringan", "Jakarta Selatan", "Situs perusahaan", ["applied"], 9, 25, 5],
    ["dimas", "XL Axiata", "NOC Engineer", "Jakarta Selatan", "LinkedIn", ["applied", "rejected"], 8, 30, 10],
    ["siti", "Bank Mandiri", "Staf Administrasi Keuangan", "Jakarta Pusat", "Situs perusahaan", ["applied", "screening", "interview", "offer", "accepted"], 8, 20, 3],
    ["siti", "Alfamart", "Admin Keuangan", "Tangerang", "JobStreet", ["applied", "interview", "offer"], 9, 1, 6],
    ["bagus", "Bukalapak", "Junior Frontend Developer", "Jakarta Selatan", "Glints", ["applied", "screening"], 9, 15, 4],
    ["bagus", "Blibli", "QA Tester", "Jakarta Barat", "LinkedIn", ["applied"], 9, 22, 7],
    ["bagus", "Tiket.com", "Web Developer Intern", "Jakarta Barat", "Kalibrr", ["applied", "rejected"], 8, 25, 14],
    ["bagus", "Ruangguru", "Junior Programmer", "Jakarta Selatan", "Glints", ["applied", "interview", "rejected"], 8, 18, 9],
    ["ayu", "Erajaya", "Digital Marketing Staff", "Jakarta Utara", "LinkedIn", ["applied", "interview", "offer"], 9, 5, 1],
    ["nadia", "Telkomsigma", "Junior Software Developer", "Tangerang Selatan", "Situs perusahaan", ["applied", "screening", "interview", "offer", "accepted"], 8, 15, 2],
    ["nadia", "Astra International", "IT Support", "Jakarta Utara", "JobStreet", ["applied", "interview"], 9, 18, 3],
  ];
  return rows.map(([studentId, company, position, location, source, path, m, d, ago = 3], i) => {
    const appliedDate = day(m, d);
    return {
      id: `c${i + 1}`, studentId, company, position, location, source, appliedDate,
      status: path[path.length - 1]!,
      lastUpdated: recent(ago),
      history: path.map((status, j) => ({ status, date: new Date(appliedDate.getTime() + j * 6 * 86400000) })),
      schedules: [],
    };
  });
}

export const COMPANY_PROFILE: Record<string, string> = {
  gojek:
    "Gojek adalah platform teknologi asal Indonesia yang menyediakan layanan transportasi, pesan-antar makanan, dan pembayaran digital. Kini menjadi bagian dari GoTo Group dan melayani jutaan pengguna di Asia Tenggara. Fokus produk saat ini: efisiensi layanan dan pertumbuhan GoPay.",
};

export interface KanbanFilter {
  q: string;
  statuses: Status[];
  source: string;
  from: string; // "YYYY-MM-DD" atau ""
  to: string;
}
export const EMPTY_FILTER: KanbanFilter = { q: "", statuses: [], source: "", from: "", to: "" };

const parseDay = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

export const activeFilterCount = (f: KanbanFilter) =>
  (f.q.trim() ? 1 : 0) + (f.statuses.length ? 1 : 0) + (f.source ? 1 : 0) + (f.from || f.to ? 1 : 0);

/** Menyaring tanpa mengubah array/objek asli. Semua kriteria digabung (AND). */
export function filterApps(apps: Application[], f: KanbanFilter): Application[] {
  const q = f.q.trim().toLowerCase();
  const from = f.from ? parseDay(f.from) : null;
  const toDay = f.to ? parseDay(f.to) : null;
  const to = toDay ? new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate() + 1) : null;
  return apps.filter((a) => {
    if (q && !a.company.toLowerCase().includes(q) && !a.position.toLowerCase().includes(q)) return false;
    if (f.statuses.length && !f.statuses.includes(a.status)) return false;
    if (f.source && a.source !== f.source) return false;
    if (from && a.appliedDate < from) return false;
    if (to && a.appliedDate >= to) return false;
    return true;
  });
}
