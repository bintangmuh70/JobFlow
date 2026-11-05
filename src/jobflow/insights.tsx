import { useEffect, useState } from "react";
import { Clock, CalendarX2, TrendingUp, Trophy, Hourglass, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header, Empty } from "./ui";
import { useStore } from "./store";
import { computeStats, fmtCountdown, fmtDateTime } from "./data";

export function RadarScreen() {
  const { apps, go, now } = useStore();
  const items = apps
    .flatMap((a) => a.schedules.map((s) => ({ a, s })))
    .sort((x, y) => {
      const px = x.s.at < now, py = y.s.at < now;
      if (px !== py) return px ? 1 : -1;
      return px ? y.s.at.getTime() - x.s.at.getTime() : x.s.at.getTime() - y.s.at.getTime();
    });
  const upcoming = items.filter((i) => i.s.at > now).length;

  return (
    <div className="pb-28">
      <Header title="Radar tenggat" subtitle={`${upcoming} jadwal mendatang`} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 px-5 pt-5 md:grid-cols-2 md:gap-4 md:px-8 md:pt-7 xl:grid-cols-3">
        {items.length === 0 && <div className="md:col-span-2 xl:col-span-3"><Empty icon={<CalendarX2 className="h-8 w-8" />} text="Belum ada jadwal. Tambahkan jadwal dari halaman detail lamaran." /></div>}
        {items.map(({ a, s }) => {
          const left = s.at.getTime() - now.getTime();
          const past = left <= 0;
          const urgent = !past && left < 86400000;
          return (
            <button key={s.id} onClick={() => go({ name: "detail", id: a.id })}
              className={cn("flex w-full flex-col rounded-2xl border p-4 text-left shadow-card transition-transform active:scale-[0.99]",
                urgent ? "border-destructive bg-destructive text-destructive-foreground" : past ? "border-border bg-disabled text-foreground" : "border-border bg-card text-foreground")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", urgent ? "bg-destructive-foreground text-danger-foreground" : past ? "bg-card text-foreground" : "bg-primary-soft text-secondary-foreground")}>{s.type}</span>
                {urgent && <span className="inline-flex items-center gap-1 rounded-full border border-destructive-foreground px-2 py-0.5 text-xs font-bold"><Clock className="h-3.5 w-3.5" /> &lt; 24 jam</span>}
                {past && <span className="inline-flex items-center gap-1 rounded-full border border-foreground px-2 py-0.5 text-xs font-bold"><CalendarX2 className="h-3.5 w-3.5" /> Terlewat</span>}
              </div>
              <p className="mt-2 text-lg font-bold">{a.company}</p>
              <p className="text-sm">{a.position}</p>
              <p className="mt-1 text-sm font-medium">{fmtDateTime(s.at)}</p>
              <span className="block min-h-3 flex-1" />
              <div className={cn("flex items-baseline justify-between rounded-xl px-3 py-2", urgent ? "bg-destructive-foreground/15" : past ? "bg-card/60" : "bg-muted")}>
                <span className="text-xs font-semibold">Sisa waktu</span>
                <span className="text-lg font-extrabold tabular-nums">{fmtCountdown(left)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const { apps } = useStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  const st = computeStats(apps);
  const stages = [
    { label: "Total lamaran", n: st.total, pct: 100, cls: "bg-primary text-primary-foreground" },
    { label: "Sampai Interview", n: st.reached, pct: st.reachedPct, cls: "bg-primary/80 text-primary-foreground" },
    { label: "Offering", n: st.offer, pct: st.offerPct, cls: "bg-success text-primary-foreground" },
    { label: "Diterima", n: st.accepted, pct: st.acceptedPct, cls: "bg-accepted text-primary-foreground" },
  ];
  const stats = [
    { label: "Konversi ke interview", v: `${st.reachedPct}%`, icon: TrendingUp },
    { label: "Interview → offering", v: `${st.interviewToOffer}%`, icon: Trophy },
    { label: "Masih menunggu", v: st.waiting, icon: Hourglass },
    { label: "Ditolak", v: st.rejected, icon: XCircle },
  ];

  return (
    <div className="pb-28">
      <Header title="Dasbor" subtitle="Ringkasan perjalanan karier" />
      <div className="px-5 pt-5 md:px-8 md:pt-7">
        {loading ? (
          <div aria-busy="true" aria-label="Memuat" className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="h-64 animate-pulse rounded-2xl bg-disabled lg:h-80" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-disabled" />)}</div>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-5">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-card md:p-6">
              <h2 className="font-bold text-foreground">Funnel konversi</h2>
              <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-1.5 md:mt-6 md:gap-2">
                {stages.map((s, i) => (
                  <div key={s.label} className={cn("flex min-h-[64px] flex-col md:min-h-[80px] items-center justify-center px-2 text-center", s.cls)}
                    style={{ width: `${100 - i * 17}%`, clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)" }}>
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="text-lg font-extrabold">{s.n} <span className="text-sm font-semibold">({s.pct}%)</span></span>
                  </div>
                ))}
              </div>
            </section>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-2">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card md:p-5">
                  <s.icon className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-2xl font-extrabold text-foreground">{s.v}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
