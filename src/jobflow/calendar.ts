import type { Application, Schedule } from "./data";

function fmtUtcIcs(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Menghasilkan URL Google Calendar yang langsung terisi detail jadwal seleksi.
 */
export function buildGoogleCalendarUrl(app: Application, schedule: Schedule): string {
  const start = schedule.at;
  const end = new Date(start.getTime() + 60 * 60 * 1000); // durasi default 1 jam
  const title = `${schedule.type} — ${app.company} (${app.position})`;
  const details = [
    `Jadwal ${schedule.type} untuk posisi ${app.position} di ${app.company}.`,
    app.url ? `Tautan lowongan: ${app.url}` : "",
    app.companyNotes ? `Catatan: ${app.companyNotes}` : "",
    `Pengingat: ${schedule.remind}`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmtUtcIcs(start)}/${fmtUtcIcs(end)}`,
    details,
    location: app.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Mengunduh berkas kalender standar (.ics) agar bisa dibuka di Apple Calendar, Outlook, maupun Google Calendar.
 */
export function downloadScheduleIcs(app: Application, schedule: Schedule): void {
  const start = schedule.at;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const title = `${schedule.type} - ${app.company} (${app.position})`;
  const description = [
    `Jadwal ${schedule.type} untuk posisi ${app.position} di ${app.company}.`,
    app.url ? `Tautan: ${app.url}` : "",
    `Pengingat: ${schedule.remind}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobFlow//Jadwal Seleksi//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${schedule.id}@jobflow.id`,
    `DTSTAMP:${fmtUtcIcs(new Date())}`,
    `DTSTART:${fmtUtcIcs(start)}`,
    `DTEND:${fmtUtcIcs(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(app.location || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jobflow-${schedule.type.toLowerCase()}-${app.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Mengunduh data tabel sebagai CSV dengan UTF-8 BOM (langsung rapi dibuka di Microsoft Excel).
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const escapeCell = (v: string | number | null | undefined): string => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [headers.map(escapeCell).join(","), ...rows.map((r) => r.map(escapeCell).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
