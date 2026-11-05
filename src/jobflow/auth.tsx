import { useState, type ReactNode } from "react";
import { Briefcase, Eye, EyeOff, AlertCircle, GraduationCap, UserRound, ShieldCheck, CalendarClock, TrendingUp, CheckCircle2, ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Btn, Field, Input } from "./ui";
import { useStore } from "./store";
import { DEMO, type Role } from "./data";
import { SITE_CONFIG } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PasswordInput({ value, onChange, err, placeholder, id, autoComplete }: { value: string; onChange: (v: string) => void; err?: boolean | undefined; placeholder: string; id?: string | undefined; autoComplete?: string | undefined }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} err={err} placeholder={placeholder} className="pr-12" />
      <button type="button" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setShow(!show)}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

/** Ilustrasi pelacakan lamaran, dibuat dari elemen UI agar tajam dan mengikuti warna tema. */
function TrackingIllustration() {
  const cols = [
    { label: "Applied", dot: "bg-info-soft", cards: ["Tokopedia", "Telkom"] },
    { label: "Interview", dot: "bg-warning", cards: ["Gojek"] },
    { label: "Diterima", dot: "bg-success", cards: ["Bank BCA"] },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground/40" />
          <span className="ml-2 h-2 w-24 rounded-full bg-primary-foreground/25" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {cols.map((c) => (
            <div key={c.label} className="rounded-2xl bg-primary-foreground/10 p-2">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-primary-foreground">
                <span className={cn("h-2 w-2 rounded-full", c.dot)} />{c.label}
              </p>
              <div className="space-y-2">
                {c.cards.map((n) => (
                  <div key={n} className="rounded-xl bg-card p-2 shadow-card">
                    <p className="truncate text-[11px] font-bold text-foreground">{n}</p>
                    <span className="mt-1 block h-1.5 w-3/4 rounded-full bg-muted" />
                    <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-float absolute -left-6 -top-6 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-xl">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-warning-soft text-warning-foreground"><CalendarClock className="h-4 w-4" /></span>
        <div><p className="text-[11px] font-bold text-foreground">Wawancara besok</p><p className="text-[10px] text-muted-foreground">Gojek · 10.00</p></div>
      </div>
      <div className="animate-float absolute -bottom-6 -right-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-xl [animation-delay:1.5s]">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-success-soft text-success-foreground"><TrendingUp className="h-4 w-4" /></span>
        <div><p className="text-[11px] font-bold text-foreground">Konversi interview</p><p className="text-[10px] text-muted-foreground">43% bulan ini</p></div>
      </div>
    </div>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  const points = ["Kanban enam tahap dari Applied hingga Diterima", "Pengingat tes, wawancara, dan tenggat", "Guru BK memantau progres karier siswa"];
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="bg-header relative overflow-hidden px-6 pb-10 pt-10 text-primary-foreground sm:px-10 lg:flex lg:flex-col lg:px-14 lg:py-12 xl:px-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-foreground/5" />
        <div className="relative flex items-center gap-3 animate-fade-up">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground text-primary shadow-lg"><Briefcase className="h-6 w-6" strokeWidth={2.4} /></span>
          <span className="text-2xl font-extrabold tracking-tight">{SITE_CONFIG.name}</span>
        </div>
        <div className="relative mt-8 max-w-xl animate-fade-up [animation-delay:80ms] lg:mt-auto">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">Lacak setiap lamaran, raih kerja pertamamu.</h1>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-primary-foreground/90 sm:text-base">
            {SITE_CONFIG.name} membantu siswa SMK merapikan lamaran kerja dan membantu Guru BK memantau progres karier siswa dalam satu tempat.
          </p>
          <ul className="mt-5 hidden space-y-2 sm:block">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 shrink-0" />{p}</li>
            ))}
          </ul>
        </div>
        <div className="relative mt-14 hidden animate-fade-up px-6 [animation-delay:160ms] md:block lg:mb-auto lg:mt-14">
          <TrackingIllustration />
        </div>
      </aside>
      <main className="flex items-start justify-center px-5 py-8 sm:px-8 lg:items-center lg:py-12">
        <div className="w-full max-w-md animate-fade-up [animation-delay:120ms]">{children}</div>
      </main>
    </div>
  );
}

const ROLES: { value: Role; label: string; icon: typeof UserRound }[] = [
  { value: "siswa", label: "Siswa", icon: GraduationCap },
  { value: "gurubk", label: "Guru BK", icon: UserRound },
];

export function Login({ initialEmail }: { initialEmail?: string | undefined }) {
  const { login, loginDemo, go } = useStore();
  const [role, setRole] = useState<Role>("siswa");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<{ email?: string | undefined; form?: string | undefined }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return setErr({ form: "Surel atau kata sandi salah" });
    if (!EMAIL_RE.test(email)) return setErr({ email: "Format surel tidak valid (contoh: nama@email.com)" });
    const error = await login(email, pw, role);
    if (error) return setErr({ form: error });
    setErr({});
    toast.success("Berhasil masuk");
  };
  const demo = (r: Role) => {
    loginDemo(r);
    toast.success(`Masuk sebagai ${r === "siswa" ? "Siswa" : "Guru BK"} demo`);
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-extrabold text-foreground">Masuk ke {SITE_CONFIG.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pilih peranmu, lalu masukkan surel dan kata sandi.</p>

        <div role="radiogroup" aria-label="Peran" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {ROLES.map((r) => (
            <button key={r.value} type="button" role="radio" aria-checked={role === r.value} onClick={() => { setRole(r.value); setErr({}); }}
              className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all", role === r.value ? "bg-card text-primary shadow-card" : "text-foreground hover:bg-card/60")}>
              <r.icon className="h-4 w-4" /> {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {err.form && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err.form}
            </div>
          )}
          <Field label="Surel" error={err.email}>
            <Input type="email" inputMode="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} err={!!err.email || !!err.form} />
          </Field>
          <Field label="Kata sandi">
            <PasswordInput value={pw} onChange={setPw} err={!!err.form} placeholder="Masukkan kata sandi" autoComplete="current-password" />
          </Field>
          <Btn type="submit" className="w-full">Masuk sebagai {role === "siswa" ? "Siswa" : "Guru BK"}</Btn>
        </form>

        {role === "siswa" ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <button type="button" onClick={() => go({ name: "register" })} className="font-bold text-primary underline-offset-2 hover:underline">Daftar sebagai siswa</button>
          </p>
        ) : (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-info-soft px-3 py-2.5 text-sm text-info-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Akun Guru BK disediakan oleh tim pengembang dan tidak bisa didaftarkan sendiri.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-input bg-card/60 p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground"><Info className="h-4 w-4 text-primary" /> Akun demo</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ROLES.map((r) => (
            <button key={r.value} type="button" onClick={() => demo(r.value)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><r.icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">Demo {r.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{DEMO[r.value].email}</span>
                <span className="block text-xs text-muted-foreground">Sandi: {DEMO[r.value].password}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

type RegForm = { name: string; email: string; pw: string; pw2: string; school: string; major: string };

export function Register() {
  const { back, register, replace } = useStore();
  const [f, setF] = useState<RegForm>({ name: "", email: "", pw: "", pw2: "", school: "", major: "" });
  const [err, setErr] = useState<Partial<RegForm>>({});
  const set = (k: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<RegForm> = {};
    if (!f.name.trim()) er.name = "Nama wajib diisi";
    if (!f.email) er.email = "Surel wajib diisi";
    else if (!EMAIL_RE.test(f.email)) er.email = "Format surel tidak valid";
    if (!f.school.trim()) er.school = "Sekolah wajib diisi";
    if (!f.major.trim()) er.major = "Jurusan wajib diisi";
    if (!f.pw) er.pw = "Kata sandi wajib diisi";
    else if (f.pw.length < 8) er.pw = "Kata sandi minimal 8 karakter";
    if (!f.pw2) er.pw2 = "Konfirmasi kata sandi wajib diisi";
    else if (f.pw2 !== f.pw) er.pw2 = "Konfirmasi kata sandi tidak sama";
    setErr(er);
    if (Object.keys(er).length) return;
    const dup = register({ name: f.name.trim(), email: f.email, password: f.pw, school: f.school.trim(), major: f.major.trim() });
    if (dup) return setErr({ email: dup });
    toast.success("Akun siswa berhasil dibuat. Silakan masuk.");
    replace({ name: "login", email: f.email.trim() });
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <button type="button" onClick={back} className="-ml-1 mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-primary hover:bg-primary-soft">
          <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-secondary-foreground"><GraduationCap className="h-3.5 w-3.5" /> Pendaftaran Siswa</span>
        <h2 className="mt-2 text-2xl font-extrabold text-foreground">Buat akun siswa</h2>
        <p className="mt-1 text-sm text-muted-foreground">Mulai rapikan perjalanan kariermu. Akun Guru BK disediakan oleh tim pengembang.</p>
        <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nama lengkap" error={err.name}><Input autoComplete="name" value={f.name} onChange={set("name")} placeholder="Nama lengkap" err={!!err.name} /></Field></div>
          <div className="sm:col-span-2"><Field label="Surel" error={err.email}><Input type="email" autoComplete="email" value={f.email} onChange={set("email")} placeholder="nama@email.com" err={!!err.email} /></Field></div>
          <Field label="Sekolah" error={err.school}><Input value={f.school} onChange={set("school")} placeholder="Contoh: SMK Negeri 1 Jakarta" err={!!err.school} /></Field>
          <Field label="Jurusan" error={err.major}><Input value={f.major} onChange={set("major")} placeholder="Contoh: Rekayasa Perangkat Lunak" err={!!err.major} /></Field>
          <Field label="Kata sandi" error={err.pw} hint="Minimal 8 karakter"><PasswordInput autoComplete="new-password" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} placeholder="Buat kata sandi" err={!!err.pw} /></Field>
          <Field label="Konfirmasi kata sandi" error={err.pw2}><PasswordInput autoComplete="new-password" value={f.pw2} onChange={(v) => setF({ ...f, pw2: v })} placeholder="Ulangi kata sandi" err={!!err.pw2} /></Field>
          <Btn type="submit" className="w-full sm:col-span-2">Daftar</Btn>
        </form>
      </div>
    </AuthLayout>
  );
}
