import { createShiftRequestLink } from "@/app/(app)/account/links/actions";
import { ActionForm } from "@/components/ActionForm";
import { LinkMaker } from "@/components/LinkMaker";
import { Badge, Card, Details, Empty, inputClass, Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtRange } from "@/lib/format";
import { suggestCarers } from "@/lib/shifts";

import { bookAction } from "../actions";

export const metadata = { title: "Open shifts" };

export default async function OpenPage() {
  const user = await requireOffice();
  const now = new Date();
  const shifts = await prisma.shift.findMany({
    where: { agencyId: user.agencyId, status: "OPEN", startAt: { gte: now, lte: new Date(now.getTime() + 14 * 86_400_000) } },
    include: { package: true, jobRole: true, requests: { where: { status: "PENDING" }, include: { carer: true } } },
    orderBy: { startAt: "asc" },
  });
  const suggestions = await Promise.all(shifts.slice(0, 25).map((s) => suggestCarers(user.agencyId, s.id, now)));

  return (
    <Page>
      <PageHeader eyebrow="SHIFTS // OPEN" title="Open shifts" intro="Nobody is booked on these yet. Suggestions put the Package's own team and strongest rapport first, and say why." />
      {shifts.length === 0 ? <Empty>Every shift in the next two weeks is covered.</Empty> : null}
      <div className="space-y-3">
        {shifts.slice(0, 25).map((s, i) => {
          const list = suggestions[i] ?? [];
          const ready = list.filter((x) => !x.blockers.length);
          return (
            <Card key={s.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-lg font-light">{s.package.name}</span>
                  <span className="ml-3 text-sm text-[#a0a0a0]">{fmtRange(s.startAt, s.endAt)}</span>
                  {s.jobRole ? <span className="ml-3 text-xs text-[#8a8a8a]">{s.jobRole.name}</span> : null}
                </div>
                {s.requests.length ? <Badge tone="info">{s.requests.length} ASKED FOR IT</Badge> : null}
              </div>
              <ul className="space-y-2">
                {ready.slice(0, 3).map((x) => (
                  <li key={x.carerId} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1d1d1f] pt-2">
                    <div className="min-w-0">
                      <span>{x.name}</span>
                      <span className="block text-xs text-[#8a8a8a]">{x.reasons.join(" · ") || "available"}</span>
                    </div>
                    <ActionForm action={bookAction} submit="Book">
                      <input type="hidden" name="shiftId" value={s.id} />
                      <input type="hidden" name="carerId" value={x.carerId} />
                    </ActionForm>
                  </li>
                ))}
                {ready.length === 0 ? <li className="text-sm text-[#ffb800]">No one is clear to work this. Ask an agency below.</li> : null}
              </ul>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {list.filter((x) => x.blockers.length).length ? (
                  <Details summary="Who can't, and why">
                    <ul className="space-y-1 text-xs text-[#8a8a8a]">
                      {list
                        .filter((x) => x.blockers.length)
                        .map((x) => (
                          <li key={x.carerId}>
                            {x.name}: {x.blockers.join(", ")}
                          </li>
                        ))}
                    </ul>
                  </Details>
                ) : null}
                <Details summary="Ask an agency">
                  <LinkMaker action={createShiftRequestLink} submit="Make shift-request link">
                    <input type="hidden" name="shiftId" value={s.id} />
                    <input name="to" placeholder="Agency name (optional)" className={inputClass} />
                  </LinkMaker>
                  <p className="mt-2 text-xs text-[#8a8a8a]">The link shows the time, area and role only — never the name, address or access details.</p>
                </Details>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
