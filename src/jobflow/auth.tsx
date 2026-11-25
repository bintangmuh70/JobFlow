import { useState, type ReactNode } from "react";
import {
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  UserRound,
  ShieldCheck,
  Columns3,
  CalendarClock,
  LineChart,
  ArrowLeft,
  MailCheck,
  Loader2,
  Building2,
  KeyRound,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Btn, Field, Input, Modal, Select } from "./ui";
import { useStore } from "./store";
import type { Role } from "./data";
import { SCHOOL_NAME, SITE_CONFIG, SMKN53_MAJORS, STUDENT_STATUSES } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PasswordInput({
  value,
  onChange,
  err,
  placeholder,
  id,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  err?: boolean | undefined;
  placeholder: string;
  id?: string | undefined;
  autoComplete?: string | undefined;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        err={err}
        placeholder={placeholder}
        className="pr-12"
      />
      <button
        type="button"
        aria-label={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        onClick={() => setShow(!show)}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  const highlights = [
    {
      icon: Columns3,
      title: "Pelacakan Lamaran Terstruktur",
      desc: "Pantau progres dari Applied, Screening, Interview, Offering hingga Diterima dalam satu papan Kanban.",
    },
    {
      icon: CalendarClock,
      title: "Radar Jadwal & Sinkron Kalender",
      desc: "Catat jadwal tes dan wawancara lengkap dengan pengingat serta ekspor langsung ke Google Calendar.",
    },
    {
      icon: LineChart,
      title: "Bimbingan Langsung Guru BK",
      desc: "Terhubung langsung dengan Bursa Kerja Khusus (BKK) dan Guru BK untuk arahan karier dan rekap penempatan.",
    },
  ];

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
      {/* Panel Identitas Resmi SMK Negeri 53 Jakarta */}
      <aside className="bg-header relative flex flex-col justify-between overflow-hidden px-6 py-8 text-primary-foreground sm:px-10 lg:px-14 lg:py-12 xl:px-16">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-primary-foreground/5" />

        {/* Brand & Badge Sekolah */}
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground text-primary shadow-md">
              <Briefcase className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <div>
              <span className="block text-xl font-extrabold leading-none tracking-tight">{SITE_CONFIG.name}</span>
              <span className="mt-1 block text-xs font-semibold text-primary-foreground/80">
                BKK {SCHOOL_NAME}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" /> Portal Eksklusif Sekolah
          </span>
        </div>

        {/* Hero Copy & Keunggulan Nyata */}
        <div className="relative my-8 max-w-xl lg:my-10">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl xl:text-[40px]">
            Portal Karier & Pelacak Lamaran Kerja {SCHOOL_NAME}.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85 sm:text-[15px]">
            Digunakan khusus bagi siswa tingkat akhir, alumni, dan Guru BK {SCHOOL_NAME} untuk mencatat proses seleksi
            kerja secara rapi dan terpantau.
          </p>

          <div className="mt-7 hidden space-y-3 lg:block">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex items-start gap-3.5 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/15">
                  <h.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-snug">{h.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/80">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info Sekolah */}
        <div className="relative hidden flex-wrap items-center gap-x-5 gap-y-2 border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/75 lg:flex">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {SITE_CONFIG.contact.address.full}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" /> {SITE_CONFIG.contact.workingHours}
          </span>
        </div>
      </aside>

      {/* Panel Form Masuk / Daftar */}
      <main className="flex items-start justify-center px-5 py-8 sm:px-8 lg:items-center lg:px-12 lg:py-12">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}

const ROLES: { value: Role; label: string; icon: typeof UserRound }[] = [
  { value: "siswa", label: "Siswa / Alumni", icon: GraduationCap },
  { value: "gurubk", label: "Guru BK", icon: UserRound },
];

export function Login({ initialEmail }: { initialEmail?: string | undefined }) {
  const { login, forgotPassword, go } = useStore();
  const [role, setRole] = useState<Role>("siswa");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<{ email?: string | undefined; form?: string | undefined }>({});

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetErr, setResetErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return setErr({ form: "Surel dan kata sandi wajib diisi" });
    if (!EMAIL_RE.test(email)) return setErr({ email: "Format surel tidak valid (contoh: nama@email.com)" });

    setSubmitting(true);
    setErr({});
    const error = await login(email, pw, role);
    setSubmitting(false);

    if (error) return setErr({ form: error });
    toast.success("Berhasil masuk");
  };

  const handleReset = async () => {
    setResetErr("");
    if (!EMAIL_RE.test(resetEmail)) {
      setResetErr("Masukkan alamat surel yang valid");
      return;
    }
    setResetBusy(true);
    const error = await forgotPassword(resetEmail);
    setResetBusy(false);
    if (error) {
      setResetErr(error);
      return;
    }
    setResetOpen(false);
    setResetEmail("");
    toast.success("Tautan atur ulang kata sandi telah dikirim ke surelmu");
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          <Building2 className="h-3.5 w-3.5" /> {SCHOOL_NAME}
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">Masuk ke Akun</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Akses eksklusif warga {SCHOOL_NAME}. Pilih peranmu untuk melanjutkan.
        </p>

        <div role="radiogroup" aria-label="Peran" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={role === r.value}
              onClick={() => {
                setRole(r.value);
                setErr({});
              }}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all",
                role === r.value ? "bg-card text-primary shadow-card" : "text-foreground hover:bg-card/60",
              )}
            >
              <r.icon className="h-4 w-4" /> {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {err.form && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-semibold text-danger-foreground"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err.form}
            </div>
          )}
          <Field label="Surel" error={err.email}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              err={!!err.email || !!err.form}
            />
          </Field>
          <div>
            <Field label="Kata sandi">
              <PasswordInput
                value={pw}
                onChange={setPw}
                err={!!err.form}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
              />
            </Field>
            <div className="mt-1.5 text-right">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetErr("");
                  setResetOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>
          </div>
          <Btn type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Memeriksa…" : `Masuk sebagai ${role === "siswa" ? "Siswa" : "Guru BK"}`}
          </Btn>
        </form>

        {role === "siswa" ? (
          <p className="mt-5 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            Siswa / alumni {SCHOOL_NAME} belum punya akun?{" "}
            <button
              type="button"
              onClick={() => go({ name: "register" })}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              Daftar di sini
            </button>
          </p>
        ) : (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-info-soft px-3.5 py-2.5 text-xs leading-relaxed text-info-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Akun Guru BK dikelola langsung oleh admin BKK{" "}
            {SCHOOL_NAME} dan tidak dibuka untuk pendaftaran mandiri.
          </p>
        )}
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Atur ulang kata sandi"
        footer={
          <>
            <Btn variant="outline" onClick={() => setResetOpen(false)}>
              Batal
            </Btn>
            <Btn disabled={resetBusy} onClick={handleReset}>
              {resetBusy ? "Mengirim…" : "Kirim tautan"}
            </Btn>
          </>
        }
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Masukkan surel akunmu. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
        </p>
        <Field label="Surel" error={resetErr || undefined}>
          <Input
            type="email"
            placeholder="nama@email.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            err={!!resetErr}
          />
        </Field>
      </Modal>
    </AuthLayout>
  );
}

type RegForm = {
  name: string;
  email: string;
  pw: string;
  pw2: string;
  major: string;
  studentStatus: string;
  registrationCode: string;
};

export function Register() {
  const { back, register, replace } = useStore();
  const [f, setF] = useState<RegForm>({
    name: "",
    email: "",
    pw: "",
    pw2: "",
    major: SMKN53_MAJORS[5], // Default TKJ
    studentStatus: STUDENT_STATUSES[0],
    registrationCode: "",
  });
  const [err, setErr] = useState<Partial<RegForm & { form: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmEmail, setNeedsConfirmEmail] = useState<string | null>(null);
  const set = (k: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<RegForm> = {};
    if (!f.name.trim()) er.name = "Nama lengkap wajib diisi";
    if (!f.email) er.email = "Surel wajib diisi";
    else if (!EMAIL_RE.test(f.email)) er.email = "Format surel tidak valid";
    if (!f.major) er.major = "Jurusan wajib dipilih";
    if (!f.registrationCode.trim()) er.registrationCode = "Kode akses SMKN 53 wajib diisi";
    if (!f.pw) er.pw = "Kata sandi wajib diisi";
    else if (f.pw.length < 8) er.pw = "Kata sandi minimal 8 karakter";
    if (!f.pw2) er.pw2 = "Konfirmasi kata sandi wajib diisi";
    else if (f.pw2 !== f.pw) er.pw2 = "Konfirmasi kata sandi tidak sama";
    setErr(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    const res = await register({
      name: f.name.trim(),
      email: f.email.trim(),
      password: f.pw,
      major: f.major,
      studentStatus: f.studentStatus,
      registrationCode: f.registrationCode.trim(),
    });
    setSubmitting(false);

    if (res.error) {
      if (res.error.toLowerCase().includes("kode akses")) {
        return setErr({ registrationCode: res.error });
      }
      return setErr({ form: res.error });
    }
    if (res.needsConfirmation) {
      setNeedsConfirmEmail(f.email.trim());
      toast.success("Akun dibuat! Silakan cek surel untuk verifikasi.");
      return;
    }
    toast.success(`Selamat datang di ${SITE_CONFIG.name} ${SCHOOL_NAME}!`);
  };

  if (needsConfirmEmail) {
    return (
      <AuthLayout>
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success-foreground">
            <MailCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-foreground">Verifikasi surelmu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kami telah mengirimkan tautan konfirmasi ke{" "}
            <span className="font-bold text-foreground">{needsConfirmEmail}</span>. Klik tautan tersebut, lalu masuk ke
            akunmu.
          </p>
          <Btn className="mt-6 w-full" onClick={() => replace({ name: "login", email: needsConfirmEmail })}>
            Kembali ke halaman masuk
          </Btn>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <button
          type="button"
          onClick={back}
          className="-ml-1 mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-primary hover:bg-primary-soft"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          <GraduationCap className="h-3.5 w-3.5" /> Khusus Siswa & Alumni {SCHOOL_NAME}
        </span>
        <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground">Buat Akun Siswa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sekolah terkunci otomatis untuk <strong>{SCHOOL_NAME}</strong>.
        </p>

        <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3.5 sm:grid-cols-2">
          {err.form && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-semibold text-danger-foreground sm:col-span-2"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err.form}
            </div>
          )}

          <div className="sm:col-span-2">
            <Field label="Nama lengkap" error={err.name}>
              <Input
                autoComplete="name"
                value={f.name}
                onChange={set("name")}
                placeholder="Nama lengkap sesuai rapor/ijazah"
                err={!!err.name}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Surel" error={err.email}>
              <Input
                type="email"
                autoComplete="email"
                value={f.email}
                onChange={set("email")}
                placeholder="nama@email.com"
                err={!!err.email}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Jurusan (Kompetensi Keahlian)" error={err.major}>
              <Select
                ariaLabel="Jurusan SMKN 53 Jakarta"
                value={f.major}
                onChange={(v) => setF({ ...f, major: v })}
                options={SMKN53_MAJORS.map((m) => ({ value: m, label: m }))}
                err={!!err.major}
              />
            </Field>
          </div>

          <Field label="Status siswa">
            <Select
              ariaLabel="Status siswa"
              value={f.studentStatus}
              onChange={(v) => setF({ ...f, studentStatus: v })}
              options={STUDENT_STATUSES.map((st) => ({ value: st, label: st }))}
            />
          </Field>

          <Field
            label="Kode akses SMKN 53"
            error={err.registrationCode}
            hint="Minta kode terbaru ke Guru BK"
          >
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={f.registrationCode}
                onChange={(e) => setF({ ...f, registrationCode: e.target.value.toUpperCase() })}
                placeholder="SMKN53-XXXX"
                className="pl-10 uppercase tracking-wider"
                err={!!err.registrationCode}
              />
            </div>
          </Field>

          <Field label="Kata sandi" error={err.pw} hint="Minimal 8 karakter">
            <PasswordInput
              autoComplete="new-password"
              value={f.pw}
              onChange={(v) => setF({ ...f, pw: v })}
              placeholder="Buat kata sandi"
              err={!!err.pw}
            />
          </Field>

          <Field label="Konfirmasi kata sandi" error={err.pw2}>
            <PasswordInput
              autoComplete="new-password"
              value={f.pw2}
              onChange={(v) => setF({ ...f, pw2: v })}
              placeholder="Ulangi kata sandi"
              err={!!err.pw2}
            />
          </Field>

          <Btn type="submit" disabled={submitting} className="mt-1 w-full sm:col-span-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Memverifikasi & mendaftar…" : "Daftar Akun Siswa"}
          </Btn>
        </form>
      </div>
    </AuthLayout>
  );
}

export function RecoveryModal() {
  const { recoveryMode, clearRecoveryMode, changePassword } = useStore();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr("");
    if (pw.length < 8) return setErr("Kata sandi minimal 8 karakter");
    if (pw !== pw2) return setErr("Konfirmasi kata sandi tidak sama");
    setBusy(true);
    const error = await changePassword(pw);
    setBusy(false);
    if (error) return setErr(error);
    setPw("");
    setPw2("");
    toast.success("Kata sandi berhasil diperbarui");
  };

  return (
    <Modal
      open={recoveryMode}
      onClose={clearRecoveryMode}
      title="Buat kata sandi baru"
      footer={
        <>
          <Btn variant="outline" onClick={clearRecoveryMode}>
            Batal
          </Btn>
          <Btn disabled={busy} onClick={save}>
            {busy ? "Menyimpan…" : "Simpan"}
          </Btn>
        </>
      }
    >
      <div className="space-y-3">
        {err && <p className="text-sm font-semibold text-danger-foreground">{err}</p>}
        <Field label="Kata sandi baru">
          <PasswordInput value={pw} onChange={setPw} placeholder="Minimal 8 karakter" autoComplete="new-password" />
        </Field>
        <Field label="Ulangi kata sandi">
          <PasswordInput value={pw2} onChange={setPw2} placeholder="Ulangi kata sandi baru" autoComplete="new-password" />
        </Field>
      </div>
    </Modal>
  );
}
