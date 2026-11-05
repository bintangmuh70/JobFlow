import { useState } from "react";
import { toast } from "sonner";
import { Btn, Field, Input, Header, Select } from "./ui";
import { useStore } from "./store";
import { SOURCES } from "./data";

const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function FormScreen({ editId }: { editId?: string | undefined }) {
  const { apps, add, update, back } = useStore();
  const ex = apps.find((a) => a.id === editId);
  const [f, setF] = useState({
    company: ex?.company ?? "",
    position: ex?.position ?? "",
    date: ex ? toISO(ex.appliedDate) : "",
    source: ex?.source ?? "LinkedIn",
    location: ex?.location ?? "",
    url: ex?.url ?? "",
    salary: ex?.salary ? ex.salary.toLocaleString("id-ID") : "",
  });
  const [err, setErr] = useState<Partial<Record<"company" | "position" | "date" | "url", string>>>({});
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<"company" | "position" | "date" | "url", string>> = {};
    if (!f.company.trim()) er.company = "Perusahaan wajib diisi";
    if (!f.position.trim()) er.position = "Posisi wajib diisi";
    if (!f.date) er.date = "Tanggal apply wajib diisi";
    if (f.url) {
      try {
        const u = new URL(f.url);
        if (!/^https?:$/.test(u.protocol)) throw 0;
      } catch {
        er.url = "Tautan harus berformat URL, contoh: https://contoh.com/lowongan";
      }
    }
    setErr(er);
    if (Object.keys(er).length) return;
    const [y = 0, m = 1, d = 1] = f.date.split("-").map(Number);
    const data = {
      company: f.company.trim(),
      position: f.position.trim(),
      appliedDate: new Date(y, m - 1, d, 9),
      source: f.source,
      location: f.location.trim(),
      url: f.url || undefined,
      salary: f.salary ? Number(f.salary.replace(/\D/g, "")) : undefined,
    };
    if (ex) {
      update(ex.id, data);
      toast.success("Perubahan disimpan");
    } else {
      add(data);
      toast.success("Lamaran disimpan ke kolom Applied");
    }
    back();
  };

  return (
    <div className="min-h-screen">
      <Header title={ex ? "Edit lamaran" : "Catat lamaran"} subtitle={ex ? ex.company : "Tambahkan lamaran baru"} onBack={back} />
      <form onSubmit={submit} noValidate className="px-5 pt-6 pb-32 md:px-8 md:pt-8 md:pb-16">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 md:gap-x-5 md:rounded-2xl md:border md:border-border md:bg-card md:p-7 md:shadow-card">
        <Field label="Perusahaan *" error={err.company}><Input value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Contoh: Tokopedia" err={!!err.company} /></Field>
        <Field label="Posisi *" error={err.position}><Input value={f.position} onChange={(e) => set("position", e.target.value)} placeholder="Contoh: Junior Data Analyst" err={!!err.position} /></Field>
        <Field label="Tanggal apply *" error={err.date}><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} err={!!err.date} /></Field>
        <Field label="Dilamar lewat"><Select value={f.source} onChange={(v) => set("source", v)} options={SOURCES.map((s) => ({ value: s, label: s }))} /></Field>
        <Field label="Lokasi"><Input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Contoh: Jakarta Selatan" /></Field>
        <Field label="Tautan lowongan" error={err.url}><Input type="url" inputMode="url" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" err={!!err.url} /></Field>
        <Field label="Ekspektasi gaji">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-foreground">Rp</span>
            <Input inputMode="numeric" value={f.salary} placeholder="7.000.000" className="pl-11"
              onChange={(e) => { const n = e.target.value.replace(/\D/g, ""); set("salary", n ? Number(n).toLocaleString("id-ID") : ""); }} />
          </div>
        </Field>
        <div className="fixed bottom-0 left-1/2 z-20 w-full -translate-x-1/2 border-t border-border bg-card px-5 py-3 md:static md:col-span-2 md:flex md:translate-x-0 md:justify-end md:gap-3 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-2">
          <Btn type="button" variant="outline" onClick={back} className="hidden md:inline-flex">Batal</Btn>
          <Btn type="submit" className="w-full md:w-auto md:px-8">Simpan lamaran</Btn>
        </div>
        </div>
      </form>
    </div>
  );
}
