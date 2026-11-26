import Link from "next/link";

import { HBars, Hairlines, Legend, PairedBars, Stat } from "@/components/charts";
import { LayerCards } from "@/components/LayerCards";
import { Badge, buttonClass, Card, ghostButtonClass, Page } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtRange, fmtTime, fullName, hoursBetween, startOfWeek } from "@/lib/format";
import { computeLayers } from "@/lib/qualifiers";

export const metadata = { title: "Watchboard" };
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export default async function WatchboardPage() {
  const user = await requireOffice();
  const a = user.agencyId;
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const monday = startOfWeek(now);
  const from28 = new Date(today.getTime() - 27 * DAY);
  const from56 = new Date(today.getTime() - 55 * DAY);

  const [todayShifts, week, recent, signals, openSoon, requests, layers] = await Promise.all([
    prisma.shift.findMany({ where: { agencyId: a, startAt: { gte: today, lt: new Date(today.getTime() + DAY) }, status: { in: ["BOOKED", "COMPLETED"] } }, include: { package: true, carer: true }, orderBy: { startAt: "asc" } }),
    prisma.shift.findMany({ where: { agencyId: a, startAt: { gte: monday, lt: new Date(monday.getTime() + 7 * DAY) }, status: { not: "CANCELLED" } }, include: { package: true } }),
    prisma.shift.findMany({ where: { agencyId: a, status: "COMPLETED", startAt: { gte: from28, lt: new Date(today.getTime() + DAY) } }, select: { startAt: true } }),
    prisma.signal.findMany({ where: { agencyId: a, kind: { in: ["ON_TIME", "LATE"] }, at: { gte: from56 } }, select: { kind: true, at: true } }),
    prisma.shift.findMany({ where: { agencyId: a, status: "OPEN", startAt: { gte: now, lte: new Date(now.getTime() + 48 * 3_600_000) } }, include: { package: true }, orderBy: { startAt: "asc" } }),
    prisma.shiftRequest.count({ where: { agencyId: a, status: "PENDING" } }),
    computeLayers(a, now),
  ]);

  // On-time rate: last 28 days vs the 28 before.
  const inWindow = (d: Date, start: Date, end: Date) => d >= start && d < end;
  const thisOnTime = signals.filter((s) => s.kind === "ON_TIME" && inWindow(s.at, from28, now)).length;
  const thisTimed = signals.filter((s) => inWindow(s.at, from28, now)).length;
  const prevOnTime = signals.filter((s) => s.kind === "ON_TIME" && inWindow(s.at, from56, from28)).length;
  const prevTimed = signals.filter((s) => inWindow(s.at, from56, from28)).length;
  const rate = pct(thisOnTime, thisTimed);
  const rateDelta = prevTimed ? rate - pct(prevOnTime, prevTimed) : null;

  // Visits completed per day, last 28 days.
  const perDay = Array.from({ length: 28 }, (_, i) => {
    const start = from28.getTime() + i * DAY;
    return recent.filter((s) => s.startAt.getTime() >= start && s.startAt.getTime() < start + DAY).length;
  });
  const dayLabels = [0, 7, 14, 21, 27].map((i) => ({ index: i, text: new Date(from28.getTime() + i * DAY).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }));

  // This week: booked vs open, per day.
  const weekGroups = DAYS.map((label, i) => {
    const start = monday.getTime() + i * DAY;
    const day = week.filter((s) => s.startAt.getTime() >= start && s.startAt.getTime() < start + DAY);
    return { label, a: day.filter((s) => s.status !== "OPEN").length, b: day.filter((s) => s.status === "OPEN").length };
  });
  const openThisWeek = weekGroups.reduce((n, g) => n + g.b, 0);
  const coveredThisWeek = weekGroups.reduce((n, g) => n + g.a, 0);

  // Hours by Package this week.
  const hours = new Map<string, number>();
  for (const s of week.filter((s) => s.status !== "OPEN")) hours.set(s.package.name, (hours.get(s.package.name) ?? 0) + hoursBetween(s.startAt, s.endAt));
  const hourRows = [...hours.entries()].map(([label, value]) => ({ label, value: Math.round(value * 10) / 10 })).sort((x, y) => y.value - x.value);

  const missed = todayShifts.filter((s) => !s.checkInAt && s.status === "BOOKED" && s.startAt.getTime() + 15 * 60_000 < now.getTime());
  const late = todayShifts.filter((s) => s.checkInAt && s.checkInAt.getTime() - s.startAt.getTime() > 10 * 60_000);
  const flags = layers.reduce((n, l) => n + l.flags.length, 0);
  const blocking = layers.reduce((n, l) => n + l.flags.filter((f) => f.severity === "block").length, 0);

  return (
    <Page>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-[36px] leading-tight tracking-[-0.01em] md:text-[42px]">{user.agency.name}&rsquo;s Watchboard</h1>
        <div className="flex gap-2">
          <Link href="/persona/qualifiers" className={ghostButtonClass}>
            All qualifiers
          </Link>
          <Link href="/persona/assist" className={buttonClass}>
            Ask Assist
          </Link>
        </div>
      </header>

      <Link href="/persona/qualifiers" className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4 text-[14px] text-ink hover:border-faint">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink font-serif text-[13px] text-white">F</span>
        {flags ? (
          <span>
            The Aultrum Layers have flagged {flags} thing{flags === 1 ? "" : "s"} to look at{blocking ? `, ${blocking} blocking a booking` : ""}.
          </span>
        ) : (
          <span>Nothing flagged across the Aultrum Layers.</span>
        )}
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
        <Card className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3">
            <Stat value={`${rate}%`} label="Visits started on time, last 28 days" delta={rateDelta === null ? null : `${rateDelta >= 0 ? "↑" : "↓"} ${Math.abs(rateDelta)} pts`} deltaGood={(rateDelta ?? 0) >= 0} />
            <span className="rounded-lg border border-line px-2.5 py-1 text-[12px] text-muted">28 days</span>
          </div>
          <Hairlines values={perDay} labels={dayLabels} />
          <Legend items={[{ label: "Visits completed per day", tone: "bar" }]} />
        </Card>

        <Card className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-medium">This week&rsquo;s cover</h2>
              <p className="mt-1 text-[13px] text-muted">
                {coveredThisWeek} shifts covered, {openThisWeek} still open
              </p>
            </div>
            <Link href="/shifts/open" className="rounded-lg border border-line px-2.5 py-1 text-[12px] text-muted hover:border-faint">
              Fill open shifts
            </Link>
          </div>
          <PairedBars groups={weekGroups} aLabel="Covered" bLabel="Open" />
          <Legend
            items={[
              { label: "Covered", tone: "bar" },
              { label: "Open — needs attention", tone: "attention" },
            ]}
          />
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[17px] font-medium">Qualifiers</h2>
          <Link href="/persona/qualifiers" className="text-[13px] text-accent hover:underline">
            See every flag
          </Link>
        </div>
        <LayerCards layers={layers} />
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[17px] font-medium">Today</h2>
            <span className="text-[13px] text-muted">
              {todayShifts.filter((s) => s.checkInAt).length} of {todayShifts.length} checked in
            </span>
          </div>
          {missed.length + late.length === 0 ? <p className="text-[14px] text-ok">Every visit so far started on time.</p> : null}
          <ul className="space-y-3 text-[14px]">
            {missed.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2">
                <span>
                  {s.package.name} · {fmtTime(s.startAt)}
                  <span className="block text-[12px] text-muted">{s.carer ? fullName(s.carer) : "—"}</span>
                </span>
                <Badge tone="bad">Not checked in</Badge>
              </li>
            ))}
            {late.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2">
                <span>
                  {s.package.name} · {fmtTime(s.startAt)}
                  <span className="block text-[12px] text-muted">{s.carer ? fullName(s.carer) : "—"}</span>
                </span>
                <Badge tone="warn">{`${Math.round((s.checkInAt!.getTime() - s.startAt.getTime()) / 60_000)} min late`}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[17px] font-medium">Open in the next 48 hours</h2>
            {requests ? (
              <Link href="/shifts/requests" className="text-[13px] text-accent hover:underline">
                {requests} request{requests === 1 ? "" : "s"}
              </Link>
            ) : null}
          </div>
          {openSoon.length === 0 ? <p className="text-[14px] text-ok">Nothing open.</p> : null}
          <ul className="space-y-3 text-[14px]">
            {openSoon.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2">
                <span>
                  {s.package.name}
                  <span className="block text-[12px] text-muted">{fmtRange(s.startAt, s.endAt)}</span>
                </span>
                <Link href="/shifts/open" className="text-[13px] text-accent hover:underline">
                  Fill
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-[17px] font-medium">Hours by Package</h2>
            <p className="mt-1 text-[13px] text-muted">Covered this week</p>
          </div>
          {hourRows.length ? <HBars rows={hourRows} suffix=" h" /> : <p className="text-[14px] text-muted">No hours yet this week.</p>}
        </Card>
      </div>
    </Page>
  );
}
