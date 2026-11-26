import Link from "next/link";

import { LayerCards } from "@/components/LayerCards";
import { Badge, Card, Label, linkClass, Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtRange, fmtTime, fullName } from "@/lib/format";
import { computeLayers } from "@/lib/qualifiers";

export const metadata = { title: "Watchboard" };
export const dynamic = "force-dynamic";

export default async function WatchboardPage() {
  const user = await requireOffice();
  const a = user.agencyId;
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const soon = new Date(now.getTime() + 48 * 3_600_000);
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  const [today, openSoon, openWeek, requests, praise, layers] = await Promise.all([
    prisma.shift.findMany({ where: { agencyId: a, startAt: { gte: dayStart, lt: dayEnd }, status: { in: ["BOOKED", "COMPLETED"] } }, include: { package: true, carer: true }, orderBy: { startAt: "asc" } }),
    prisma.shift.findMany({ where: { agencyId: a, status: "OPEN", startAt: { gte: now, lte: soon } }, include: { package: true }, orderBy: { startAt: "asc" } }),
    prisma.shift.count({ where: { agencyId: a, status: "OPEN", startAt: { gte: now, lte: new Date(now.getTime() + 7 * 86_400_000) } } }),
    prisma.shiftRequest.count({ where: { agencyId: a, status: "PENDING" } }),
    prisma.praise.count({ where: { agencyId: a, createdAt: { gte: weekAgo } } }),
    computeLayers(a, now),
  ]);

  const missed = today.filter((s) => !s.checkInAt && s.status === "BOOKED" && s.startAt.getTime() + 15 * 60_000 < now.getTime());
  const late = today.filter((s) => s.checkInAt && s.checkInAt.getTime() - s.startAt.getTime() > 10 * 60_000);
  const checkedIn = today.filter((s) => s.checkInAt).length;

  const tiles = [
    { label: "VISITS TODAY", value: today.length, href: "/shifts/manage" },
    { label: "CHECKED IN", value: checkedIn, href: "/shifts/manage" },
    { label: "LATE OR MISSED", value: late.length + missed.length, tone: late.length + missed.length ? "text-[#ff6b6b]" : "", href: "#visits" },
    { label: "OPEN · 7 DAYS", value: openWeek, tone: openWeek ? "text-[#ffb800]" : "", href: "/shifts/open" },
    { label: "REQUESTS", value: requests, tone: requests ? "text-[#4a9eff]" : "", href: "/shifts/requests" },
    { label: "PRAISE · 7 DAYS", value: praise, tone: "text-[#00e676]", href: "/workforce/teams" },
  ];

  return (
    <Page>
      <PageHeader eyebrow="WATCHBOARD" title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, ${user.name.split(" ")[0]}`} intro="What needs you today, and what the Aultrum Layers have flagged." />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="border border-[#2a2a2a] bg-[#111111] p-4 hover:border-[#4a9eff]">
            <div className="font-mono text-[9px] tracking-widest text-[#a0a0a0]">{t.label}</div>
            <div className={`mt-1 text-3xl font-light ${t.tone ?? ""}`}>{t.value}</div>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <Label>QUALIFIERS — AULTRUM LAYERS</Label>
          <Link href="/persona/qualifiers" className={`${linkClass} font-mono text-[10px]`}>
            ALL DETAIL →
          </Link>
        </div>
        <LayerCards layers={layers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2" id="visits">
        <Card>
          <Label>LATE AND MISSED VISITS TODAY</Label>
          {missed.length + late.length === 0 ? <p className="text-sm text-[#00e676]">Every visit so far started on time.</p> : null}
          <ul className="space-y-2 text-sm">
            {missed.map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <span>
                  {s.package.name} · {fmtTime(s.startAt)} · {s.carer ? fullName(s.carer) : "—"}
                </span>
                <Badge tone="bad">NOT CHECKED IN</Badge>
              </li>
            ))}
            {late.map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <span>
                  {s.package.name} · {fmtTime(s.startAt)} · {s.carer ? fullName(s.carer) : "—"}
                </span>
                <Badge tone="warn">{Math.round((s.checkInAt!.getTime() - s.startAt.getTime()) / 60_000)} MIN LATE</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Label>OPEN IN THE NEXT 48 HOURS</Label>
          {openSoon.length === 0 ? <p className="text-sm text-[#00e676]">Nothing open.</p> : null}
          <ul className="space-y-2 text-sm">
            {openSoon.map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <span>
                  {s.package.name} · {fmtRange(s.startAt, s.endAt)}
                </span>
                <Link href="/shifts/open" className={`${linkClass} font-mono text-[10px]`}>
                  FILL →
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Page>
  );
}
