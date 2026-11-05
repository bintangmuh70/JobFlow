import { useEffect, useRef, useState } from "react";
import { GripVertical, MapPin, Plus, CalendarClock, Hand, Search, SlidersHorizontal, RotateCcw, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Header, Menu, Modal, Btn, statusDot, Input, Select } from "./ui";
import { useStore } from "./store";
import { STATUSES, STATUS_LABEL, SOURCES, EMPTY_FILTER, filterApps, activeFilterCount, fmtShortDay, type Application, type Status, type KanbanFilter } from "./data";

interface Drag { id: string; x: number; y: number; w: number; ox: number; oy: number }

function nextSchedule(a: Application, now: Date) {
  return [...a.schedules].filter((s) => s.at > now).sort((x, y) => x.at.getTime() - y.at.getTime())[0];
}

export function KanbanScreen() {
  const { apps, setStatus, go, now } = useStore();
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [moveFor, setMoveFor] = useState<Application | null>(null);
  const [filter, setFilter] = useState<KanbanFilter>(EMPTY_FILTER);
  const [showFilter, setShowFilter] = useState(false);
  const shown = filterApps(apps, filter);
  const activeCount = activeFilterCount(filter);
  const columns = filter.statuses.length ? STATUSES.filter((s) => filter.statuses.includes(s)) : STATUSES;
  const dateError = filter.from && filter.to && filter.from > filter.to;
  const setF = (p: Partial<KanbanFilter>) => setFilter((f) => ({ ...f, ...p }));
  const toggleStatus = (s: Status) =>
    setF({ statuses: filter.statuses.includes(s) ? filter.statuses.filter((x) => x !== s) : [...filter.statuses, s] });
  const reset = () => setFilter(EMPTY_FILTER);
  const boardRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);

  const move = (id: string, s: Status) => {
    const a = apps.find((x) => x.id === id);
    if (!a || a.status === s) return;
    setStatus(id, s);
    toast.success(`Status dipindahkan ke ${STATUS_LABEL[s]}`);
  };

  const begin = (a: Application, el: HTMLElement, x: number, y: number) => {
    const r = el.getBoundingClientRect();
    setDrag({ id: a.id, x, y, w: r.width, ox: x - r.left, oy: y - r.top });
    navigator.vibrate?.(20);
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-col]") as HTMLElement | null;
      setOver((el?.dataset["col"] as Status) ?? null);
      const b = boardRef.current;
      if (b) {
        const r = b.getBoundingClientRect();
        if (e.clientX > r.right - 40) b.scrollLeft += 12;
        else if (e.clientX < r.left + 40) b.scrollLeft -= 12;
      }
    };
    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-col]") as HTMLElement | null;
      if (el?.dataset["col"]) move(drag.id, el.dataset["col"] as Status);
      setDrag(null);
      setOver(null);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id]);

  const clearPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const dragged = apps.find((a) => a.id === drag?.id);

  return (
    <div className={cn("pb-28", drag && "select-none")}>
      <Header title="Kanban" subtitle={`${apps.length} lamaran`}
        right={<Btn size="sm" variant="soft" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={() => go({ name: "form" })}><Plus className="h-4 w-4" /> Tambah</Btn>} />
      <div className="px-5 pt-4 md:px-8">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input type="text" aria-label="Cari perusahaan atau posisi" placeholder="Cari perusahaan atau posisi…" value={filter.q}
                onChange={(e) => setF({ q: e.target.value })} className="pl-11 pr-10" />
              {filter.q && (
                <button aria-label="Hapus pencarian" onClick={() => setF({ q: "" })} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              )}
            </div>
            <Btn variant={showFilter ? "primary" : "outline"} aria-expanded={showFilter} onClick={() => setShowFilter((v) => !v)} className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" /> Filter
              {activeCount - (filter.q.trim() ? 1 : 0) > 0 && (
                <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-bold", showFilter ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground")}>{activeCount - (filter.q.trim() ? 1 : 0)}</span>
              )}
            </Btn>
          </div>

          {showFilter && (
            <div className="mt-3 grid gap-3 border-t border-border pt-3 lg:grid-cols-[2fr_1fr_2fr]">
              <div>
                <p className="mb-1.5 text-sm font-semibold text-foreground">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => {
                    const on = filter.statuses.includes(s);
                    return (
                      <button key={s} aria-pressed={on} onClick={() => toggleStatus(s)}
                        className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-semibold transition-colors", on ? "border-primary bg-primary-soft text-secondary-foreground" : "border-border bg-card text-foreground hover:border-primary")}>
                        <span className={cn("h-2.5 w-2.5 rounded-full", statusDot(s))} /> {STATUS_LABEL[s]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold text-foreground">Sumber lowongan</p>
                <Select ariaLabel="Sumber lowongan" value={filter.source} onChange={(v) => setF({ source: v })}
                  options={[{ value: "", label: "Semua sumber" }, ...SOURCES.map((x) => ({ value: x, label: x }))]} />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold text-foreground">Tanggal melamar</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" aria-label="Dari tanggal" value={filter.from} max={filter.to || undefined} onChange={(e) => setF({ from: e.target.value })} err={!!dateError} />
                  <Input type="date" aria-label="Sampai tanggal" value={filter.to} min={filter.from || undefined} onChange={(e) => setF({ to: e.target.value })} err={!!dateError} />
                </div>
                {dateError && <p className="mt-1 text-sm font-medium text-danger-foreground">Tanggal awal harus sebelum tanggal akhir.</p>}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Menampilkan <span className="font-bold text-foreground">{shown.length}</span> dari {apps.length} lamaran
            </p>
            <Btn size="sm" variant="ghost" onClick={reset} disabled={activeCount === 0}><RotateCcw className="h-4 w-4" /> Reset Filter</Btn>
          </div>
        </div>
      </div>

      {(shown.length > 0 || activeCount === 0) && (
        <p className="flex items-center gap-2 px-5 pt-3 text-sm text-muted-foreground md:px-8"><Hand className="h-4 w-4 shrink-0" /> Tahan & seret kartu untuk memindahkan status.</p>
      )}

      {shown.length === 0 && activeCount > 0 ? (
        <div className="mx-5 mt-3 flex flex-col md:mx-8 items-center rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-card">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><SearchX className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-foreground">Tidak ada lamaran yang cocok</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Coba ubah kata kunci atau longgarkan filter. Data lamaran Anda tetap aman.</p>
          <Btn className="mt-5" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset Filter</Btn>
        </div>
      ) : (
      <div ref={boardRef} className={cn("no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-4 md:px-8 xl:grid xl:auto-cols-fr xl:grid-flow-col xl:overflow-visible xl:gap-2.5", !drag && "snap-x snap-mandatory scroll-px-5 md:scroll-px-8")}>
        {columns.map((s) => {
          const list = shown.filter((a) => a.status === s);
          return (
            <section key={s} data-col={s} aria-label={`Kolom ${STATUS_LABEL[s]}`}
              className={cn("w-[82%] max-w-[320px] shrink-0 snap-start md:w-[280px] xl:w-auto xl:max-w-none rounded-2xl border-2 bg-muted/70 p-3 xl:p-2.5 transition-colors", over === s ? "border-primary bg-primary-soft" : "border-transparent")}>
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", statusDot(s))} />
                <h2 className="font-bold text-foreground">{STATUS_LABEL[s]}</h2>
                <span className="ml-auto rounded-full bg-card px-2.5 py-0.5 text-xs font-bold text-foreground">{list.length}</span>
              </div>
              <div className="min-h-[120px] space-y-2.5">
                {list.map((a) => {
                  const sc = nextSchedule(a, now);
                  return (
                    <article key={a.id}
                      onClick={() => !drag && go({ name: "detail", id: a.id })}
                      onPointerDown={(e) => {
                        if ((e.target as HTMLElement).closest("button")) return;
                        const el = e.currentTarget;
                        pressStart.current = { x: e.clientX, y: e.clientY };
                        const { clientX, clientY } = e;
                        pressTimer.current = window.setTimeout(() => begin(a, el, clientX, clientY), 400);
                      }}
                      onPointerMove={(e) => {
                        const p = pressStart.current;
                        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) clearPress();
                      }}
                      onPointerUp={clearPress}
                      onPointerLeave={clearPress}
                      onContextMenu={(e) => e.preventDefault()}
                      className={cn("cursor-pointer rounded-xl border border-border bg-card p-3 shadow-card", drag?.id === a.id && "opacity-40")}>
                      <div className="flex items-start gap-1.5">
                        <button aria-label={`Seret ${a.company}`} style={{ touchAction: "none" }}
                          onPointerDown={(e) => { e.stopPropagation(); begin(a, e.currentTarget.closest("article")!, e.clientX, e.clientY); }}
                          onClick={(e) => e.stopPropagation()}
                          className="-ml-1 mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing">
                          <GripVertical className="h-5 w-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-bold text-foreground">{a.company}</p>
                          <p className="break-words text-sm text-foreground">{a.position}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{a.location || "—"}</p>
                          {sc && (
                            <p className="mt-2 inline-flex flex-wrap items-center gap-1 rounded-lg bg-primary-soft px-2 py-1 text-xs font-semibold text-secondary-foreground">
                              <CalendarClock className="h-3.5 w-3.5" /> {sc.type} · {fmtShortDay(sc.at)}
                            </p>
                          )}
                        </div>
                        <Menu label={`Menu ${a.company}`} items={[{ label: "Pindahkan ke…", onClick: () => setMoveFor(a) }, { label: "Lihat detail", onClick: () => go({ name: "detail", id: a.id }) }]} />
                      </div>
                    </article>
                  );
                })}
                {list.length === 0 && (
                  <div className="grid h-[120px] place-items-center rounded-xl border-2 border-dashed border-input text-sm font-medium text-muted-foreground">{activeCount > 0 ? "Tidak ada yang cocok" : "Belum ada lamaran"}</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      )}

      {drag && dragged && (
        <div className="pointer-events-none fixed z-50 rotate-2 rounded-xl border-2 border-primary bg-card p-3 shadow-2xl"
          style={{ left: drag.x - drag.ox, top: drag.y - drag.oy, width: drag.w }}>
          <p className="font-bold text-foreground">{dragged.company}</p>
          <p className="text-sm text-foreground">{dragged.position}</p>
        </div>
      )}

      <Modal open={!!moveFor} onClose={() => setMoveFor(null)} title={`Pindahkan ${moveFor?.company ?? ""} ke…`}>
        <div className="mt-3 space-y-2">
          {STATUSES.map((s) => (
            <button key={s} disabled={moveFor?.status === s}
              onClick={() => { if (moveFor) move(moveFor.id, s); setMoveFor(null); }}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-border px-4 py-3 text-left font-semibold text-foreground hover:border-primary disabled:bg-disabled disabled:text-disabled-foreground">
              <span className={cn("h-3 w-3 rounded-full", statusDot(s))} /> {STATUS_LABEL[s]}
              {moveFor?.status === s && <span className="ml-auto text-xs">Status saat ini</span>}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
