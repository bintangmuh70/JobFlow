import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import {
  ArrowLeft,
  Home,
  Columns3,
  Radar,
  BarChart3,
  MoreVertical,
  X,
  Briefcase,
  Plus,
  LogOut,
  UserRound,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  KeyRound,
  Loader2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, fmtSize, type Cv, type Status } from "./data";
import { useStore } from "./store";
import { getCvSignedUrl } from "./api";
import { SCHOOL_NAME, SCHOOL_SHORT_NAME, SITE_CONFIG, SMKN53_MAJORS, STUDENT_STATUSES } from "@/lib/constants";

type BtnVariant = "primary" | "outline" | "danger" | "ghost" | "soft" | "warning";
export function Btn({
  variant = "primary",
  className,
  size = "md",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant | undefined;
  size?: "sm" | "md" | undefined;
}) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border-2 border-primary bg-card text-primary hover:bg-primary-soft",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "text-primary hover:bg-primary-soft",
    soft: "bg-primary-soft text-secondary-foreground hover:bg-primary-soft/70",
    warning: "border-2 border-warning-foreground bg-card text-warning-foreground hover:bg-warning-soft",
  };
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground",
        size === "md" ? "h-12 px-5 text-[15px]" : "h-9 px-3 text-sm",
        v[variant],
        className,
      )}
    />
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-sm font-medium text-danger-foreground">{error}</span>}
    </label>
  );
}

export const inputCls = (err?: boolean) =>
  cn(
    "h-12 w-full rounded-xl border bg-card px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-muted disabled:text-muted-foreground",
    err ? "border-destructive" : "border-input",
  );

export function Input({ err, className, ...p }: InputHTMLAttributes<HTMLInputElement> & { err?: boolean | undefined }) {
  return <input {...p} className={cn(inputCls(err), className)} />;
}

export function Select({
  value,
  onChange,
  options,
  err,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  err?: boolean | undefined;
  ariaLabel?: string | undefined;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputCls(err), "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9")}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string | undefined;
  children: ReactNode;
  onClick?: () => void | undefined;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card",
        onClick && "cursor-pointer transition-transform active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const STATUS_STYLE: Record<Status, { pill: string; dot: string; badgeDot?: string }> = {
  applied: { pill: "bg-info-soft text-info-foreground", dot: "bg-info-foreground" },
  screening: { pill: "bg-screening-soft text-screening-foreground", dot: "bg-screening" },
  interview: { pill: "bg-warning-soft text-warning-foreground", dot: "bg-warning" },
  offer: { pill: "bg-success-soft text-success-foreground", dot: "bg-success" },
  accepted: { pill: "bg-accepted text-primary-foreground", dot: "bg-accepted", badgeDot: "bg-primary-foreground" },
  rejected: { pill: "bg-danger-soft text-danger-foreground", dot: "bg-destructive" },
};
export const statusDot = (s: Status) => STATUS_STYLE[s].dot;
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        STATUS_STYLE[status].pill,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", STATUS_STYLE[status].badgeDot ?? STATUS_STYLE[status].dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Header adaptif:
 * - Mobile (< lg): Header biru melengkung nyaman untuk layar HP.
 * - Desktop (>= lg): Header bersih, datar, dan ringkas berdampingan dengan Sidebar kiri.
 */
export function Header({
  title,
  subtitle,
  onBack,
  right,
  children,
  big,
}: {
  title: string;
  subtitle?: string | undefined;
  onBack?: () => void | undefined;
  right?: ReactNode | undefined;
  children?: ReactNode | undefined;
  big?: boolean | undefined;
}) {
  return (
    <header className="bg-header rounded-b-[28px] px-5 pb-6 pt-[max(env(safe-area-inset-top),20px)] text-primary-foreground md:px-8 md:pb-7 lg:rounded-none lg:border-b lg:border-border lg:bg-card lg:[background-image:none] lg:py-5 lg:text-foreground">
      <div className="flex items-center gap-3 pt-1 lg:pt-0">
        {onBack && (
          <button
            aria-label="Kembali"
            onClick={onBack}
            className="-ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 lg:bg-muted lg:text-foreground lg:hover:bg-muted/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && big && (
            <p className="text-sm font-medium text-primary-foreground/90 lg:text-muted-foreground">{subtitle}</p>
          )}
          <h1
            className={cn(
              "break-words font-extrabold leading-tight tracking-tight",
              big ? "mt-0.5 text-2xl md:text-[26px]" : "text-xl md:text-2xl",
            )}
          >
            {title}
          </h1>
          {subtitle && !big && (
            <p className="mt-0.5 text-sm font-medium text-primary-foreground/90 lg:text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </header>
  );
}

export function BottomNav() {
  const { screen, replace } = useStore();
  const items = [
    { name: "home", label: "Beranda", icon: Home },
    { name: "kanban", label: "Lamaran", icon: Columns3 },
    { name: "radar", label: "Radar", icon: Radar },
    { name: "dashboard", label: "Dasbor", icon: BarChart3 },
  ] as const;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map((it) => {
          const active = screen.name === it.name;
          return (
            <button
              key={it.name}
              onClick={() => replace({ name: it.name })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className={cn("grid h-8 w-14 place-items-center rounded-full", active && "bg-primary-soft")}>
                <it.icon className="h-5 w-5" />
              </span>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function StudentProfileSheet() {
  const {
    user,
    cvs,
    profileSheetOpen,
    setProfileSheetOpen,
    updateProfile,
    uploadCv,
    deleteCv,
    changePassword,
  } = useStore();
  const [tab, setTab] = useState<"profile" | "cv" | "security">("profile");
  const [pf, setPf] = useState({ name: "", major: "", studentStatus: "Kelas XII", phone: "" });
  const [savingProf, setSavingProf] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileSheetOpen && user) {
      const validMajor =
        user.major && (SMKN53_MAJORS as readonly string[]).includes(user.major)
          ? user.major
          : SMKN53_MAJORS[5];
      setPf({
        name: user.name,
        major: validMajor,
        studentStatus: user.studentStatus || STUDENT_STATUSES[0],
        phone: user.phone ?? "",
      });
    }
  }, [profileSheetOpen, user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pf.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSavingProf(true);
    const ok = await updateProfile({
      name: pf.name,
      major: pf.major,
      studentStatus: pf.studentStatus,
      phone: pf.phone,
    });
    setSavingProf(false);
    if (ok) setProfileSheetOpen(false);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploadingCv(true);
    try {
      await uploadCv(file);
      toast.success("CV berhasil ditambahkan ke Pustaka CV");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploadingCv(false);
    }
  };

  const openCv = async (cv: Cv) => {
    if (!cv.storagePath) return;
    try {
      const url = await getCvSignedUrl(cv.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error((err as Error).message);
    }
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
    toast.success("Kata sandi berhasil diubah");
  };

  return (
    <Sheet open={profileSheetOpen} onClose={() => setProfileSheetOpen(false)} title="Profil, Pustaka CV & Keamanan">
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {(
          [
            ["profile", "Profil"],
            ["cv", `CV (${cvs.length})`],
            ["security", "Kata Sandi"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-lg py-2 text-xs font-bold transition-colors",
              tab === k ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="space-y-3.5">
          <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary">
            <Building2 className="h-4 w-4 shrink-0" /> {SCHOOL_NAME} (Terkunci Eksklusif)
          </div>
          <Field label="Nama lengkap *">
            <Input value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} placeholder="Nama lengkap" />
          </Field>
          <Field label="Jurusan">
            <Select
              ariaLabel="Jurusan"
              value={pf.major}
              onChange={(v) => setPf({ ...pf, major: v })}
              options={SMKN53_MAJORS.map((m) => ({ value: m, label: m }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select
                ariaLabel="Status siswa"
                value={pf.studentStatus}
                onChange={(v) => setPf({ ...pf, studentStatus: v })}
                options={STUDENT_STATUSES.map((st) => ({ value: st, label: st }))}
              />
            </Field>
            <Field label="No. HP / WA">
              <Input
                type="tel"
                value={pf.phone}
                onChange={(e) => setPf({ ...pf, phone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
              />
            </Field>
          </div>
          <Btn type="submit" disabled={savingProf} className="w-full">
            {savingProf ? "Menyimpan…" : "Simpan profil"}
          </Btn>
        </form>
      )}

      {tab === "cv" && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              void handleUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {cvs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-input p-5 text-center text-sm text-muted-foreground">
              Belum ada CV PDF tersimpan. Unggah CV kamu agar bisa dilampirkan cepat ke berbagai lamaran.
            </div>
          ) : (
            <div className="space-y-2">
              {cvs.map((c) => (
                <div
                  key={c.id ?? c.name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">PDF · {fmtSize(c.size)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Buka PDF"
                    onClick={() => void openCv(c)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-primary-soft"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus CV"
                    onClick={() => void deleteCv(c)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-danger-foreground hover:bg-danger-soft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Btn
            type="button"
            variant="outline"
            disabled={uploadingCv}
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            {uploadingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploadingCv ? "Mengunggah…" : "Unggah PDF baru (maks. 5 MB)"}
          </Btn>
        </div>
      )}

      {tab === "security" && (
        <form onSubmit={savePw} className="space-y-3.5">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4 shrink-0 text-primary" />
            Ubah kata sandi akun <strong className="text-foreground">{user?.email}</strong>
          </div>
          <Field label="Kata sandi baru" hint="Minimal 8 karakter">
            <Input
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Masukkan kata sandi baru"
            />
          </Field>
          <Field label="Konfirmasi kata sandi baru">
            <Input
              type="password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Ulangi kata sandi baru"
            />
          </Field>
          <Btn type="submit" disabled={savingPw} className="w-full">
            {savingPw ? "Memperbarui…" : "Perbarui kata sandi"}
          </Btn>
        </form>
      )}
    </Sheet>
  );
}

/**
 * Shell responsif Portal Siswa:
 * - Desktop (>= lg): Sidebar kiri permanen ala Web App modern + konten penuh.
 * - Mobile (< lg): Layout ringkas + BottomNav di bawah.
 */
export function StudentShell({ children }: { children: ReactNode }) {
  const { screen, replace, go, user, apps, now, logout, setProfileSheetOpen } = useStore();
  const [confirmOut, setConfirmOut] = useState(false);

  const upcomingCount = apps
    .flatMap((a) => a.schedules)
    .filter((s) => s.at > now).length;

  const navItems = [
    { name: "home" as const, label: "Beranda", icon: Home, badge: null as number | null },
    { name: "kanban" as const, label: "Lamaran", icon: Columns3, badge: apps.length || null },
    { name: "radar" as const, label: "Radar Tenggat", icon: Radar, badge: upcomingCount || null },
    { name: "dashboard" as const, label: "Dasbor Analitik", icon: BarChart3, badge: null as number | null },
  ];

  const showBottomNav = ["home", "kanban", "radar", "dashboard"].includes(screen.name);
  const initials = (user?.name ?? "S")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background font-sans lg:flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card xl:w-72">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold leading-none tracking-tight text-foreground">
              {SITE_CONFIG.name}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">{SCHOOL_SHORT_NAME}</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <Btn className="w-full" size="sm" onClick={() => go({ name: "form" })}>
            <Plus className="h-4 w-4" /> Catat Lamaran Baru
          </Btn>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi utama">
          {navItems.map((it) => {
            const active =
              screen.name === it.name ||
              (it.name === "kanban" && (screen.name === "detail" || screen.name === "form"));
            return (
              <button
                key={it.name}
                onClick={() => replace({ name: it.name })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <it.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{it.label}</span>
                {it.badge !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {it.badge}
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
              <p className="truncate text-sm font-bold text-foreground">{user?.name ?? "Siswa"}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.studentStatus ?? "Kelas XII"} · {user?.major ?? SCHOOL_SHORT_NAME}
              </p>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProfileSheetOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
            >
              <UserRound className="h-3.5 w-3.5" /> Profil & CV
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
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1360px]">{children}</div>
        {showBottomNav && <BottomNav />}
      </div>

      <StudentProfileSheet />

      <Modal
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title={`Keluar dari ${SITE_CONFIG.name}?`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirmOut(false)}>
              Batal
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                setConfirmOut(false);
                void logout();
                toast("Anda telah keluar");
              }}
            >
              Keluar
            </Btn>
          </>
        }
      >
        Anda perlu masuk kembali untuk melihat lamaran Anda.
      </Modal>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode | undefined;
  footer?: ReactNode | undefined;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-5 animate-fade"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[380px] rounded-2xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {children && <div className="mt-2 text-[15px] text-muted-foreground">{children}</div>}
        {footer && <div className="mt-5 grid grid-cols-2 gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 animate-fade md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[88vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 animate-sheet md:max-w-xl md:rounded-3xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border md:hidden" />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground hover:bg-muted/80"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Menu({
  items,
  light,
  label = "Menu",
}: {
  items: { label: string; onClick: () => void; danger?: boolean | undefined }[];
  light?: boolean | undefined;
  label?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label={label}
        onClick={() => setOpen(!open)}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          light
            ? "bg-primary-foreground/15 text-primary-foreground lg:bg-muted lg:text-foreground lg:hover:bg-muted/80"
            : "text-foreground hover:bg-muted",
        )}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 min-w-[190px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "block w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-muted",
                it.danger ? "text-danger-foreground" : "text-foreground",
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Empty({ text, icon }: { text: string; icon?: ReactNode | undefined }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-8 text-center text-sm font-medium text-muted-foreground">
      {icon}
      {text}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode | undefined }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {right}
    </div>
  );
}
