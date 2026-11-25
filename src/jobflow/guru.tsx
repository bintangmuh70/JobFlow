import { useEffect, useState, type ReactNode } from "react";
import {
  LogOut,
  Users,
  LayoutDashboard,
  LineChart,
  PieChart,
  UserRound,
  ArrowLeft,
  Search,
  Download,
  RefreshCw,
  Send,
  Trash2,
  MessageSquareText,
  MapPin,
  Calendar,
  Briefcase,
  KeyRound,
  Copy,
  Building2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { Header, Card, Btn, Field, Input, Select, StatusBadge, Empty } from "./ui";
import { useStore } from "./store";
import {
  STATUSES,
  STATUS_LABEL,
  STAGES,
  STAGE_LABEL,
  fmtDate,
  furthestStage,
  placementStats,
  type Stage,
  type Status,
} from "./data";
import { downloadCsv } from "./calendar";
import { SCHOOL_NAME, SCHOOL_SHORT_NAME, SITE_CONFIG, STUDENT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAGE_PILL: Record<Stage, string> = {
  none: "bg-muted text-muted-foreground",
  searching: "bg-info-soft text-info-foreground",
  interview: "bg-warning-soft text-warning-foreground",
  offer: "bg-success-soft text-success-foreground",
  accepted: "bg-accepted text-primary-foreground",
};

const STAGE_DOT: Record<Stage, string> = {
  none: "bg-muted-foreground/40",
  searching: "bg-info-foreground",
  interview: "bg-warning",
  offer: "bg-success",
  accepted: "bg-accepted",
};

const BAR_COLORS: Record<Status, string> = {
  applied: "#3b82f6",
  screening: "#06b6d4",
  interview: "#f59e0b",
  offer: "#10b981",
  accepted: "#4f46e5",
  rejected: "#ef4444",
};

const GURU_PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "gb-dashboard": { title: "Dasbor Monitoring", subtitle: `Ringkasan karier siswa ${SCHOOL_NAME}` },
  "gb-students": { title: "Data Siswa Binaan", subtitle: `Daftar siswa & alumni ${SCHOOL_NAME}` },
  "gb-student": { title: "Detail Siswa", subtitle: `Progres lamaran & catatan bimbingan BK` },
  "gb-progress": { title: "Progres Lamaran", subtitle: "Pantau seluruh lamaran berdasarkan tahapan seleksi" },
  "gb-stats": { title: "Statistik Penempatan", subtitle: `Rekap penempatan kerja per jurusan ${SCHOOL_NAME}` },
  "gb-profile": { title: "Profil & Kode Akses", subtitle: "Kelola profil Guru BK dan kode pendaftaran SMKN 53" },
};

export function GuruShell({ children }: { children: ReactNode }) {
  const { user, logout, screen, replace, refreshWorkspace, students } = useStore();
  const [confirmOut, setConfirmOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navItems = [
    { name: "gb-dashboard" as const, label: "Dasbor", icon: LayoutDashboard, badge: null as number | null },
    { name: "gb-students" as const, label: "Data Siswa", icon: Users, badge: students.length || null },
    { name: "gb-progress" as const, label: "Progres Lamaran", icon: LineChart, badge: null as number | null },
    { name: "gb-stats" as const, label: "Statistik", icon: PieChart, badge: null as number | null },
    { name: "gb-profile" as const, label: "Profil & Kode", icon: UserRound, badge: null as number | null },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWorkspace();
    setRefreshing(false);
    toast.success("Data siswa diperbarui");
  };

  const pageMeta = GURU_PAGE_META[screen.name] ?? GURU_PAGE_META["gb-dashboard"]!;
  const initials = (user?.name ?? "BK")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background font-sans lg:flex">
      {/* Sidebar Desktop Guru BK */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card xl:w-72">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold leading-none tracking-tight text-foreground">
              {SITE_CONFIG.name} <span className="text-xs font-bold text-primary">BK</span>
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">{SCHOOL_SHORT_NAME}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi Guru BK">
          {navItems.map((item) => {
            const active = screen.name === item.name || (item.name === "gb-students" && screen.name === "gb-student");
            return (
              <button
                key={item.name}
                onClick={() => replace({ name: item.name })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{user?.name ?? "Guru BK"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{SCHOOL_SHORT_NAME}</p>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Segarkan
            </button>
            <button
              type="button"
              onClick={() => setConfirmOut(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-danger-foreground hover:border-destructive hover:bg-danger-soft"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="min-w-0 flex-1 pb-12">
        <div className="mx-auto w-full max-w-[1360px]">
          <Header
            title={pageMeta.title}
            subtitle={pageMeta.subtitle}
            right={
              <div className="flex items-center gap-2">
                <button
                  aria-label="Segarkan data"
                  onClick={() => void handleRefresh()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 lg:hidden"
                >
                  <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
                </button>
                <button
                  aria-label="Keluar"
                  onClick={() => setConfirmOut(true)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 lg:hidden"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            }
          >
            {/* Navigasi pil khusus Mobile (< lg) */}
            <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {navItems.map((item) => {
                const active =
                  screen.name === item.name || (item.name === "gb-students" && screen.name === "gb-student");
                return (
                  <button
                    key={item.name}
                    onClick={() => replace({ name: item.name })}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Header>

          <main className="px-5 pt-6 md:px-8">{children}</main>
        </div>
      </div>

      {confirmOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-5">
          <div className="w-full max-w-[360px] rounded-2xl bg-card p-5 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Keluar dari Portal Guru {SITE_CONFIG.name}?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Anda harus masuk kembali untuk memantau data siswa.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Btn variant="outline" onClick={() => setConfirmOut(false)}>
                Batal
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  setConfirmOut(false);
                  void logout();
                }}
              >
                Keluar
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GuruDashboard() {
  const { students, allApps, go } = useStore();
  const ps = placementStats(students, allApps);
  const interviewApps = allApps.filter((a) => a.status === "interview" || a.status === "offer").length;

  const chartData = STATUSES.map((s) => ({
    status: s,
    name: STATUS_LABEL[s],
    jumlah: allApps.filter((a) => a.status === s).length,
  }));

  const exportSummary = () => {
    downloadCsv(
      "rekap-lamaran-smkn53-jakarta.csv",
      ["Nama Siswa", "Status Siswa", "Jurusan", "Email", "Perusahaan", "Posisi", "Sumber", "Status", "Tanggal Melamar"],
      allApps.map((a) => {
        const st = students.find((s) => s.id === a.studentId);
        return [
          st?.name ?? "-",
          st?.studentStatus ?? "Kelas XII",
          st?.major ?? "-",
          st?.email ?? "-",
          a.company,
          a.position,
          a.source,
          STATUS_LABEL[a.status],
          fmtDate(a.appliedDate),
        ];
      }),
    );
    toast.success("Rekap lamaran (CSV) berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Ikhtisar BKK {SCHOOL_NAME}</h2>
          <p className="text-xs text-muted-foreground">Data real-time seluruh siswa & alumni binaan</p>
        </div>
        <Btn size="sm" variant="outline" onClick={exportSummary} disabled={allApps.length === 0}>
          <Download className="h-4 w-4" /> Export Rekap CSV
        </Btn>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">Total Siswa Binaan</span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">{students.length}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">Total Lamaran Terkirim</span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">{allApps.length}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">Tahap Interview / Offering</span>
          <span className="mt-1 text-2xl font-extrabold text-primary">{interviewApps}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">Siswa Diterima Kerja</span>
          <span className="mt-1 text-2xl font-extrabold text-success-foreground">
            {ps.placed} <span className="text-sm font-semibold text-muted-foreground">({ps.placementPct}%)</span>
          </span>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <h3 className="mb-4 text-base font-bold text-foreground">Distribusi Lamaran per Tahapan</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="jumlah" name="Jumlah lamaran" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={BAR_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-bold text-foreground">Aktivitas Lamaran Terbaru</h3>
          <div className="space-y-2">
            {allApps.slice(0, 6).map((app) => {
              const student = students.find((s) => s.id === app.studentId);
              return (
                <button
                  key={app.id}
                  onClick={() => go({ name: "gb-student", id: app.studentId })}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {student?.name ?? "Siswa"} ·{" "}
                      <span className="font-normal text-muted-foreground">{app.company}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.position} · {fmtDate(app.appliedDate)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </button>
              );
            })}
            {allApps.length === 0 && <Empty text="Belum ada lamaran yang tercatat dari siswa." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function GuruStudents() {
  const { students, allApps, go } = useStore();
  const [q, setQ] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const majors = Array.from(new Set(students.map((s) => s.major).filter((m): m is string => Boolean(m)))).sort();

  const enriched = students.map((s) => {
    const apps = allApps.filter((a) => a.studentId === s.id);
    const stage = furthestStage(apps);
    return { student: s, apps, stage };
  });

  const filtered = enriched.filter(({ student, stage }) => {
    const query = q.trim().toLowerCase();
    if (
      query &&
      !student.name.toLowerCase().includes(query) &&
      !student.email.toLowerCase().includes(query) &&
      !(student.major ?? "").toLowerCase().includes(query)
    ) {
      return false;
    }
    if (majorFilter && student.major !== majorFilter) return false;
    if (stageFilter && stage !== stageFilter) return false;
    if (statusFilter && (student.studentStatus ?? "Kelas XII") !== statusFilter) return false;
    return true;
  });

  const exportStudents = () => {
    downloadCsv(
      "data-siswa-smkn53-jakarta.csv",
      ["Nama", "Status", "Email", "Telepon", "Jurusan", "Total Lamaran", "Tahap Karier Terjauh"],
      filtered.map(({ student, apps, stage }) => [
        student.name,
        student.studentStatus ?? "Kelas XII",
        student.email,
        student.phone ?? "-",
        student.major ?? "-",
        apps.length,
        STAGE_LABEL[stage],
      ]),
    );
    toast.success("Data siswa (CSV) berhasil diunduh");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-bold text-foreground">{filtered.length}</span> dari {students.length} siswa
        </p>
        <Btn size="sm" variant="outline" onClick={exportStudents} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Btn>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, atau jurusan…"
            className="pl-10"
          />
        </div>
        <Select
          ariaLabel="Filter jurusan"
          value={majorFilter}
          onChange={setMajorFilter}
          options={[{ value: "", label: "Semua jurusan" }, ...majors.map((m) => ({ value: m, label: m }))]}
        />
        <Select
          ariaLabel="Filter status siswa"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "Kelas XII & Alumni" },
            ...STUDENT_STATUSES.map((st) => ({ value: st, label: st })),
          ]}
        />
        <Select
          ariaLabel="Filter tahap karier"
          value={stageFilter}
          onChange={setStageFilter}
          options={[
            { value: "", label: "Semua tahap" },
            ...STAGES.map((st) => ({ value: st, label: STAGE_LABEL[st] })),
          ]}
        />
      </div>

      <div className="space-y-2.5">
        {filtered.map(({ student, apps, stage }) => (
          <Card
            key={student.id}
            onClick={() => go({ name: "gb-student", id: student.id })}
            className="flex flex-wrap items-center justify-between gap-3 hover:border-primary"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-foreground">{student.name}</p>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {student.studentStatus ?? "Kelas XII"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {student.major ?? "Umum"} · {student.email}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-muted-foreground">{apps.length} lamaran</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                  STAGE_PILL[stage],
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    stage === "accepted" ? "bg-primary-foreground" : STAGE_DOT[stage],
                  )}
                />
                {STAGE_LABEL[stage]}
              </span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <Empty text="Tidak ada siswa yang cocok dengan filter pencarian." />}
      </div>
    </div>
  );
}

export function GuruStudentDetail({ id }: { id: string }) {
  const { students, allApps, back, guidanceNotes, addGuidanceNote, removeGuidanceNote } = useStore();
  const student = students.find((s) => s.id === id);
  const apps = allApps.filter((a) => a.studentId === id);
  const notes = guidanceNotes.filter((n) => n.studentId === id);
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);

  if (!student) {
    return (
      <div className="space-y-4">
        <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Data Siswa
        </button>
        <Empty text="Data siswa tidak ditemukan." />
      </div>
    );
  }

  const sendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSending(true);
    const ok = await addGuidanceNote(student.id, noteText);
    setSending(false);
    if (ok) setNoteText("");
  };

  return (
    <div className="space-y-5">
      <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Data Siswa
      </button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-extrabold text-foreground">{student.name}</h1>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                {student.studentStatus ?? "Kelas XII"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.major ?? "Umum"} · {SCHOOL_NAME}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {student.email}
              {student.phone ? ` · ${student.phone}` : ""}
            </p>
          </Card>

          <section>
            <h2 className="mb-3 text-base font-bold text-foreground">Daftar Lamaran ({apps.length})</h2>
            <div className="space-y-2.5">
              {apps.map((a) => (
                <Card key={a.id} className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-foreground">{a.company}</p>
                      <p className="text-sm text-muted-foreground">{a.position}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {a.location || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Dilamar {fmtDate(a.appliedDate)}
                    </span>
                    <span>Sumber: {a.source}</span>
                  </div>
                </Card>
              ))}
              {apps.length === 0 && <Empty text="Belum ada lamaran yang tercatat untuk siswa ini." />}
            </div>
          </section>
        </div>

        <Card className="h-fit space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Catatan Bimbingan BK</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Catatan yang dikirim akan langsung tampil di halaman beranda siswa ini.
          </p>
          <form onSubmit={sendNote} className="space-y-2.5">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={`Tulis saran atau tindak lanjut untuk ${student.name}…`}
              className="w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <Btn type="submit" size="sm" disabled={sending || !noteText.trim()} className="w-full">
              <Send className="h-4 w-4" /> {sending ? "Mengirim…" : "Kirim catatan bimbingan"}
            </Btn>
          </form>

          <div className="space-y-2 border-t border-border pt-3">
            {notes.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">Belum ada catatan bimbingan.</p>
            )}
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{n.guruName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{fmtDate(n.createdAt)}</span>
                    <button
                      aria-label="Hapus catatan"
                      onClick={() => void removeGuidanceNote(n.id)}
                      className="text-danger-foreground hover:opacity-80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{n.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function GuruProgress() {
  const { allApps, students, go } = useStore();
  const [activeStatus, setActiveStatus] = useState<Status | "all">("all");

  const shown = activeStatus === "all" ? allApps : allApps.filter((a) => a.status === activeStatus);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Filter Berdasarkan Tahapan Seleksi</h2>
        {activeStatus !== "all" && (
          <Btn size="sm" variant="ghost" onClick={() => setActiveStatus("all")}>
            Tampilkan semua
          </Btn>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STATUSES.map((status) => {
          const count = allApps.filter((a) => a.status === status).length;
          const selected = activeStatus === status;
          return (
            <Card
              key={status}
              onClick={() => setActiveStatus(selected ? "all" : status)}
              className={cn(
                "flex items-center justify-between border-2 transition-colors",
                selected ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary",
              )}
            >
              <div>
                <p className="text-sm font-bold text-foreground">{STATUS_LABEL[status]}</p>
                <p className="text-xs text-muted-foreground">{count} lamaran</p>
              </div>
              <StatusBadge status={status} />
            </Card>
          );
        })}
      </div>

      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-muted-foreground">
          {activeStatus === "all"
            ? `Semua Lamaran (${shown.length})`
            : `Tahap ${STATUS_LABEL[activeStatus]} (${shown.length})`}
        </h3>
        {shown.map((a) => {
          const st = students.find((s) => s.id === a.studentId);
          return (
            <Card
              key={a.id}
              onClick={() => go({ name: "gb-student", id: a.studentId })}
              className="flex flex-wrap items-center justify-between gap-3 hover:border-primary"
            >
              <div className="min-w-0">
                <p className="font-bold text-foreground">
                  {st?.name ?? "Siswa"} · <span className="font-semibold text-primary">{a.company}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.position} · {st?.major ?? "Umum"} · Diperbarui {fmtDate(a.lastUpdated)}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </Card>
          );
        })}
        {shown.length === 0 && <Empty text="Belum ada lamaran pada tahap ini." />}
      </section>
    </div>
  );
}

export function GuruStats() {
  const { allApps, students } = useStore();
  const ps = placementStats(students, allApps);

  const majors = Array.from(new Set(students.map((s) => s.major || "Umum"))).sort();
  const majorChartData = majors.map((major) => {
    const group = students.filter((s) => (s.major || "Umum") === major);
    const ids = new Set(group.map((s) => s.id));
    const groupApps = allApps.filter((a) => ids.has(a.studentId));
    const placedCount = group.filter((s) =>
      groupApps.some((a) => a.studentId === s.id && a.status === "accepted"),
    ).length;
    return {
      jurusan: major.length > 18 ? `${major.slice(0, 16)}…` : major,
      fullJurusan: major,
      siswa: group.length,
      diterima: placedCount,
      lamaran: groupApps.length,
    };
  });

  const exportReport = () => {
    downloadCsv(
      "laporan-penempatan-smkn53-jakarta.csv",
      ["Jurusan", "Jumlah Siswa", "Total Lamaran", "Siswa Diterima", "Persentase Diterima"],
      majorChartData.map((m) => [
        m.fullJurusan,
        m.siswa,
        m.lamaran,
        m.diterima,
        `${m.siswa ? Math.round((m.diterima / m.siswa) * 100) : 0}%`,
      ]),
    );
    toast.success("Laporan penempatan (CSV) diunduh");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Rekap Penempatan {SCHOOL_NAME}</h2>
        <Btn size="sm" variant="outline" onClick={exportReport} disabled={students.length === 0}>
          <Download className="h-4 w-4" /> Export Laporan CSV
        </Btn>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold text-muted-foreground">Persentase Siswa Diterima</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">{ps.placementPct}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ps.placed} dari {ps.students} siswa telah diterima kerja.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-muted-foreground">Aktif Melamar</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{ps.active}</p>
          <p className="mt-1 text-xs text-muted-foreground">{ps.stageCount.none} siswa belum mencatat lamaran.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-muted-foreground">Rata-rata Lamaran / Siswa</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {students.length ? (allApps.length / students.length).toFixed(1) : "0"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Total {allApps.length} lamaran tercatat.</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-bold text-foreground">Penempatan & Lamaran per Jurusan</h3>
          {majorChartData.length === 0 ? (
            <Empty text="Belum ada data jurusan siswa." />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={majorChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="jurusan" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="siswa" name="Total siswa" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="diterima" name="Diterima kerja" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-bold text-foreground">Tahap Karier Terjauh Siswa</h3>
          <div className="space-y-2.5">
            {(["accepted", "offer", "interview", "searching", "none"] as const).map((stage) => {
              const count = ps.stageCount[stage];
              const pct = ps.students ? Math.round((count / ps.students) * 100) : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_DOT[stage])} />
                      {STAGE_LABEL[stage]}
                    </span>
                    <span className="text-muted-foreground">
                      {count} siswa ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function GuruProfile() {
  const { user, updateProfile, registrationCode, updateRegistrationCode, changePassword } = useStore();
  const [f, setF] = useState({
    name: user?.name ?? "",
    nip: user?.nip ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [newCode, setNewCode] = useState(registrationCode);
  const [savingCode, setSavingCode] = useState(false);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    setNewCode(registrationCode);
  }, [registrationCode]);

  useEffect(() => {
    if (user) {
      setF({
        name: user.name ?? "",
        nip: user.nip ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSaving(true);
    await updateProfile({
      name: f.name,
      nip: f.nip,
      phone: f.phone,
    });
    setSaving(false);
  };

  const saveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.trim().length < 4) {
      toast.error("Kode akses minimal 4 karakter");
      return;
    }
    setSavingCode(true);
    await updateRegistrationCode(newCode);
    setSavingCode(false);
  };

  const savePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) {
      toast.error("Kata sandi minimal 8 karakter");
      return;
    }
    if (pw !== pw2) {
      toast.error("Konfirmasi kata sandi tidak sama");
      return;
    }
    setSavingPw(true);
    const err = await changePassword(pw);
    setSavingPw(false);
    if (err) {
      toast.error(err);
      return;
    }
    setPw("");
    setPw2("");
    toast.success("Kata sandi berhasil diperbarui");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="text-base font-bold text-foreground">Profil Pendidik BK</h2>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary">
          <Building2 className="h-4 w-4 shrink-0" /> {SCHOOL_NAME} (Eksklusif)
        </div>
        <form onSubmit={save} className="mt-4 space-y-4">
          <Field label="Nama lengkap *">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Surel (tidak dapat diubah)">
            <Input value={user?.email ?? ""} disabled />
          </Field>
          <Field label="NIP">
            <Input
              value={f.nip}
              onChange={(e) => setF({ ...f, nip: e.target.value })}
              placeholder="19800512 200501 2 004"
            />
          </Field>
          <Field label="Telepon / WhatsApp">
            <Input
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              placeholder="0813-xxxx-xxxx"
            />
          </Field>
          <Btn type="submit" disabled={saving} className="w-full">
            {saving ? "Menyimpan…" : "Simpan perubahan profil"}
          </Btn>
        </form>
      </Card>

      <div className="space-y-5">
        {/* Kelola Kode Akses Eksklusif SMKN 53 */}
        <Card>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Kode Akses Pendaftaran Siswa</h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Bagikan kode ini khusus kepada siswa & alumni {SCHOOL_NAME} agar hanya warga sekolah yang dapat mendaftar.
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Kode aktif saat ini</p>
              <p className="font-mono text-lg font-extrabold tracking-widest text-primary">{registrationCode}</p>
            </div>
            <Btn
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(registrationCode).catch(() => {});
                toast.success("Kode akses disalin");
              }}
            >
              <Copy className="h-4 w-4" /> Salin
            </Btn>
          </div>

          <form onSubmit={saveCode} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="Contoh: SMKN53-2026"
              className="font-mono uppercase tracking-wider"
            />
            <Btn type="submit" disabled={savingCode} className="shrink-0">
              {savingCode ? "Menyimpan…" : "Ubah Kode"}
            </Btn>
          </form>
        </Card>

        {/* Ubah Kata Sandi */}
        <Card>
          <h2 className="text-base font-bold text-foreground">Ubah Kata Sandi</h2>
          <form onSubmit={savePw} className="mt-3.5 space-y-3">
            <Field label="Kata sandi baru" hint="Minimal 8 karakter">
              <Input
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </Field>
            <Field label="Konfirmasi kata sandi">
              <Input
                type="password"
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Ulangi kata sandi baru"
              />
            </Field>
            <Btn type="submit" variant="outline" disabled={savingPw} className="w-full">
              {savingPw ? "Memperbarui…" : "Perbarui Kata Sandi"}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function GuruPortal() {
  const { screen } = useStore();
  return (
    <GuruShell>
      {screen.name === "gb-dashboard" && <GuruDashboard />}
      {screen.name === "gb-students" && <GuruStudents />}
      {screen.name === "gb-student" && <GuruStudentDetail key={screen.id} id={screen.id} />}
      {screen.name === "gb-progress" && <GuruProgress />}
      {screen.name === "gb-stats" && <GuruStats />}
      {screen.name === "gb-profile" && <GuruProfile />}
    </GuruShell>
  );
}
