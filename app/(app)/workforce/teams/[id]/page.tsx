import Link from "next/link";
import { notFound } from "next/navigation";

import { createPraiseLink } from "@/app/(app)/account/links/actions";
import { ActionForm } from "@/components/ActionForm";
import { LinkMaker } from "@/components/LinkMaker";
import { Badge, Card, Details, Field, inputClass, Label, linkClass, Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ago, fmtRange, fullName } from "@/lib/format";
import { RAPPORT_LOW, rapportPairs } from "@/lib/qualifiers";

import { addKeyPerson, addTeamMember, recordFeedback, removeTeamMember, setPrimary } from "../../actions";

export const metadata = { title: "Package" };

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireOffice();
  const { id } = await params;
  const pkg = await prisma.package.findFirst({
    where: { id, agencyId: user.agencyId },
    include: {
      team: { include: { carer: true }, orderBy: [{ primary: "desc" }, { joinedAt: "asc" }] },
      keyPersons: { orderBy: { createdAt: "asc" } },
      shifts: { where: { endAt: { gte: new Date() }, status: { in: ["OPEN", "BOOKED"] } }, include: { carer: true }, orderBy: { startAt: "asc" }, take: 8 },
      praise: { include: { carer: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!pkg) notFound();
  const [carers, pairs] = await Promise.all([
    prisma.carer.findMany({ where: { agencyId: user.agencyId, status: "ACTIVE", teams: { none: { packageId: pkg.id } } }, orderBy: { firstName: "asc" } }),
    rapportPairs(user.agencyId, new Date(), { packageId: pkg.id }),
  ]);
  const pairFor = new Map(pairs.map((p) => [p.carerId, p]));
  const outsideTeam = pairs.filter((p) => !p.onTeam && p.stats.visits > 0).sort((a, b) => b.rapport.score - a.rapport.score);

  return (
    <Page>
      <PageHeader
        eyebrow={`WORKFORCE // TEAMS // ${pkg.kind === "CARE_HOME" ? "CARE HOME" : "CARE RECEIVER"}`}
        title={pkg.name}
        intro={[pkg.address, pkg.fundingBody].filter(Boolean).join(" · ") || undefined}
        actions={
          <Link href={`/shifts/manage?package=${pkg.id}`} className={linkClass}>
            Shifts for this Package →
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <Label>TEAM AND RAPPORT</Label>
            {pkg.team.length === 0 ? <p className="text-sm text-[#8a8a8a]">No one on the team yet.</p> : null}
            <ul className="divide-y divide-[#1d1d1f]">
              {pkg.team.map((m) => {
                const pair = pairFor.get(m.carerId);
                return (
                  <li key={m.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{fullName(m.carer)}</span>
                        {m.primary ? <Badge tone="info">PRIMARY</Badge> : null}
                        {pair ? <Badge tone={pair.rapport.score < RAPPORT_LOW ? "warn" : pair.rapport.score >= 70 ? "ok" : "muted"}>RAPPORT {pair.rapport.score}</Badge> : null}
                      </div>
                      <div className="flex gap-3 font-mono text-[10px] tracking-wider">
                        {!m.primary ? (
                          <form action={setPrimary}>
                            <input type="hidden" name="memberId" value={m.id} />
                            <button className="text-[#8a8a8a] hover:text-[#e2e2e2]">MAKE PRIMARY</button>
                          </form>
                        ) : null}
                        <form action={removeTeamMember}>
                          <input type="hidden" name="memberId" value={m.id} />
                          <button className="text-[#8a8a8a] hover:text-[#ff9b9b]">REMOVE</button>
                        </form>
                      </div>
                    </div>
                    {pair?.rapport.reasons.length ? <p className="mt-1 text-xs text-[#8a8a8a]">{pair.rapport.reasons.slice(0, 4).join(" · ")}</p> : null}
                  </li>
                );
              })}
            </ul>
            {carers.length ? (
              <form action={addTeamMember} className="mt-3 flex gap-2">
                <input type="hidden" name="packageId" value={pkg.id} />
                <select name="carerId" className={inputClass}>
                  {carers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {fullName(c)}
                    </option>
                  ))}
                </select>
                <button className="shrink-0 border border-[#2a2a2a] px-3 text-sm hover:border-[#4a9eff]">Add to team</button>
              </form>
            ) : null}
            {outsideTeam.length ? (
              <p className="mt-3 text-xs text-[#8a8a8a]">
                Also visited recently: {outsideTeam.slice(0, 4).map((p) => `${p.carerName} (rapport ${p.rapport.score})`).join(", ")}
              </p>
            ) : null}
            <p className="mt-3 font-mono text-[9px] tracking-wider text-[#5a5a5a]">RAPPORT V0 — A PROMPT FOR YOU, NEVER A VERDICT</p>
          </Card>

          <Card>
            <Label>UPCOMING SHIFTS</Label>
            {pkg.shifts.length === 0 ? <p className="text-sm text-[#8a8a8a]">None in the rota yet.</p> : null}
            <ul className="space-y-1 text-sm">
              {pkg.shifts.map((s) => (
                <li key={s.id} className="flex justify-between gap-2">
                  <span>{fmtRange(s.startAt, s.endAt)}</span>
                  {s.carer ? <span className="text-[#a0a0a0]">{fullName(s.carer)}</span> : <Badge tone="warn">OPEN</Badge>}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <Label>RECENT PRAISE</Label>
            {pkg.praise.length === 0 ? <p className="text-sm text-[#8a8a8a]">No praise yet. Send a key person a praise link.</p> : null}
            <ul className="space-y-3">
              {pkg.praise.map((p) => (
                <li key={p.id} className="text-sm">
                  <span className="text-[#e2e2e2]">For {fullName(p.carer)}</span>
                  <span className="text-[#8a8a8a]"> · from {p.fromName} · {ago(p.createdAt)}</span>
                  <p className="text-[#a0a0a0]">&ldquo;{p.message}&rdquo;</p>
                </li>
              ))}
            </ul>
          </Card>

          {pkg.team.length ? (
            <Details summary="Record feedback on a pairing">
              <ActionForm action={recordFeedback} submit="Record">
                <input type="hidden" name="packageId" value={pkg.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Carer">
                    <select name="carerId" className={inputClass}>
                      {pkg.team.map((m) => (
                        <option key={m.carerId} value={m.carerId}>
                          {fullName(m.carer)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="What happened">
                    <select name="kind" className={inputClass}>
                      <option value="COORDINATOR_FEEDBACK">My feedback on the pairing</option>
                      <option value="COMPLAINT">A complaint about the visit</option>
                      <option value="CHANGE_CARER_ASKED">A change of carer was asked for</option>
                    </select>
                  </Field>
                  <Field label="Feedback is (for my feedback)">
                    <select name="positive" className={inputClass}>
                      <option value="yes">Positive</option>
                      <option value="no">A concern</option>
                    </select>
                  </Field>
                  <Field label="Short note (optional)">
                    <input name="note" maxLength={200} className={inputClass} placeholder="About the work, not the person's health" />
                  </Field>
                </div>
              </ActionForm>
            </Details>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <Label>LOGISTICS</Label>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-[#8a8a8a]">Postcode</dt>
                <dd>{pkg.postcode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#8a8a8a]">Access (sensitive — never in links or notifications)</dt>
                <dd>{pkg.accessInstructions ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#8a8a8a]">Hourly rate</dt>
                <dd>{pkg.hourlyRate ? `£${pkg.hourlyRate.toFixed(2)}` : "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <Label>KEY PERSONS</Label>
            <ul className="space-y-4">
              {pkg.keyPersons.map((k) => (
                <li key={k.id} className="text-sm">
                  <span>{k.name}</span>
                  {k.relationship ? <span className="text-[#8a8a8a]"> · {k.relationship}</span> : null}
                  <LinkMaker action={createPraiseLink} submit="Make praise link" className="mt-2">
                    <input type="hidden" name="keyPersonId" value={k.id} />
                  </LinkMaker>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Details summary="Add a key person">
                <ActionForm action={addKeyPerson} submit="Add">
                  <input type="hidden" name="packageId" value={pkg.id} />
                  <Field label="Name">
                    <input name="name" required className={inputClass} />
                  </Field>
                  <Field label="Relationship">
                    <input name="relationship" className={inputClass} placeholder="e.g. Daughter" />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" className={inputClass} />
                  </Field>
                  <Field label="Mobile">
                    <input name="phone" className={inputClass} />
                  </Field>
                </ActionForm>
              </Details>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
