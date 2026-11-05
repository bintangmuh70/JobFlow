import { useState, type ReactNode } from "react";
import {
  LogOut,
  Users,
  LayoutDashboard,
  LineChart,
  PieChart,
  UserRound,
  ArrowLeft,
  Building2,
  Search,
} from "lucide-react";
import { Header, Card, Btn, StatusBadge, Empty } from "./ui";
import { useStore } from "./store";
import { STATUSES, STATUS_LABEL, fmtDate, type Status } from "./data";
import { SITE_CONFIG } from "@/lib/constants";

export function GuruShell({ children }: { children: ReactNode }) {
  const { user, logout, screen, replace } = useStore();
  const [confirmOut, setConfirmOut] = useState(false);

  const navItems = [
    { name: "gb-dashboard" as const, label: "Dasbor", icon: LayoutDashboard },
    { name: "gb-students" as const, label: "Data Siswa", icon: Users },
    { name: "gb-progress" as const, label: "Progres", icon: LineChart },
    { name: "gb-stats" as const, label: "Statistik", icon: PieChart },
    { name: "gb-profile" as const, label: "Profil", icon: UserRound },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header
        big
        title={user?.name ?? `Portal Guru BK · ${SITE_CONFIG.name}`}
        subtitle={user?.school ?? "Pemantauan Karier Siswa"}
        right={
          <button
            aria-label="Keluar"
            onClick={() => setConfirmOut(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25"
          >
            <LogOut className="h-5 w-5" />
          </button>
        }
      >
        <nav className="mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = screen.name === item.name;
            return (
              <button
                key={item.name}
                onClick={() => replace({ name: item.name })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </Header>

      <main className="px-5 pt-6 md:px-8">{children}</main>

      {confirmOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-5">
          <div className="w-full max-w-[360px] rounded-2xl bg-card p-5 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              Keluar dari Portal Guru {SITE_CONFIG.name}?
            </h2>
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
                  logout();
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
  const totalApps = allApps.length;
  const acceptedApps = allApps.filter((a) => a.status === "accepted").length;
  const interviewApps = allApps.filter(
    (a) => a.status === "interview" || a.status === "offer",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Siswa Binaan
          </span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">
            {students.length}
          </span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Lamaran Terkirim
          </span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">
            {totalApps}
          </span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">
            Tahap Seleksi Aktif
          </span>
          <span className="mt-1 text-2xl font-extrabold text-primary">
            {interviewApps}
          </span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">
            Siswa Diterima Kerja
          </span>
          <span className="mt-1 text-2xl font-extrabold text-success-foreground">
            {acceptedApps}
          </span>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Aktivitas Lamaran Terbaru
        </h2>
        <div className="space-y-2">
          {allApps.slice(0, 6).map((app) => {
            const student = students.find((s) => s.id === app.studentId);
            return (
              <Card
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground">
                    {student?.name ?? "Siswa"} ·{" "}
                    <span className="text-muted-foreground font-normal">
                      {app.company}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.position} · Dilamar pada {fmtDate(app.appliedDate)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function GuruStudents() {
  const { students, allApps, go } = useStore();
  const [q, setQ] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      (s.major && s.major.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama siswa atau jurusan..."
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="space-y-2.5">
        {filtered.map((s) => {
          const studentApps = allApps.filter((a) => a.studentId === s.id);
          const accepted = studentApps.some((a) => a.status === "accepted");
          return (
            <Card
              key={s.id}
              onClick={() => go({ name: "gb-student", id: s.id })}
              className="flex items-center justify-between cursor-pointer hover:border-primary"
            >
              <div>
                <p className="font-bold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.major ?? "Umum"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground">
                  {studentApps.length} lamaran
                </span>
                {accepted && (
                  <span className="ml-2 rounded-full bg-accepted px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Diterima
                  </span>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Empty text="Tidak ada siswa yang cocok dengan pencarian." />
        )}
      </div>
    </div>
  );
}

export function GuruStudentDetail({ id }: { id: string }) {
  const { students, allApps, back } = useStore();
  const student = students.find((s) => s.id === id);
  const apps = allApps.filter((a) => a.studentId === id);

  if (!student) {
    return (
      <div className="space-y-4">
        <button
          onClick={back}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Data Siswa
        </button>
        <Empty text="Data siswa tidak ditemukan." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={back}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Data Siswa
      </button>

      <Card>
        <h1 className="text-lg font-bold text-foreground">{student.name}</h1>
        <p className="text-xs text-muted-foreground">
          {student.major} · {student.school}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{student.email}</p>
      </Card>

      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Daftar Lamaran ({apps.length})
        </h2>
        <div className="space-y-2">
          {apps.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{a.company}</p>
                <p className="text-xs text-muted-foreground">{a.position}</p>
              </div>
              <StatusBadge status={a.status} />
            </Card>
          ))}
          {apps.length === 0 && (
            <Empty text="Belum ada lamaran yang tercatat untuk siswa ini." />
          )}
        </div>
      </section>
    </div>
  );
}

export function GuruProgress() {
  const { allApps, students } = useStore();

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-foreground">
        Distribusi Tahapan Seluruh Siswa
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STATUSES.map((status: Status) => {
          const count = allApps.filter((a) => a.status === status).length;
          return (
            <Card key={status} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {STATUS_LABEL[status]}
                </p>
                <p className="text-xs text-muted-foreground">{count} lamaran</p>
              </div>
              <StatusBadge status={status} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function GuruStats() {
  const { allApps, students } = useStore();
  const total = allApps.length || 1;
  const accepted = allApps.filter((a) => a.status === "accepted").length;
  const rate = Math.round((accepted / total) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold text-foreground">Tingkat Penerimaan Kerja</h2>
        <p className="mt-2 text-3xl font-extrabold text-primary">{rate}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {accepted} dari {allApps.length} lamaran berhasil mendapatkan tawaran
          kerja (Diterima).
        </p>
      </Card>
    </div>
  );
}

export function GuruProfile() {
  const { user } = useStore();

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h2 className="text-base font-bold text-foreground">
          Profil Pendidik BK
        </h2>
        <p className="text-sm font-semibold text-foreground">
          Nama: {user?.name}
        </p>
        <p className="text-sm text-muted-foreground">NIP: {user?.nip ?? "—"}</p>
        <p className="text-sm text-muted-foreground">Sekolah: {user?.school}</p>
        <p className="text-sm text-muted-foreground">Surel: {user?.email}</p>
        <p className="text-sm text-muted-foreground">
          Telepon: {user?.phone ?? "—"}
        </p>
      </Card>
    </div>
  );
}
