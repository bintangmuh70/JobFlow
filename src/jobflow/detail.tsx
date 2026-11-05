import { useRef, useState } from "react";
import { MapPin, Send, Calendar, Wallet, ExternalLink, Trash2, FileText, Upload, Bell, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Btn, Card, Field, Input, Header, Menu, Modal, Select, Sheet, statusDot } from "./ui";
import { useStore } from "./store";
import { STATUSES, STATUS_LABEL, REMINDS, fmtDate, fmtDateTime, fmtRp, fmtSize, fmtTime, type Status, type ScheduleType, type Remind } from "./data";
import { SITE_CONFIG } from "@/lib/constants";

const MAX = 5 * 1024 * 1024;

function Info({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span className="w-[112px] shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words text-sm font-semibold text-foreground">{children}</span>
    </div>
  );
}

export function DetailScreen({ id }: { id: string }) {
  const { apps, back, go, setStatus, remove, addSchedule, removeSchedule, update, notifAsked, setNotifAsked, now, cvs, addCv, user } = useStore();
  const a = apps.find((x) => x.id === id);
  const [confirmDel, setConfirmDel] = useState(false);
  const [type, setType] = useState<ScheduleType>("Tes");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [remind, setRemind] = useState<Remind>("1 hari sebelumnya");
  const [askNotif, setAskNotif] = useState(false);
  const [pickCv, setPickCv] = useState(false);
  const [preview, setPreview] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [cvErr, setCvErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!a) {
    return (
      <div className="min-h-screen">
        <Header title="Lamaran tidak ditemukan" onBack={back} />
      </div>
    );
  }

  const saveSchedule = () => {
    const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
    const [h = 0, mi = 0] = time.split(":").map(Number);
    addSchedule(a.id, { type, at: new Date(y, m - 1, d, h || 0, mi || 0), remind });
    toast.success("Jadwal disimpan");
    setDate("");
    if (!notifAsked) setAskNotif(true);
  };

  const onFile = (file?: File) => {
    setCvErr("");
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setCvErr("Format berkas harus PDF");
    if (file.size > MAX) return setCvErr("Ukuran berkas maksimal 5 MB");
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 10 + Math.random() * 15;
      if (p >= 100) {
        clearInterval(t);
        setProgress(null);
        const cv = { name: file.name, size: file.size };
        addCv(cv);
        update(a.id, { cv });
        toast.success("CV berhasil diunggah");
      } else setProgress(p);
    }, 150);
  };

  const scheduled = [...a.schedules].sort((x, y) => x.at.getTime() - y.at.getTime());

  return (
    <div className="min-h-screen pb-10">
      <Header title={a.company} subtitle={a.position} onBack={back}
        right={<Menu light label="Menu lamaran" items={[{ label: "Edit", onClick: () => go({ name: "form", editId: a.id }) }, { label: "Hapus", danger: true, onClick: () => setConfirmDel(true) }]} />} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-5 pt-5 md:px-8 md:pt-7 lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="space-y-4 lg:space-y-5">
        <Card>
          <h2 className="mb-2 font-bold text-foreground">Status</h2>
          <div className="relative">
            <span className={cn("pointer-events-none absolute left-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full", statusDot(a.status))} />
            <select aria-label="Status lamaran" value={a.status}
              onChange={(e) => { setStatus(a.id, e.target.value as Status); toast.success(`Status dipindahkan ke ${STATUS_LABEL[e.target.value as Status]}`); }}
              className="h-12 w-full appearance-none rounded-xl border border-input bg-card pl-9 pr-3 text-[15px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/25">
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <div className="mt-2 divide-y divide-border">
            <Info icon={MapPin} label="Lokasi">{a.location || "—"}</Info>
            <Info icon={Send} label="Dilamar lewat">{a.source}</Info>
            <Info icon={Calendar} label="Tanggal apply">{fmtDate(a.appliedDate)}</Info>
            <Info icon={Wallet} label="Ekspektasi gaji">{a.salary ? fmtRp(a.salary) : "—"}</Info>
          </div>
          {a.url ? (
            <a href={a.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-2">
              <ExternalLink className="h-4 w-4" /> Buka lowongan
            </a>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Tautan lowongan belum diisi</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Terakhir diperbarui: {fmtDate(a.lastUpdated)}</p>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-foreground">Riwayat status</h2>
          <ol className="relative ml-1.5 space-y-3 border-l-2 border-border pl-5">
            {a.history.map((h, i) => (
              <li key={i} className="relative">
                <span className={cn("absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card", statusDot(h.status))} />
                <p className="text-sm text-foreground"><span className="font-bold">{STATUS_LABEL[h.status]}</span> · {fmtDate(h.date)}</p>
              </li>
            ))}
          </ol>
        </Card>
        </div>

        <div className="space-y-4 lg:space-y-5">
        <Card>
          <h2 className="mb-3 font-bold text-foreground">Jadwal tes/wawancara</h2>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label="Tipe jadwal">
            {(["Tes", "Wawancara", "Tenggat"] as ScheduleType[]).map((t) => (
              <button key={t} role="radio" aria-checked={type === t} onClick={() => setType(t)}
                className={cn("rounded-lg py-2 text-sm font-semibold", type === t ? "bg-primary text-primary-foreground" : "text-foreground")}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-[1.4fr_1fr] gap-2">
            <Field label="Tanggal"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Jam"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
          <div className="mt-3"><Field label="Ingatkan"><Select value={remind} onChange={(v) => setRemind(v as Remind)} options={REMINDS.map((r) => ({ value: r, label: r }))} /></Field></div>
          <Btn className="mt-3 w-full" disabled={!date} onClick={saveSchedule}>Simpan jadwal</Btn>
          {!date && <p className="mt-1.5 text-center text-xs text-muted-foreground">Isi tanggal untuk mengaktifkan tombol</p>}

          <div className="mt-4 space-y-2">
            {scheduled.length === 0 && <p className="text-sm text-muted-foreground">Belum ada jadwal tersimpan.</p>}
            {scheduled.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{s.type}{s.at < now && " · Terlewat"}</p>
                  <p className="text-sm text-foreground">{fmtDateTime(s.at)}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Bell className="h-3 w-3" /> {s.remind}</p>
                </div>
                <button aria-label={`Hapus jadwal ${s.type}`} onClick={() => { removeSchedule(a.id, s.id); toast("Jadwal dihapus"); }}
                  className="grid h-9 w-9 place-items-center rounded-full text-danger-foreground hover:bg-danger-soft"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-bold text-foreground">Lampiran CV</h2>
          <p className="mb-3 text-xs text-muted-foreground">Hanya PDF, maks. 5 MB</p>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          {progress !== null ? (
            <div>
              <p className="text-sm font-semibold text-foreground">Mengunggah… {Math.round(progress)}%</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)}>
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : a.cv ? (
            <div>
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-danger-soft text-danger-foreground"><FileText className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{a.cv.name}</p>
                  <p className="text-xs text-muted-foreground">PDF · {fmtSize(a.cv.size)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Btn size="sm" variant="soft" onClick={() => setPreview(true)}>Pratinjau</Btn>
                <Btn size="sm" variant="outline" onClick={() => setPickCv(true)}>Ganti</Btn>
                <Btn size="sm" variant="ghost" className="border-2 border-destructive text-danger-foreground hover:bg-danger-soft" onClick={() => { update(a.id, { cv: undefined }); toast("CV dihapus"); }}>Hapus</Btn>
              </div>
            </div>
          ) : (
            <div>
              <div className="rounded-xl border-2 border-dashed border-input p-4 text-center text-sm font-medium text-muted-foreground">Belum ada CV terlampir</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Btn size="sm" variant="outline" onClick={() => setPickCv(true)}>Pilih dari CV saya</Btn>
                <Btn size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Unggah PDF baru</Btn>
              </div>
            </div>
          )}
          {cvErr && <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-danger-foreground"><AlertCircle className="h-4 w-4" /> {cvErr}</p>}
        </Card>
        </div>
      </div>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Hapus lamaran ini?"
        footer={<>
          <Btn variant="outline" onClick={() => setConfirmDel(false)}>Batal</Btn>
          <Btn variant="danger" onClick={() => { remove(a.id); back(); toast("Lamaran dihapus"); }}>Hapus</Btn>
        </>}>
        Lamaran {a.company} · {a.position} akan dihapus permanen.
      </Modal>

      <Modal open={askNotif} onClose={() => { setAskNotif(false); setNotifAsked(true); }} title={`Izinkan ${SITE_CONFIG.name} mengirim pengingat?`}
        footer={<>
          <Btn variant="outline" onClick={() => { setAskNotif(false); setNotifAsked(true); toast("Pengingat dinonaktifkan"); }}>Nanti</Btn>
          <Btn onClick={() => { setAskNotif(false); setNotifAsked(true); toast.success("Pengingat diaktifkan"); }}>Izinkan</Btn>
        </>}>
        Kami akan mengingatkan Anda sebelum jadwal tes, wawancara, dan tenggat.
      </Modal>

      <Sheet open={pickCv} onClose={() => setPickCv(false)} title="CV saya">
        <div className="space-y-2">
          {cvs.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-input p-4 text-center text-sm font-medium text-muted-foreground">
              Belum ada CV tersimpan. Unggah PDF pertamamu, nanti bisa dipakai lagi untuk lamaran lain.
            </div>
          )}
          {cvs.map((c) => (
            <button key={c.name} onClick={() => { update(a.id, { cv: c }); setPickCv(false); setCvErr(""); toast.success(`${c.name} dilampirkan`); }}
              aria-current={a.cv?.name === c.name ? "true" : undefined}
              className={cn("flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left hover:border-primary", a.cv?.name === c.name ? "border-primary bg-primary-soft" : "border-border")}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-danger-soft text-danger-foreground"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">PDF · {fmtSize(c.size)}</p></div>
              {a.cv?.name === c.name && <span className="text-xs font-bold text-primary">Terlampir</span>}
            </button>
          ))}
          <Btn variant="outline" className="mt-2 w-full" onClick={() => { setPickCv(false); fileRef.current?.click(); }}><Upload className="h-4 w-4" /> Unggah PDF baru</Btn>
        </div>
      </Sheet>

      <Sheet open={preview} onClose={() => setPreview(false)} title={`Pratinjau ${a.cv?.name ?? ""}`}>
        <div className="mx-auto aspect-[1/1.414] w-full max-w-[320px] rounded-lg border border-border bg-card p-5 shadow-card">
          <p className="text-lg font-extrabold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}{user?.phone ? ` · ${user.phone}` : ""}</p>
          <div className="my-3 h-0.5 bg-primary" />
          <p className="text-xs font-bold text-primary">PENDIDIKAN</p>
          <p className="mt-1 text-xs text-foreground">{user?.major} — {user?.school} (2023–2026)</p>
          <p className="mt-3 text-xs font-bold text-primary">PENGALAMAN</p>
          <p className="mt-1 text-xs text-foreground">Praktik Kerja Lapangan — PT Contoh Digital (Feb–Jul 2025)</p>
          <p className="mt-3 text-xs font-bold text-primary">KEAHLIAN</p>
          <p className="mt-1 text-xs text-foreground">SQL, Python, Excel, Figma, Komunikasi</p>
          <div className="mt-4 space-y-1.5">{[90, 75, 85, 60].map((w) => <div key={w} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />)}</div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Pratinjau dummy · diunggah {fmtTime(now)}</p>
      </Sheet>
    </div>
  );
}
