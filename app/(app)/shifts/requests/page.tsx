import { Badge, buttonClass, Empty, ghostButtonClass, Label, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ago, fmtDay, fmtRange, fullName } from "@/lib/format";

import { decideAction } from "../actions";

export const metadata = { title: "Requests" };

const KIND = { SHIFT: "Wants a shift", SWAP: "Swap off", TIME_OFF: "Time off" } as const;

export default async function RequestsPage() {
  const user = await requireOffice();
  const [pending, recent] = await Promise.all([
    prisma.shiftRequest.findMany({ where: { agencyId: user.agencyId, status: "PENDING" }, include: { carer: true, shift: { include: { package: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.shiftRequest.findMany({ where: { agencyId: user.agencyId, status: { not: "PENDING" } }, include: { carer: true, shift: { include: { package: true } } }, orderBy: { decidedAt: "desc" }, take: 10 }),
  ]);

  const what = (r: (typeof pending)[number]) =>
    r.shift ? `${fmtRange(r.shift.startAt, r.shift.endAt)} at ${r.shift.package.name}` : r.startAt && r.endAt ? `${fmtDay(r.startAt)} to ${fmtDay(r.endAt)}` : "—";

  return (
    <Page>
      <PageHeader eyebrow="SHIFTS // REQUEST" title="Requests from carers" intro="Shifts they want, swaps and time off — sent from the Aultrum carer app or recorded here." />
      {pending.length === 0 ? <Empty>No requests waiting.</Empty> : null}
      <div className="space-y-2">
        {pending.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border border-line bg-card p-4">
            <div>
              <div className="flex items-center gap-2">
                <span>{fullName(r.carer)}</span>
                <Badge tone={r.kind === "TIME_OFF" ? "info" : r.kind === "SWAP" ? "warn" : "ok"}>{KIND[r.kind].toUpperCase()}</Badge>
                <span className="text-xs text-muted">{ago(r.createdAt)}</span>
              </div>
              <p className="text-sm text-muted">{what(r)}</p>
              {r.note ? <p className="text-sm text-muted">&ldquo;{r.note}&rdquo;</p> : null}
            </div>
            <div className="flex gap-2">
              <form action={decideAction}>
                <input type="hidden" name="requestId" value={r.id} />
                <input type="hidden" name="approve" value="yes" />
                <button className={buttonClass}>Approve</button>
              </form>
              <form action={decideAction}>
                <input type="hidden" name="requestId" value={r.id} />
                <input type="hidden" name="approve" value="no" />
                <button className={ghostButtonClass}>Decline</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Label>RECENTLY DECIDED</Label>
        <Table head={["Carer", "Request", "For", "Decision"]} empty="Nothing decided yet.">
          {recent.map((r) => (
            <tr key={r.id}>
              <Td>{fullName(r.carer)}</Td>
              <Td>{KIND[r.kind]}</Td>
              <Td>{what(r)}</Td>
              <Td>
                <Badge tone={r.status === "APPROVED" ? "ok" : "muted"}>{r.status}</Badge>
              </Td>
            </tr>
          ))}
        </Table>
      </div>
    </Page>
  );
}
