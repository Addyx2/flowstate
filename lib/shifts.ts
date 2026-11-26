// Shift rules shared by the office screens, Assist and the Carer API, so a
// booking follows the same rules however it's made.
import type { SignalKind } from "@prisma/client";

import { expiryState } from "./checks";
import { prisma } from "./db";
import { fmtRange, fullName } from "./format";
import { milesBetween } from "./geo";
import { complianceGate, rapportPairs, readinessIssues } from "./qualifiers";

export type Result = { ok: true; message: string } | { ok: false; error: string };

const LATE_AFTER_MINS = 10;

async function signal(agencyId: string, kind: SignalKind, carerId: string, packageId: string, value?: number) {
  await prisma.signal.create({ data: { agencyId, kind, carerId, packageId, value } });
}

/** Overlapping booked shifts for a carer. */
async function clashes(carerId: string, startAt: Date, endAt: Date, exceptShiftId?: string) {
  return prisma.shift.findFirst({
    where: { carerId, status: { in: ["BOOKED", "COMPLETED"] }, id: exceptShiftId ? { not: exceptShiftId } : undefined, startAt: { lt: endAt }, endAt: { gt: startAt } },
    include: { package: true },
  });
}

/** Book a carer onto a shift. The Compliance gate and clashes block it. */
export async function bookShift(agencyId: string, shiftId: string, carerId: string, opts: { viaOffer?: boolean } = {}): Promise<Result> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId }, include: { package: true } });
  if (!shift) return { ok: false, error: "Shift not found" };
  if (shift.status === "CANCELLED" || shift.status === "COMPLETED") return { ok: false, error: "That shift is closed" };
  if (shift.endAt < new Date()) return { ok: false, error: "That shift has already ended" };
  const gate = await complianceGate(agencyId, carerId);
  if (gate) return { ok: false, error: `Can't book: ${gate}` };
  const clash = await clashes(carerId, shift.startAt, shift.endAt, shift.id);
  if (clash) return { ok: false, error: `Clashes with ${fmtRange(clash.startAt, clash.endAt)} at ${clash.package.name}` };
  const carer = await prisma.carer.findUniqueOrThrow({ where: { id: carerId } });
  await prisma.shift.update({ where: { id: shift.id }, data: { carerId, status: "BOOKED" } });
  if (opts.viaOffer) await signal(agencyId, "OFFER_ACCEPTED", carerId, shift.packageId);
  return { ok: true, message: `${fullName(carer)} booked ${fmtRange(shift.startAt, shift.endAt)} at ${shift.package.name}` };
}

/** Take the carer off a shift; it goes back to open. */
export async function unassignShift(agencyId: string, shiftId: string): Promise<Result> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId, status: "BOOKED" }, include: { package: true } });
  if (!shift) return { ok: false, error: "No booked shift found" };
  await prisma.shift.update({ where: { id: shift.id }, data: { carerId: null, status: "OPEN" } });
  return { ok: true, message: `${fmtRange(shift.startAt, shift.endAt)} at ${shift.package.name} is open again` };
}

export async function cancelShift(agencyId: string, shiftId: string, by: "AGENCY" | "CLIENT" | "CARER"): Promise<Result> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId, status: { in: ["OPEN", "BOOKED"] } }, include: { package: true } });
  if (!shift) return { ok: false, error: "No open or booked shift found" };
  await prisma.shift.update({ where: { id: shift.id }, data: { status: "CANCELLED", cancelledBy: by } });
  // Only a carer's own cancellation counts against them (Peak fairness rules).
  if (by === "CARER" && shift.carerId) await signal(agencyId, "NO_SHOW", shift.carerId, shift.packageId);
  return { ok: true, message: `Cancelled ${fmtRange(shift.startAt, shift.endAt)} at ${shift.package.name}` };
}

export async function createShift(
  agencyId: string,
  input: { packageId: string; startAt: Date; endAt: Date; jobRoleId?: string | null; carerId?: string | null },
): Promise<Result & { shiftId?: string }> {
  if (!(input.endAt > input.startAt)) return { ok: false, error: "The end must be after the start" };
  if (input.endAt.getTime() - input.startAt.getTime() > 24 * 3_600_000) return { ok: false, error: "A shift can't be longer than 24 hours" };
  const pkg = await prisma.package.findFirst({ where: { id: input.packageId, agencyId } });
  if (!pkg) return { ok: false, error: "Package not found" };
  const shift = await prisma.shift.create({ data: { agencyId, packageId: pkg.id, startAt: input.startAt, endAt: input.endAt, jobRoleId: input.jobRoleId ?? null, status: "OPEN" } });
  if (input.carerId) {
    const booked = await bookShift(agencyId, shift.id, input.carerId);
    if (!booked.ok) return { ok: true, shiftId: shift.id, message: `Shift created but left open — ${booked.error}` };
  }
  return { ok: true, shiftId: shift.id, message: `Shift created for ${fmtRange(input.startAt, input.endAt)} at ${pkg.name}` };
}

const timeOn = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
};

/** Create a week of shifts from a rota, skipping any already there. */
export async function generateFromRota(agencyId: string, rotaId: string, weekStart: Date): Promise<Result> {
  const rota = await prisma.rota.findFirst({ where: { id: rotaId, agencyId, active: true }, include: { lines: true, package: true } });
  if (!rota) return { ok: false, error: "Rota not found" };
  let created = 0;
  let left = 0;
  for (const line of rota.lines) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + line.weekday);
    const startAt = timeOn(day, line.startTime);
    let endAt = timeOn(day, line.endTime);
    if (endAt <= startAt) endAt = new Date(endAt.getTime() + 86_400_000);
    if (endAt < new Date()) continue;
    const exists = await prisma.shift.findFirst({ where: { packageId: rota.packageId, startAt, endAt, status: { not: "CANCELLED" } } });
    if (exists) continue;
    const shift = await prisma.shift.create({ data: { agencyId, packageId: rota.packageId, rotaId: rota.id, jobRoleId: line.jobRoleId, startAt, endAt, status: "OPEN" } });
    created++;
    if (line.carerId) {
      const booked = await bookShift(agencyId, shift.id, line.carerId);
      if (!booked.ok) left++;
    } else left++;
  }
  return { ok: true, message: `${created} shift${created === 1 ? "" : "s"} created for ${rota.package.name}${left ? `, ${left} left open` : ""}` };
}

/** Approve or decline a carer's request. */
export async function decideRequest(agencyId: string, requestId: string, approve: boolean, userId: string): Promise<Result> {
  const req = await prisma.shiftRequest.findFirst({ where: { id: requestId, agencyId, status: "PENDING" }, include: { carer: true, shift: { include: { package: true } } } });
  if (!req) return { ok: false, error: "No pending request found" };
  const who = fullName(req.carer);
  if (approve) {
    if (req.kind === "SHIFT" && req.shift) {
      const booked = await bookShift(agencyId, req.shift.id, req.carerId, { viaOffer: true });
      if (!booked.ok) return booked;
    }
    if (req.kind === "SWAP" && req.shift) {
      await unassignShift(agencyId, req.shift.id);
      await signal(agencyId, "SWAP_OFF", req.carerId, req.shift.packageId);
    }
  }
  await prisma.shiftRequest.update({ where: { id: req.id }, data: { status: approve ? "APPROVED" : "DECLINED", decidedById: userId, decidedAt: new Date() } });
  const what = req.kind === "TIME_OFF" ? "time off" : req.kind === "SWAP" ? "swap" : "shift request";
  return { ok: true, message: `${approve ? "Approved" : "Declined"} ${who}'s ${what}${approve && req.kind === "SWAP" ? " — the shift is open again" : ""}` };
}

/** A carer asks for an open shift (from the carer app's pool). */
export async function requestOpenShift(agencyId: string, carerId: string, shiftId: string, note?: string | null): Promise<"requested" | "gone" | "overlap"> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId, status: "OPEN", startAt: { gt: new Date() } } });
  if (!shift) return "gone";
  if (await clashes(carerId, shift.startAt, shift.endAt)) return "overlap";
  const existing = await prisma.shiftRequest.findFirst({ where: { carerId, shiftId, status: "PENDING" } });
  if (!existing) await prisma.shiftRequest.create({ data: { agencyId, carerId, kind: "SHIFT", shiftId, note: note?.slice(0, 200) || null } });
  return "requested";
}

/** Visit check-in from the carer app: records punctuality. */
export async function checkIn(agencyId: string, carerId: string, shiftId: string, now = new Date()): Promise<Result> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId, carerId, status: "BOOKED" }, include: { package: true } });
  if (!shift) return { ok: false, error: "That shift isn't yours" };
  if (shift.checkInAt) return { ok: false, error: "You've already checked in" };
  if (now.getTime() < shift.startAt.getTime() - 60 * 60_000) return { ok: false, error: "It's too early to check in" };
  await prisma.shift.update({ where: { id: shift.id }, data: { checkInAt: now } });
  const lateMins = Math.round((now.getTime() - shift.startAt.getTime()) / 60_000);
  await signal(agencyId, lateMins > LATE_AFTER_MINS ? "LATE" : "ON_TIME", carerId, shift.packageId, Math.max(0, lateMins));
  return { ok: true, message: `Checked in at ${shift.package.name}` };
}

export async function checkOut(agencyId: string, carerId: string, shiftId: string, now = new Date()): Promise<Result> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId, carerId, status: "BOOKED" }, include: { package: true } });
  if (!shift?.checkInAt) return { ok: false, error: "Check in first" };
  const breakMins = shift.breakStartedAt ? shift.breakMins + Math.round((now.getTime() - shift.breakStartedAt.getTime()) / 60_000) : shift.breakMins;
  await prisma.shift.update({ where: { id: shift.id }, data: { checkOutAt: now, status: "COMPLETED", breakStartedAt: null, breakMins } });
  await signal(agencyId, "SHIFT_COMPLETED", carerId, shift.packageId);
  return { ok: true, message: "Checked out. Thank you." };
}

// ── Suggestions: who to book, with reasons ────────────────────────────────

export interface Suggestion {
  carerId: string;
  name: string;
  score: number;
  reasons: string[];
  blockers: string[];
}

/** Rank carers for an open shift: team and Rapport first, then distance; blockers shown, never hidden. */
export async function suggestCarers(agencyId: string, shiftId: string, now = new Date()): Promise<Suggestion[]> {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, agencyId }, include: { package: { include: { team: true } }, jobRole: true } });
  if (!shift) return [];
  const weekAgo = new Date(shift.startAt.getTime() - 7 * 86_400_000);
  const weekOn = new Date(shift.startAt.getTime() + 7 * 86_400_000);
  const [carers, pairs, nearby, timeOff] = await Promise.all([
    prisma.carer.findMany({ where: { agencyId, status: "ACTIVE" }, include: { checks: true } }),
    rapportPairs(agencyId, now, { packageId: shift.packageId }),
    prisma.shift.findMany({ where: { agencyId, status: { in: ["BOOKED"] }, carerId: { not: null }, startAt: { gte: weekAgo, lte: weekOn } }, include: { package: true } }),
    prisma.shiftRequest.findMany({ where: { agencyId, kind: "TIME_OFF", status: "APPROVED", startAt: { lte: shift.endAt }, endAt: { gte: shift.startAt } } }),
  ]);
  const team = new Set(shift.package.team.map((t) => t.carerId));
  const rapport = new Map(pairs.map((p) => [p.carerId, p.rapport]));
  const off = new Set(timeOff.map((t) => t.carerId));

  const out: Suggestion[] = [];
  for (const c of carers) {
    const reasons: string[] = [];
    const blockers: string[] = [];
    let score = 0;
    if (team.has(c.id)) {
      score += 30;
      reasons.push("on this Package's team");
    }
    const r = rapport.get(c.id);
    if (r) {
      score += r.score / 3;
      reasons.push(`rapport ${r.score}`);
    }
    const miles = milesBetween(c, shift.package);
    if (miles !== null) {
      score -= miles * 1.5;
      reasons.push(`${miles.toFixed(1)} miles away`);
    }
    for (const s of [{ kind: "DBS", label: "DBS" }, { kind: "RIGHT_TO_WORK", label: "Right to work" }] as const) {
      const state = expiryState(c.checks.find((k) => k.kind === s.kind), now);
      if (state === "EXPIRED" || state === "MISSING") blockers.push(`${s.label} ${state.toLowerCase()}`);
    }
    const gaps = (shift.jobRole?.requiredTraining ?? []).filter((t) => ["MISSING", "EXPIRED"].includes(expiryState(c.checks.find((k) => k.kind === "TRAINING" && k.name === t), now)));
    if (gaps.length) {
      score -= 20;
      reasons.push(`no ${gaps.join(", ")}`);
    }
    if (off.has(c.id)) blockers.push("on approved time off");
    const mine = nearby.filter((n) => n.carerId === c.id && n.id !== shift.id);
    if (mine.some((n) => n.startAt < shift.endAt && n.endAt > shift.startAt)) blockers.push("already booked then");
    else {
      const issues = readinessIssues(
        [...mine, { ...shift, package: shift.package }].map((s) => ({ id: s.id, startAt: s.startAt, endAt: s.endAt, lat: s.package.lat, lng: s.package.lng, label: s.package.name })),
        c.maxWeeklyHours,
      ).filter((i) => i.shiftId === shift.id);
      for (const i of issues) {
        score -= 15;
        reasons.push(i.reason);
      }
    }
    out.push({ carerId: c.id, name: fullName(c), score: Math.round(score), reasons, blockers });
  }
  return out.sort((a, b) => (a.blockers.length ? 1 : 0) - (b.blockers.length ? 1 : 0) || b.score - a.score);
}
