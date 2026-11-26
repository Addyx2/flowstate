import Link from "next/link";

import { ActionForm } from "@/components/ActionForm";
import { Badge, Details, Field, inputClass, linkClass, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtDay, fmtTime, fullName, startOfWeek } from "@/lib/format";

import { cancelAction, createShiftAction, unassignAction } from "../actions";

export const metadata = { title: "Manage shifts" };

const STATUS_TONE = { OPEN: "warn", BOOKED: "info", COMPLETED: "ok", CANCELLED: "muted" } as const;

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ week?: string; package?: string; carer?: string }> }) {
  const user = await requireOffice();
  const sp = await searchParams;
  const offset = Number.isFinite(Number(sp.week)) ? Number(sp.week) : 0;
  const from = startOfWeek(new Date());
  from.setDate(from.getDate() + offset * 7);
  const to = new Date(from.getTime() + 7 * 86_400_000);

  const [shifts, packages, carers, roles] = await Promise.all([
    prisma.shift.findMany({
      where: { agencyId: user.agencyId, startAt: { gte: from, lt: to }, packageId: sp.package || undefined, carerId: sp.carer || undefined },
      include: { package: true, carer: true, jobRole: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.package.findMany({ where: { agencyId: user.agencyId, active: true }, orderBy: { name: "asc" } }),
    prisma.carer.findMany({ where: { agencyId: user.agencyId, status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.jobRole.findMany({ where: { agencyId: user.agencyId } }),
  ]);
  const q = (week: number) => `?${new URLSearchParams({ week: String(week), ...(sp.package ? { package: sp.package } : {}), ...(sp.carer ? { carer: sp.carer } : {}) })}`;
  const filterName = sp.package ? packages.find((p) => p.id === sp.package)?.name : sp.carer ? fullName(carers.find((c) => c.id === sp.carer) ?? { firstName: "", lastName: "" }) : null;

  return (
    <Page>
      <PageHeader
        eyebrow="SHIFTS // MANAGE"
        title="Manage shifts"
        intro={`Week of ${fmtDay(from)}${filterName ? ` · ${filterName}` : ""}`}
        actions={
          <div className="flex gap-4 font-mono text-[11px]">
            <Link className={linkClass} href={q(offset - 1)}>
              ← PREVIOUS
            </Link>
            <Link className={linkClass} href={q(0)}>
              THIS WEEK
            </Link>
            <Link className={linkClass} href={q(offset + 1)}>
              NEXT →
            </Link>
            {filterName ? (
              <Link className={linkClass} href={`?week=${offset}`}>
                CLEAR FILTER
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mb-4">
        <Details summary="Add a shift">
          <ActionForm action={createShiftAction} submit="Add shift">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Package">
                <select name="packageId" defaultValue={sp.package} className={inputClass}>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input name="date" type="date" required className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start">
                  <input name="start" type="time" required className={inputClass} />
                </Field>
                <Field label="End">
                  <input name="end" type="time" required className={inputClass} />
                </Field>
              </div>
              <Field label="Role">
                <select name="jobRoleId" className={inputClass}>
                  <option value="">—</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Carer (optional)">
                <select name="carerId" className={inputClass}>
                  <option value="">Leave open</option>
                  {carers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {fullName(c)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </ActionForm>
        </Details>
      </div>

      <Table head={["When", "Package", "Carer", "Status", "Visit", ""]} empty="No shifts this week.">
        {shifts.map((s) => {
          const lateMins = s.checkInAt ? Math.round((s.checkInAt.getTime() - s.startAt.getTime()) / 60_000) : null;
          const missed = !s.checkInAt && s.status === "BOOKED" && s.startAt.getTime() + 15 * 60_000 < Date.now();
          return (
            <tr key={s.id}>
              <Td>
                {fmtDay(s.startAt)}
                <span className="block text-xs text-[#8a8a8a]">
                  {fmtTime(s.startAt)}–{fmtTime(s.endAt)}
                </span>
              </Td>
              <Td>
                <Link href={`?week=${offset}&package=${s.packageId}`} className={linkClass}>
                  {s.package.name}
                </Link>
                {s.jobRole ? <span className="block text-xs text-[#8a8a8a]">{s.jobRole.name}</span> : null}
              </Td>
              <Td>
                {s.carer ? (
                  <Link href={`?week=${offset}&carer=${s.carerId}`} className={linkClass}>
                    {fullName(s.carer)}
                  </Link>
                ) : (
                  "—"
                )}
              </Td>
              <Td>
                <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                {s.cancelledBy ? <span className="block text-xs text-[#8a8a8a]">by {s.cancelledBy.toLowerCase()}</span> : null}
              </Td>
              <Td>
                {missed ? <Badge tone="bad">NOT CHECKED IN</Badge> : lateMins === null ? <span className="text-[#5a5a5a]">—</span> : lateMins > 10 ? <Badge tone="warn">{lateMins} MIN LATE</Badge> : <Badge tone="ok">ON TIME</Badge>}
              </Td>
              <Td className="text-right">
                {s.status === "BOOKED" || s.status === "OPEN" ? (
                  <div className="flex justify-end gap-3 font-mono text-[10px] tracking-wider">
                    {s.status === "BOOKED" ? (
                      <form action={unassignAction}>
                        <input type="hidden" name="shiftId" value={s.id} />
                        <button className="text-[#8a8a8a] hover:text-[#e2e2e2]">UNASSIGN</button>
                      </form>
                    ) : (
                      <Link href="/shifts/open" className="text-[#4a9eff]">
                        FILL
                      </Link>
                    )}
                    <form action={cancelAction}>
                      <input type="hidden" name="shiftId" value={s.id} />
                      <input type="hidden" name="by" value="AGENCY" />
                      <button className="text-[#8a8a8a] hover:text-[#ff9b9b]">CANCEL</button>
                    </form>
                  </div>
                ) : null}
              </Td>
            </tr>
          );
        })}
      </Table>
    </Page>
  );
}
