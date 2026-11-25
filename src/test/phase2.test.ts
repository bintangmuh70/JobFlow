import { describe, expect, it } from "vitest";
import { pathToScreen, screenToPath } from "@/jobflow/url";
import { buildGoogleCalendarUrl } from "@/jobflow/calendar";
import type { Application, Schedule } from "@/jobflow/data";

describe("URL routing mapper (Phase 2)", () => {
  it("maps student and guru screens cleanly to paths and back", () => {
    const cases = [
      [{ name: "login" } as const, "/login"],
      [{ name: "register" } as const, "/register"],
      [{ name: "home" } as const, "/beranda"],
      [{ name: "kanban" } as const, "/lamaran"],
      [{ name: "radar" } as const, "/radar"],
      [{ name: "dashboard" } as const, "/dasbor"],
      [{ name: "form" } as const, "/lamaran/baru"],
      [{ name: "form", editId: "abc-123" } as const, "/lamaran/abc-123/edit"],
      [{ name: "detail", id: "abc-123" } as const, "/lamaran/abc-123"],
      [{ name: "gb-dashboard" } as const, "/guru/dasbor"],
      [{ name: "gb-students" } as const, "/guru/siswa"],
      [{ name: "gb-student", id: "std-1" } as const, "/guru/siswa/std-1"],
      [{ name: "gb-progress" } as const, "/guru/progres"],
      [{ name: "gb-stats" } as const, "/guru/statistik"],
      [{ name: "gb-profile" } as const, "/guru/profil"],
    ] as const;

    for (const [screen, expectedPath] of cases) {
      expect(screenToPath(screen)).toBe(expectedPath);
      expect(pathToScreen(expectedPath)).toEqual(screen);
    }
  });
});

describe("Calendar integration (Phase 2)", () => {
  it("generates a valid Google Calendar template URL", () => {
    const app: Application = {
      id: "1",
      studentId: "s1",
      company: "Gojek",
      position: "Software Engineer",
      location: "Jakarta Selatan",
      source: "LinkedIn",
      appliedDate: new Date("2026-11-01T02:00:00Z"),
      status: "interview",
      lastUpdated: new Date("2026-11-05T02:00:00Z"),
      history: [],
      schedules: [],
    };
    const schedule: Schedule = {
      id: "sc1",
      type: "Wawancara",
      at: new Date("2026-11-10T03:00:00Z"),
      remind: "1 hari sebelumnya",
    };

    const url = buildGoogleCalendarUrl(app, schedule);
    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("Gojek");
    expect(url).toContain("20261110T030000Z%2F20261110T040000Z");
  });
});
