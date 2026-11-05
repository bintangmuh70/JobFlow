import { describe, it, expect } from "vitest";
import { computeStats, fmtCountdown, fmtDate, fmtTime, seed } from "./data";

describe("JobFlow rules", () => {
  it("funnel stats from the 7 dummy applications", () => {
    const s = computeStats(seed(new Date(2026, 9, 29, 12)));
    expect([s.total, s.reached, s.reachedPct, s.offer, s.offerPct]).toEqual([7, 3, 43, 1, 14]);
    expect([s.interviewToOffer, s.waiting, s.rejected]).toEqual([33, 3, 1]);
  });
  it("countdown format", () => {
    expect(fmtCountdown((19 * 60 + 45) * 60000)).toBe("19 j 45 m");
    expect(fmtCountdown(((24 + 15) * 60 + 45) * 60000)).toBe("1 hari 15 j 45 m");
    expect(fmtCountdown(-5)).toBe("0 j 0 m");
  });
  it("date and time format", () => {
    const d = new Date(2026, 9, 19, 15, 27);
    expect(fmtDate(d)).toBe("19 Okt 2026");
    expect(fmtTime(d)).toBe("15.27");
  });
});

import { filterApps, EMPTY_FILTER, activeFilterCount } from "./data";
describe("Kanban search & filter", () => {
  const apps = seed(new Date(2026, 9, 29, 12));
  const ids = (f: Partial<typeof EMPTY_FILTER>) => filterApps(apps, { ...EMPTY_FILTER, ...f }).map((a) => a.id);
  it("search matches company or position, case-insensitive", () => {
    expect(ids({ q: "  goJEK " })).toEqual(["gojek"]);
    expect(ids({ q: "trainee" })).toEqual(["unilever", "bca"]);
  });
  it("filters by status, source and applied date (inclusive)", () => {
    expect(ids({ statuses: ["offer", "rejected"] })).toEqual(["traveloka", "shopee"]);
    expect(ids({ source: "Situs perusahaan" })).toEqual(["unilever", "bca"]);
    expect(ids({ from: "2026-10-19", to: "2026-10-21" })).toEqual(["tokopedia", "telkom"]);
  });
  it("combines search and filters, never mutates original data", () => {
    const before = JSON.stringify(apps);
    expect(ids({ q: "trainee", statuses: ["interview"] })).toEqual(["bca"]);
    expect(ids({ q: "xyz" })).toEqual([]);
    expect(JSON.stringify(apps)).toBe(before);
    expect(activeFilterCount({ ...EMPTY_FILTER, q: "a", from: "2026-10-01" })).toBe(2);
  });
});

import { STATUSES, STATUS_LABEL, authenticate, SEED_ACCOUNTS, placementStats, seedClassmates, furthestStage } from "./data";
describe("Roles, statuses and placement", () => {
  it("six Kanban statuses in order", () => {
    expect(STATUSES.map((s) => STATUS_LABEL[s])).toEqual(["Applied", "Screening", "Interview", "Offering", "Diterima", "Ditolak"]);
  });
  it("demo logins only work with the matching role", () => {
    expect(authenticate(SEED_ACCOUNTS, "rahima@email.com", "rahima123", "siswa").ok).toBe(true);
    expect(authenticate(SEED_ACCOUNTS, "gurubk@jobflow.id", "gurubk123", "gurubk").ok).toBe(true);
    expect(authenticate(SEED_ACCOUNTS, "gurubk@jobflow.id", "gurubk123", "siswa").ok).toBe(false);
    expect(authenticate(SEED_ACCOUNTS, "rahima@email.com", "salah", "siswa").ok).toBe(false);
  });
  it("no seeded application has a CV attached", () => {
    const now = new Date(2026, 9, 29, 12);
    expect([...seed(now), ...seedClassmates(now)].filter((a) => a.cv)).toEqual([]);
  });
  it("placement stats count students by furthest stage", () => {
    const now = new Date(2026, 9, 29, 12);
    const apps = [...seed(now), ...seedClassmates(now)];
    const ps = placementStats(SEED_ACCOUNTS.filter((a) => a.role === "siswa"), apps);
    expect([ps.students, ps.placed, ps.stageCount.none]).toEqual([7, 2, 1]);
    expect(furthestStage([])).toBe("none");
  });
});
