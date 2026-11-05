import { useEffect, useRef, useState, type ReactNode, type InputHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { ArrowLeft, Home, Columns3, Radar, BarChart3, MoreVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type Status } from "./data";
import { useStore } from "./store";

type BtnVariant = "primary" | "outline" | "danger" | "ghost" | "soft" | "warning";
export function Btn({
  variant = "primary",
  className,
  size = "md",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant | undefined; size?: "sm" | "md" | undefined }) {
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

export function Field({ label, error, children, hint }: { label: string; error?: string | undefined; hint?: string | undefined; children: ReactNode }) {
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
    "h-12 w-full rounded-xl border bg-card px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25",
    err ? "border-destructive" : "border-input",
  );

export function Input({ err, className, ...p }: InputHTMLAttributes<HTMLInputElement> & { err?: boolean | undefined }) {
  return <input {...p} className={cn(inputCls(err), className)} />;
}

export function Select({ value, onChange, options, err, ariaLabel }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; err?: boolean | undefined; ariaLabel?: string | undefined }) {
  return (
    <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls(err), "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9")} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Card({ className, children, onClick }: { className?: string | undefined; children: ReactNode; onClick?: () => void | undefined }) {
  return (
    <div onClick={onClick} className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", onClick && "cursor-pointer active:scale-[0.99] transition-transform", className)}>
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
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", STATUS_STYLE[status].pill)}>
      <span className={cn("h-2 w-2 rounded-full", STATUS_STYLE[status].badgeDot ?? STATUS_STYLE[status].dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Header({ title, subtitle, onBack, right, children, big }: { title: string; subtitle?: string | undefined; onBack?: () => void | undefined; right?: ReactNode | undefined; children?: ReactNode | undefined; big?: boolean | undefined }) {
  return (
    <header className="bg-header rounded-b-[28px] px-5 pb-6 md:px-8 md:pb-8 pt-[max(env(safe-area-inset-top),20px)] text-primary-foreground">
      <div className="flex items-start gap-3 pt-2">
        {onBack && (
          <button aria-label="Kembali" onClick={onBack} className="-ml-1 mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && big && <p className="text-sm font-medium text-primary-foreground/90">{subtitle}</p>}
          <h1 className={cn("font-extrabold leading-tight break-words", big ? "mt-1 text-2xl md:text-3xl" : "text-xl md:text-2xl")}>{title}</h1>
          {subtitle && !big && <p className="mt-1 text-sm font-medium text-primary-foreground/90">{subtitle}</p>}
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
    { name: "kanban", label: "Kanban", icon: Columns3 },
    { name: "radar", label: "Radar", icon: Radar },
    { name: "dashboard", label: "Dasbor", icon: BarChart3 },
  ] as const;
  return (
    <nav className={cn("fixed bottom-0 left-1/2 z-30 w-full max-w-7xl -translate-x-1/2 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]")}>
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map((it) => {
          const active = screen.name === it.name;
          return (
            <button key={it.name} onClick={() => replace({ name: it.name })} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold", active ? "text-primary" : "text-muted-foreground")}>
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

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children?: ReactNode | undefined; footer?: ReactNode | undefined }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-5 animate-fade" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-[360px] rounded-2xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {children && <div className="mt-2 text-[15px] text-muted-foreground">{children}</div>}
        {footer && <div className="mt-5 grid grid-cols-2 gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 animate-fade md:items-center md:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 animate-sheet md:max-w-xl md:rounded-3xl md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button aria-label="Tutup" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Menu({ items, light, label = "Menu" }: { items: { label: string; onClick: () => void; danger?: boolean | undefined }[]; light?: boolean | undefined; label?: string | undefined }) {
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
      <button aria-label={label} onClick={() => setOpen(!open)}
        className={cn("grid h-9 w-9 place-items-center rounded-full", light ? "bg-primary-foreground/15 text-primary-foreground" : "text-foreground hover:bg-muted")}>
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 min-w-[190px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
          {items.map((it) => (
            <button key={it.label} onClick={() => { setOpen(false); it.onClick(); }}
              className={cn("block w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-muted", it.danger ? "text-danger-foreground" : "text-foreground")}>
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
