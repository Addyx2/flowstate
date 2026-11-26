// The Aultrum Layers (docs/spec/persona.md, D15–D17).
// Every flag says why. Qualifiers judge the work — carers, shifts, Packages'
// logistics and pairings — never the person receiving care.

import type { SignalKind } from "@prisma/client";

import { expiryState, STATUTORY } from "./checks";
import { prisma } from "./db";
import { fmtRange, fullName } from "./format";
import { milesBetween } from "./geo";

export type LayerId = "competence" | "compliance" | "readiness" | "rapport";
export type Severity = "block" | "warn";

export interface Flag {
  id: string;
  severity: Severity;
  subject: string;
  href: string;
  reason: string;
  action: string;
}

export interface Layer {
  id: LayerId;
  name: string;
  measures: string;
  flags: Flag[];
}

export const LAYERS: Omit<Layer, "flags">[] = [
  { id: "competence", name: "Competence", measures: "Carers have the training their booked role needs." },
  { id: "compliance", name: "Compliance", measures: "Worker checks — DBS, right to work, training — are in date. One failed check rules a booking out." },
  { id: "readiness", name: "Shift Readiness", measures: "Fatigue and capacity: long days, overlaps, rest, weekly hours and travel between visits." },
  { id: "rapport", name: "Rapport", measures: "The bond between carers and Packages, from patterns in praise, continuity, punctuality, swaps, offers, feedback and distance." },
];

// ── Rapport v0: explainable rules over recorded signals ───────────────────

export const RAPPORT_RULES_VERSION = "rapport-v0";
const RAPPORT_WINDOW_DAYS = 56;
export const RAPPORT_LOW = 40;

export interface PairStats {
  visits: number;
  onTime: number;
  late: number;
  noShows: number;
  praise: number;
  swapOffs: number;
  offersAccepted: number;
  offersDeclined: number;
  complaints: number;
  changeAsked: number;
  feedback: number;
  miles: number | null;
}

export const emptyStats = (): PairStats => ({
  visits: 0,
  onTime: 0,
  late: 0,
  noShows: 0,
  praise: 0,
  swapOffs: 0,
  offersAccepted: 0,
  offersDeclined: 0,
  complaints: 0,
  changeAsked: 0,
  feedback: 0,
  miles: null,
});

export function addSignal(stats: PairStats, kind: SignalKind, value: number | null) {
  switch (kind) {
    case "SHIFT_COMPLETED":
      stats.visits++;
      break;
    case "ON_TIME":
      stats.onTime++;
      break;
    case "LATE":
      stats.late++;
      break;
    case "NO_SHOW":
      stats.noShows++;
      break;
    case "PRAISE":
      stats.praise++;
      break;
    case "SWAP_OFF":
      stats.swapOffs++;
      break;
    case "OFFER_ACCEPTED":
      stats.offersAccepted++;
      break;
    case "OFFER_DECLINED":
      stats.offersDeclined++;
      break;
    case "COMPLAINT":
      stats.complaints++;
      break;
    case "CHANGE_CARER_ASKED":
      stats.changeAsked++;
      break;
    case "COORDINATOR_FEEDBACK":
      stats.feedback += value ?? 0;
      break;
  }
}

export interface RapportScore {
  score: number;
  reasons: string[];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Rapport v0. Simple, named rules so every number can be explained. */
export function scoreRapport(s: PairStats): RapportScore {
  let score = 50;
  const reasons: { weight: number; text: string }[] = [];
  const add = (delta: number, text: string) => {
    if (delta === 0) return;
    score += delta;
    reasons.push({ weight: Math.abs(delta), text: `${delta > 0 ? "+" : "−"} ${text}` });
  };

  add(Math.min(s.visits, 12) * 2, `${plural(s.visits, "visit")} together`);
  add(s.praise * 6, plural(s.praise, "praise"));
  const timed = s.onTime + s.late;
  if (timed >= 3) {
    const rate = s.onTime / timed;
    add(Math.round((rate - 0.9) * 50), `on time ${Math.round(rate * 100)}% of visits`);
  }
  add(-s.noShows * 15, plural(s.noShows, "missed visit"));
  add(-s.swapOffs * 10, `asked to swap off ${plural(s.swapOffs, "time")}`);
  add(s.offersAccepted * 3 - s.offersDeclined * 4, `${s.offersAccepted} offers accepted, ${s.offersDeclined} declined`);
  add(-s.complaints * 20, plural(s.complaints, "complaint"));
  add(-s.changeAsked * 25, `change of carer asked ${plural(s.changeAsked, "time")}`);
  add(Math.round(s.feedback * 8), "coordinator feedback");
  if (s.miles !== null) {
    if (s.miles > 10) add(-10, `${s.miles.toFixed(1)} miles away`);
    else if (s.miles > 5) add(-5, `${s.miles.toFixed(1)} miles away`);
    else add(3, `${s.miles.toFixed(1)} miles away`);
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons: reasons.sort((a, b) => b.weight - a.weight).map((r) => r.text),
  };
}

export interface Pair {
  carerId: string;
  carerName: string;
  packageId: string;
  packageName: string;
  onTeam: boolean;
  stats: PairStats;
  rapport: RapportScore;
}

/** Rapport for every carer–Package pairing that has history or a team place. */
export async function rapportPairs(agencyId: string, now = new Date(), filter: { packageId?: string; carerId?: string } = {}): Promise<Pair[]> {
  const since = new Date(now.getTime() - RAPPORT_WINDOW_DAYS * 86_400_000);
  const [signals, team, carers, packages] = await Promise.all([
    prisma.signal.findMany({ where: { agencyId, at: { gte: since }, packageId: filter.packageId ?? { not: null }, carerId: filter.carerId } }),
    prisma.teamMember.findMany({ where: { package: { agencyId }, packageId: filter.packageId, carerId: filter.carerId } }),
    prisma.carer.findMany({ where: { agencyId }, select: { id: true, firstName: true, lastName: true, lat: true, lng: true } }),
    prisma.package.findMany({ where: { agencyId }, select: { id: true, name: true, lat: true, lng: true } }),
  ]);
  const carerById = new Map(carers.map((c) => [c.id, c]));
  const pkgById = new Map(packages.map((p) => [p.id, p]));
  const onTeam = new Set(team.map((t) => `${t.carerId}:${t.packageId}`));
  const stats = new Map<string, PairStats>();
  const key = (c: string, p: string) => `${c}:${p}`;
  for (const t of team) stats.set(key(t.carerId, t.packageId), emptyStats());
  for (const s of signals) {
    if (!s.packageId) continue;
    const k = key(s.carerId, s.packageId);
    if (!stats.has(k)) stats.set(k, emptyStats());
    addSignal(stats.get(k)!, s.kind, s.value);
  }
  const pairs: Pair[] = [];
  for (const [k, st] of stats) {
    const [carerId, packageId] = k.split(":") as [string, string];
    const carer = carerById.get(carerId);
    const pkg = pkgById.get(packageId);
    if (!carer || !pkg) continue;
    st.miles = milesBetween(carer, pkg);
    pairs.push({ carerId, carerName: fullName(carer), packageId, packageName: pkg.name, onTeam: onTeam.has(k), stats: st, rapport: scoreRapport(st) });
  }
  return pairs.sort((a, b) => a.rapport.score - b.rapport.score);
}

// ── Shift Readiness: pure checks over one carer's shifts ─────────────────

export interface ReadinessShift {
  id: string;
  startAt: Date;
  endAt: Date;
  lat: number | null;
  lng: number | null;
  label: string;
}

export const MAX_SHIFT_HOURS = 12;
export const MIN_REST_HOURS = 11;
const TRAVEL_MPH = 20;

export function readinessIssues(shifts: ReadinessShift[], maxWeeklyHours: number): { shiftId: string; reason: string }[] {
  const issues: { shiftId: string; reason: string }[] = [];
  const sorted = [...shifts].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const hours = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 3_600_000;

  for (const s of sorted) {
    const h = hours(s.startAt, s.endAt);
    if (h > MAX_SHIFT_HOURS) issues.push({ shiftId: s.id, reason: `${h.toFixed(1)}-hour shift (${s.label})` });
  }
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    const gapH = hours(prev.endAt, cur.startAt);
    if (gapH < 0) {
      issues.push({ shiftId: cur.id, reason: `overlaps another shift (${prev.label})` });
      continue;
    }
    const miles = milesBetween(prev, cur);
    const sameDay = prev.endAt.toDateString() === cur.startAt.toDateString();
    if (miles !== null && miles > 1 && gapH * TRAVEL_MPH < miles) {
      issues.push({ shiftId: cur.id, reason: `${miles.toFixed(1)} miles from the last visit with ${Math.round(gapH * 60)} minutes to get there` });
    } else if (!sameDay && gapH < MIN_REST_HOURS) {
      issues.push({ shiftId: cur.id, reason: `only ${gapH.toFixed(1)} hours' rest before it` });
    }
  }
  // Weekly hours, Monday to Sunday.
  const weeks = new Map<string, { h: number; last: ReadinessShift }>();
  for (const s of sorted) {
    const monday = new Date(s.startAt);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const w = weeks.get(monday.toISOString()) ?? { h: 0, last: s };
    w.h += hours(s.startAt, s.endAt);
    w.last = s;
    weeks.set(monday.toISOString(), w);
  }
  for (const w of weeks.values()) {
    if (w.h > maxWeeklyHours) issues.push({ shiftId: w.last.id, reason: `${w.h.toFixed(0)} hours this week, over the ${maxWeeklyHours}-hour limit` });
  }
  return issues;
}

// ── All four layers ───────────────────────────────────────────────────────

const LOOKAHEAD_DAYS = 14;

export async function computeLayers(agencyId: string, now = new Date()): Promise<Layer[]> {
  const until = new Date(now.getTime() + LOOKAHEAD_DAYS * 86_400_000);
  const [shifts, carers, roles, pairs, recent] = await Promise.all([
    prisma.shift.findMany({
      where: { agencyId, status: "BOOKED", endAt: { gte: now }, startAt: { lte: until }, carerId: { not: null } },
      include: { package: true, jobRole: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.carer.findMany({ where: { agencyId, status: { not: "INACTIVE" } }, include: { checks: true } }),
    prisma.jobRole.findMany({ where: { agencyId } }),
    rapportPairs(agencyId, now),
    prisma.shift.findMany({
      where: { agencyId, startAt: { gte: new Date(now.getTime() - 14 * 86_400_000), lte: now }, status: "COMPLETED", package: { kind: "CARE_RECEIVER" } },
      select: { packageId: true, carerId: true, package: { select: { name: true } } },
    }),
  ]);
  const carerById = new Map(carers.map((c) => [c.id, c]));
  const shiftsByCarer = new Map<string, typeof shifts>();
  for (const s of shifts) shiftsByCarer.set(s.carerId!, [...(shiftsByCarer.get(s.carerId!) ?? []), s]);

  const competence: Flag[] = [];
  const compliance: Flag[] = [];
  const readiness: Flag[] = [];
  const rapport: Flag[] = [];

  // Compliance: statutory checks on anyone booked (block) or due soon (warn).
  for (const c of carers) {
    const booked = shiftsByCarer.get(c.id) ?? [];
    for (const s of STATUTORY) {
      const check = c.checks.filter((k) => k.kind === s.kind).sort((a, b) => (b.expiresAt?.getTime() ?? Infinity) - (a.expiresAt?.getTime() ?? Infinity))[0];
      const state = expiryState(check, now);
      if ((state === "EXPIRED" || state === "MISSING") && booked.length) {
        const first = booked[0]!;
        compliance.push({
          id: `comp-${c.id}-${s.kind}`,
          severity: "block",
          subject: fullName(c),
          href: `/shifts/manage?carer=${c.id}`,
          reason: `${s.label} ${state === "EXPIRED" ? "expired" : "missing"} — booked ${fmtRange(first.startAt, first.endAt)} at ${first.package.name}${booked.length > 1 ? ` and ${booked.length - 1} more` : ""}`,
          action: "Rebook those shifts or record the check",
        });
      } else if (state === "DUE_SOON" || ((state === "EXPIRED" || state === "MISSING") && c.status === "ACTIVE")) {
        compliance.push({
          id: `comp-${c.id}-${s.kind}`,
          severity: "warn",
          subject: fullName(c),
          href: "/workforce/onboarding",
          reason: `${s.label} ${state === "DUE_SOON" ? `expires ${check!.expiresAt!.toLocaleDateString("en-GB")}` : state.toLowerCase()}`,
          action: "Record the renewed check",
        });
      }
    }
  }

  // Competence: booked role needs training the carer doesn't have in date.
  // One flag per carer, role and gap, naming the next shift and how many more.
  const roleById = new Map(roles.map((r) => [r.id, r]));
  const competenceGroups = new Map<string, { carer: (typeof carers)[number]; role: string; gaps: string[]; shifts: typeof shifts }>();
  for (const s of shifts) {
    const role = s.jobRoleId ? roleById.get(s.jobRoleId) : null;
    const carer = carerById.get(s.carerId!);
    if (!role || !carer) continue;
    const gaps = role.requiredTraining.filter((t) => {
      const state = expiryState(carer.checks.find((k) => k.kind === "TRAINING" && k.name === t), now);
      return state === "MISSING" || state === "EXPIRED";
    });
    if (!gaps.length) continue;
    const key = `${carer.id}:${role.id}:${gaps.join(",")}`;
    const g = competenceGroups.get(key) ?? { carer, role: role.name, gaps, shifts: [] };
    g.shifts.push(s);
    competenceGroups.set(key, g);
  }
  for (const [key, g] of competenceGroups) {
    const first = g.shifts[0]!;
    competence.push({
      id: `cmp-${key}`,
      severity: "warn",
      subject: fullName(g.carer),
      href: `/shifts/manage?carer=${g.carer.id}`,
      reason: `Booked as ${g.role.toLowerCase()} without ${g.gaps.join(", ")} — next ${fmtRange(first.startAt, first.endAt)} at ${first.package.name}${g.shifts.length > 1 ? `, ${g.shifts.length - 1} more` : ""}`,
      action: "Rebook, or record the training",
    });
  }

  // Shift Readiness.
  for (const [carerId, list] of shiftsByCarer) {
    const carer = carerById.get(carerId);
    if (!carer) continue;
    const issues = readinessIssues(
      list.map((s) => ({ id: s.id, startAt: s.startAt, endAt: s.endAt, lat: s.package.lat, lng: s.package.lng, label: `${fmtRange(s.startAt, s.endAt)} at ${s.package.name}` })),
      carer.maxWeeklyHours,
    );
    for (const i of issues) {
      readiness.push({ id: `rdy-${i.shiftId}-${i.reason.slice(0, 12)}`, severity: "warn", subject: fullName(carer), href: `/shifts/manage?carer=${carerId}`, reason: i.reason, action: "Rebalance the rota" });
    }
  }

  // Rapport: weak pairings on the team, and Packages with poor continuity.
  for (const p of pairs) {
    if (p.onTeam && p.rapport.score < RAPPORT_LOW) {
      rapport.push({
        id: `rap-${p.carerId}-${p.packageId}`,
        severity: "warn",
        subject: `${p.carerName} · ${p.packageName}`,
        href: `/workforce/teams/${p.packageId}`,
        reason: `Rapport ${p.rapport.score}: ${p.rapport.reasons.filter((r) => r.startsWith("−")).slice(0, 2).join("; ") || p.rapport.reasons[0]}`,
        action: "Talk to the carer, or adjust the team",
      });
    }
  }
  const carersPerPackage = new Map<string, { name: string; carers: Set<string> }>();
  for (const r of recent) {
    if (!r.carerId) continue;
    const e = carersPerPackage.get(r.packageId) ?? { name: r.package.name, carers: new Set<string>() };
    e.carers.add(r.carerId);
    carersPerPackage.set(r.packageId, e);
  }
  for (const [packageId, e] of carersPerPackage) {
    if (e.carers.size >= 5) {
      rapport.push({
        id: `cont-${packageId}`,
        severity: "warn",
        subject: e.name,
        href: `/workforce/teams/${packageId}`,
        reason: `${e.carers.size} different carers in the last two weeks`,
        action: "Give the Package a steady team",
      });
    }
  }

  const byLayer: Record<LayerId, Flag[]> = { competence, compliance, readiness, rapport };
  return LAYERS.map((l) => ({ ...l, flags: byLayer[l.id].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "block" ? -1 : 1)) }));
}

/** Booking is blocked when a statutory check is missing or expired (the Compliance gate). */
export async function complianceGate(agencyId: string, carerId: string, now = new Date()): Promise<string | null> {
  const carer = await prisma.carer.findFirst({ where: { id: carerId, agencyId }, include: { checks: true } });
  if (!carer) return "Carer not found";
  if (carer.status === "INACTIVE") return `${fullName(carer)} is inactive`;
  for (const s of STATUTORY) {
    const state = expiryState(
      carer.checks.filter((k) => k.kind === s.kind).sort((a, b) => (b.expiresAt?.getTime() ?? Infinity) - (a.expiresAt?.getTime() ?? Infinity))[0],
      now,
    );
    if (state === "EXPIRED" || state === "MISSING") return `${fullName(carer)}'s ${s.label} is ${state.toLowerCase()}`;
  }
  return null;
}
