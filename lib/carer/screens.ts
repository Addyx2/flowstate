// The Aultrum carer app's screens for a Flowstate carer (Carer API v1).
// Shapes are checked against the shared contract before they're sent.
import type { z } from "zod";

import { daysUntil, expiryState, STATUTORY } from "@/lib/checks";
import * as contract from "@/lib/contracts/aultrum-v1";
import { prisma } from "@/lib/db";

import type { CarerRef } from "./api";

const DAY = 86_400_000;
const TZ = "Europe/London";

const ukDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const hourUk = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(d));
const isWeekend = (d: Date) => ["Sat", "Sun"].includes(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(d));

type ShiftWith = {
  id: string;
  startAt: Date;
  endAt: Date;
  breakMins: number;
  breakStartedAt: Date | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  carerSignedAt: Date | null;
  package: { name: string; kind: string; address: string | null; postcode: string | null; accessInstructions: string | null };
  jobRole: { name: string } | null;
};

const include = { package: true, jobRole: true } as const;

function card(s: ShiftWith): z.infer<typeof contract.shiftCard> {
  const hours = Math.round(((s.endAt.getTime() - s.startAt.getTime()) / 3_600_000 - s.breakMins / 60) * 10) / 10;
  return {
    id: s.id,
    title: s.jobRole?.name ?? "Visit",
    place: s.package.name,
    detail: [s.package.kind === "CARE_HOME" ? "Care home" : "Home visit", s.jobRole?.name].filter(Boolean).join(" · "),
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    day: ukDay(s.startAt),
    night: hourUk(s.startAt) >= 18 || hourUk(s.startAt) < 4,
    weekend: isWeekend(s.startAt),
    sleepIn: false,
    // Pay rates live in Office (payroll), which comes later.
    pay: { rate: null, total: null, hours },
  };
}

function workedMins(s: ShiftWith, now: Date) {
  if (!s.checkInAt) return 0;
  const end = s.checkOutAt ?? now;
  const onBreak = s.breakStartedAt ? Math.round((now.getTime() - s.breakStartedAt.getTime()) / 60_000) : 0;
  return Math.max(0, Math.round((end.getTime() - s.checkInAt.getTime()) / 60_000) - s.breakMins - onBreak);
}

function timesheetOf(s: ShiftWith, now: Date) {
  if (!s.checkInAt) return null;
  return {
    id: s.id,
    clockIn: s.checkInAt.toISOString(),
    clockOut: s.checkOutAt?.toISOString() ?? null,
    breakStartedAt: s.breakStartedAt?.toISOString() ?? null,
    breakTakenMins: s.breakMins,
    workedMins: workedMins(s, now),
    locationRecorded: false,
    carerSigned: Boolean(s.carerSignedAt),
    clientSigned: false,
    homeSignsInWorkspace: false,
  };
}

async function org(c: CarerRef) {
  const carer = await prisma.carer.findFirstOrThrow({ where: { id: c.carerId, agencyId: c.agencyId }, include: { agency: true } });
  return { carer, org: carer.agency.name };
}

function payDates(now: Date) {
  const cutoff = new Date(now);
  cutoff.setHours(16, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() + ((8 - cutoff.getDay()) % 7 || (now.getDay() === 1 && now.getHours() < 16 ? 0 : 7)));
  const payDay = new Date(cutoff.getTime() + 4 * DAY);
  payDay.setHours(9, 0, 0, 0);
  return { payCutoff: cutoff.toISOString(), payDay: payDay.toISOString() };
}

export async function homeScreen(c: CarerRef, now = new Date()) {
  const { carer, org: orgName } = await org(c);
  const shifts = await prisma.shift.findMany({
    where: { agencyId: c.agencyId, carerId: c.carerId, startAt: { gte: new Date(now.getTime() - 2 * DAY), lt: new Date(now.getTime() + 15 * DAY) }, status: { in: ["BOOKED", "COMPLETED"] } },
    include,
    orderBy: { startAt: "asc" },
  });
  const toSign = shifts.filter((s) => s.checkOutAt && !s.carerSignedAt);
  const current =
    shifts.find((s) => s.checkInAt && !s.checkOutAt) ??
    shifts.find((s) => !s.checkInAt && s.endAt > now && s.startAt.getTime() < now.getTime() + 2 * 3_600_000) ??
    toSign.at(-1) ??
    shifts.find((s) => !s.checkInAt && s.endAt > now && s.startAt.getTime() < now.getTime() + 18 * 3_600_000) ??
    null;

  const state = (s: ShiftWith) =>
    s.checkInAt && !s.checkOutAt ? (s.breakStartedAt ? "on_break" : "on_shift") : s.checkOutAt ? "to_sign" : s.startAt.getTime() < now.getTime() + 2 * 3_600_000 ? "starting" : "next";

  const screen = {
    firstName: carer.firstName,
    org: orgName,
    current: current
      ? {
          ...card(current),
          state: state(current),
          // Address and access only for the shift in hand, never in notifications.
          address: [current.package.address, current.package.postcode].filter(Boolean).join(", ") || null,
          mapsQuery: current.package.postcode,
          siteNotes: current.package.accessInstructions,
          notes: null,
          timesheet: timesheetOf(current, now),
        }
      : null,
    offers: [],
    toSign: toSign.map((s) => ({ ...card(s), timesheetId: s.id, needs: "yours" as const, homeSignsInWorkspace: false })),
    upcoming: shifts.filter((s) => s.startAt > now && s.id !== current?.id).map(card),
    ...payDates(now),
  };
  return contract.homeScreen.parse(screen);
}

export async function poolScreen(c: CarerRef, now = new Date()) {
  const { org: orgName } = await org(c);
  const until = new Date(now.getTime() + 14 * DAY);
  const [open, mine, requests, timeOff] = await Promise.all([
    prisma.shift.findMany({ where: { agencyId: c.agencyId, status: "OPEN", startAt: { gt: now, lt: until } }, include, orderBy: { startAt: "asc" } }),
    prisma.shift.findMany({ where: { carerId: c.carerId, status: "BOOKED", startAt: { lt: until }, endAt: { gt: now } } }),
    prisma.shiftRequest.findMany({ where: { carerId: c.carerId, kind: "SHIFT", shiftId: { not: null } }, orderBy: { createdAt: "desc" } }),
    prisma.shiftRequest.findMany({ where: { carerId: c.carerId, kind: "TIME_OFF", status: "APPROVED", endAt: { gt: now } } }),
  ]);
  const requestFor = new Map<string, string>();
  for (const r of requests) if (r.shiftId && !requestFor.has(r.shiftId)) requestFor.set(r.shiftId, r.status);
  const statusMap = { PENDING: "PENDING", APPROVED: "ACCEPTED", DECLINED: "REJECTED" } as const;
  return contract.poolScreen.parse({
    org: orgName,
    shifts: open.map((s) => {
      const r = requestFor.get(s.id) as keyof typeof statusMap | undefined;
      const clash = mine.some((m) => m.startAt < s.endAt && m.endAt > s.startAt) || timeOff.some((t) => t.startAt! < s.endAt && t.endAt! > s.startAt);
      return { ...card(s), request: r ? statusMap[r] : null, unavailable: clash };
    }),
  });
}

export async function calendarScreen(c: CarerRef, monthKey: string | null, now = new Date()) {
  const { org: orgName } = await org(c);
  const month = monthKey && /^\d{4}-\d{2}$/.test(monthKey) ? monthKey : ukDay(now).slice(0, 7);
  const [y, m] = month.split("-").map(Number) as [number, number];
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  const [shifts, pending, timeOff] = await Promise.all([
    prisma.shift.findMany({ where: { carerId: c.carerId, status: { in: ["BOOKED", "COMPLETED"] }, startAt: { gte: from, lt: to } }, include, orderBy: { startAt: "asc" } }),
    prisma.shiftRequest.findMany({ where: { carerId: c.carerId, kind: "SHIFT", status: "PENDING", shift: { startAt: { gte: from, lt: to } } }, include: { shift: { include } } }),
    prisma.shiftRequest.findMany({ where: { carerId: c.carerId, kind: "TIME_OFF", status: { in: ["PENDING", "APPROVED"] }, endAt: { gte: from }, startAt: { lt: to } } }),
  ]);
  const blocked = new Set<string>();
  for (const t of timeOff.filter((t) => t.status === "APPROVED")) {
    for (let d = new Date(t.startAt!); d <= t.endAt!; d = new Date(d.getTime() + DAY)) blocked.add(ukDay(d));
  }
  return contract.calendarScreen.parse({
    org: orgName,
    month,
    today: ukDay(now),
    shifts: shifts.map(card),
    requests: pending.filter((p) => p.shift).map((p) => card(p.shift!)),
    blockedDays: [...blocked].filter((d) => d.startsWith(month)).sort(),
    rules: timeOff.map((t) => ({ id: t.id, startsOn: ukDay(t.startAt!), endsOn: ukDay(t.endAt!), weekday: null, reason: t.status === "PENDING" ? `${t.note ?? "Time off"} (waiting)` : t.note })),
  });
}

export async function passportScreen(c: CarerRef, now = new Date()) {
  const { carer, org: orgName } = await org(c);
  const checks = await prisma.check.findMany({ where: { carerId: carer.id }, orderBy: { createdAt: "asc" } });
  const row = (group: "statutory" | "training", title: string, check: (typeof checks)[number] | undefined) => {
    const state = expiryState(check, now);
    return { group, title, detail: check?.reference ?? null, state, expiresAt: check?.expiresAt?.toISOString() ?? null, daysLeft: check?.expiresAt ? daysUntil(check.expiresAt, now) : null };
  };
  const training = [...new Map(checks.filter((k) => k.kind === "TRAINING").map((k) => [k.name, k])).values()];
  return contract.passportScreen.parse({
    org: orgName,
    rows: [...STATUTORY.map((s) => row("statutory", s.label, checks.filter((k) => k.kind === s.kind).at(-1))), ...training.map((t) => row("training", t.name, t))],
  });
}

/** Peak runs on Canvas; it isn't connected to Flowstate yet. */
export async function peakScreen(c: CarerRef) {
  const { org: orgName } = await org(c);
  return contract.peakScreen.parse({ org: orgName, on: false });
}

export async function timesheetsScreen(c: CarerRef, now = new Date()) {
  const { org: orgName } = await org(c);
  const shifts = await prisma.shift.findMany({
    where: { carerId: c.carerId, checkOutAt: { not: null, gte: new Date(now.getTime() - 35 * DAY) } },
    include,
    orderBy: { startAt: "desc" },
    take: 60,
  });
  return contract.timesheetsScreen.parse({
    org: orgName,
    timesheets: shifts.map((s) => ({
      id: s.id,
      title: s.jobRole?.name ?? "Visit",
      place: s.package.name,
      clockIn: s.checkInAt!.toISOString(),
      clockOut: s.checkOutAt!.toISOString(),
      workedMins: workedMins(s, now),
      status: s.carerSignedAt ? "SIGNED" : "PENDING",
      stage: s.carerSignedAt ? "closed" : "to_sign",
      carerSigned: Boolean(s.carerSignedAt),
      homeSignsInWorkspace: false,
      signedBy: null,
      signedPosition: null,
      signedAt: s.carerSignedAt?.toISOString() ?? null,
      daysWaiting: s.carerSignedAt ? null : Math.floor((now.getTime() - s.checkOutAt!.getTime()) / DAY),
    })),
  });
}
