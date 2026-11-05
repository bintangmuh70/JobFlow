import { useState } from "react";
import { LogOut, Mail, CalendarClock, Building2, Check, Copy, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Btn, Card, Header, Modal, Sheet, StatusBadge, SectionTitle, Empty } from "./ui";
import { useStore } from "./store";
import { businessDaysBetween, fmtDate, fmtDateTime, fmtCountdown, COMPANY_PROFILE } from "./data";
import { SITE_CONFIG } from "@/lib/constants";

const CHECKLIST = [
  "Riset profil & produk perusahaan",
  "Latihan perkenalan diri 1 menit",
  "Siapkan 3 pertanyaan untuk pewawancara",
  "Cek koneksi & kamera",
  "Cetak/siapkan CV terbaru",
];

export function HomeScreen() {
  const { apps, user, logout, update, go, now } = useStore();
  const name = user?.name ?? "Siswa";
  const first = name.split(" ")[0];
  const [confirmOut, setConfirmOut] = useState(false);
  const [draftFor, setDraftFor] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});

  const followUps = apps.filter((a) => a.status === "applied" && !a.followedUp && businessDaysBetween(a.lastUpdated, now) >= 7);
  const prep = apps
    .flatMap((a) => a.schedules.filter((s) => s.type === "Wawancara").map((s) => ({ a, s })))
    .filter(({ s }) => s.at > now && s.at.getTime() - now.getTime() < 48 * 3600000)
    .sort((x, y) => x.s.at.getTime() - y.s.at.getTime());
  const draftApp = apps.find((a) => a.id === draftFor);

  const markFollowed = (id: string) => {
    update(id, { followedUp: true });
    setDraftFor(null);
    toast.success("Ditandai sudah follow-up");
  };

  const draftText = draftApp
    ? `Yth. Tim Rekrutmen ${draftApp.company},\n\nSemoga Bapak/Ibu dalam keadaan baik. Saya ${name}, pelamar untuk posisi ${draftApp.position} yang telah mengirimkan lamaran pada ${fmtDate(draftApp.appliedDate)}.\n\nSaya ingin menanyakan perkembangan proses seleksi untuk posisi tersebut. Saya tetap sangat antusias untuk berkontribusi di ${draftApp.company} dan siap memberikan informasi tambahan bila diperlukan.\n\nTerima kasih atas waktu dan perhatiannya.\n\nHormat saya,\n${name}`
    : "";
  const draftSubject = draftApp ? `Follow-up Lamaran ${draftApp.position} – ${name}` : "";

  return (
    <div className="pb-28">
      <Header big title={`Halo, ${first} 👋`} subtitle={user?.school ? `${user.school} · ${user.major ?? ""}` : "Semangat cari kerja hari ini!"}
        right={
          <button aria-label="Keluar" onClick={() => setConfirmOut(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25">
            <LogOut className="h-5 w-5" />
          </button>
        } />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-7 px-5 pt-5 md:px-8 md:pt-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-8">

        <section>
          <SectionTitle>Tindakan hari ini</SectionTitle>
          <div className="space-y-3">
            {followUps.map((a) => (
              <Card key={a.id} className="border-l-[6px] border-l-warning">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-bold text-warning-foreground">
                  <Mail className="h-3.5 w-3.5" /> Follow-up
                </span>
                <p className="mt-2 font-bold text-foreground">{a.company} · {a.position}</p>
                <p className="mt-1 text-sm text-muted-foreground">Sudah 7 hari kerja tanpa kabar, Anda dapat melakukan follow-up.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Btn size="sm" variant="warning" onClick={() => setDraftFor(a.id)}>Lihat draf surel</Btn>
                  <Btn size="sm" onClick={() => markFollowed(a.id)}>Sudah follow-up</Btn>
                </div>
              </Card>
            ))}

            {prep.map(({ a, s }) => {
              const c = checks[s.id] ?? CHECKLIST.map(() => false);
              const done = c.filter(Boolean).length;
              return (
                <Card key={s.id} className="border-l-[6px] border-l-primary">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                    <CalendarClock className="h-3.5 w-3.5" /> Persiapan wawancara
                  </span>
                  <p className="mt-2 font-bold text-foreground">{a.company} · {a.position}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{s.type} · {fmtDateTime(s.at)}</p>
                  <p className="text-sm text-muted-foreground">Sisa waktu {fmtCountdown(s.at.getTime() - now.getTime())}</p>
                  <div className="mt-3 rounded-xl bg-muted p-3">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground"><Building2 className="h-4 w-4" /> Profil singkat perusahaan</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {COMPANY_PROFILE[a.id] ?? `${a.company} adalah perusahaan terkemuka di Indonesia yang berkembang pesat. Pelajari visi, produk utama, dan budaya kerjanya sebelum wawancara.`}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Checklist persiapan</p>
                    <span className="text-sm font-bold text-primary">{done}/{CHECKLIST.length}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={done} aria-valuemax={5}>
                    <div className="h-full bg-primary transition-all" style={{ width: `${(done / 5) * 100}%` }} />
                  </div>
                  <ul className="mt-2 space-y-1">
                    {CHECKLIST.map((item, i) => (
                      <li key={item}>
                        <button onClick={() => setChecks({ ...checks, [s.id]: c.map((v, j) => (j === i ? !v : v)) })}
                          className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm text-foreground" role="checkbox" aria-checked={c[i]}>
                          <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border-2", c[i] ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card")}>
                            {c[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                          <span className={cn(c[i] && "line-through")}>{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}

            {followUps.length === 0 && prep.length === 0 && <Empty text="Tidak ada tindakan hari ini. Semua aman 🎉" />}
          </div>
        </section>

        <section className="lg:sticky lg:top-5">
          <SectionTitle right={<button onClick={() => go({ name: "kanban" })} className="text-sm font-bold text-primary">Lihat semua</button>}>Lamaran terbaru</SectionTitle>
          <div className="space-y-2.5">
            {[...apps].sort((x, y) => y.lastUpdated.getTime() - x.lastUpdated.getTime()).slice(0, 5).map((a) => (
              <Card key={a.id} onClick={() => go({ name: "detail", id: a.id })} className="flex items-center gap-3 p-3.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-base font-extrabold text-primary">{a.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{a.company}</p>
                  <p className="truncate text-sm text-muted-foreground">{a.position}</p>
                </div>
                <StatusBadge status={a.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            ))}
            {apps.length === 0 && <Empty text="Belum ada lamaran" />}
          </div>
        </section>
      </div>

      <Modal open={confirmOut} onClose={() => setConfirmOut(false)} title={`Keluar dari ${SITE_CONFIG.name}?`}
        footer={<>
          <Btn variant="outline" onClick={() => setConfirmOut(false)}>Batal</Btn>
          <Btn variant="danger" onClick={() => { setConfirmOut(false); logout(); toast("Anda telah keluar"); }}>Keluar</Btn>
        </>}>
        Anda perlu masuk kembali untuk melihat lamaran Anda.
      </Modal>

      <Sheet open={!!draftApp} onClose={() => setDraftFor(null)} title="Draf surel follow-up">
        {draftApp && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Subjek</p>
              <p className="mt-1 rounded-xl bg-muted p-3 text-sm font-semibold text-foreground">{draftSubject}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Isi surel</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-muted p-3 text-sm leading-relaxed text-foreground">{draftText}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Btn variant="outline" onClick={() => { navigator.clipboard?.writeText(`Subjek: ${draftSubject}\n\n${draftText}`).catch(() => {}); toast.success("Draf disalin"); }}>
                <Copy className="h-4 w-4" /> Salin draf
              </Btn>
              <Btn onClick={() => markFollowed(draftApp.id)} className="px-2 text-sm">Tandai sudah follow-up</Btn>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
