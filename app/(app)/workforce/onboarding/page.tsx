import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Details, Empty, Field, ghostButtonClass, inputClass, Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { expiryState, STATE_LABEL, STATE_TONE, STATUTORY } from "@/lib/checks";
import { prisma } from "@/lib/db";
import { fmtDate, fullName } from "@/lib/format";

import { addCheck, createCarer, setCarerStatus } from "../actions";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const user = await requireOffice();
  const [carers, roles] = await Promise.all([
    prisma.carer.findMany({ where: { agencyId: user.agencyId, status: { not: "INACTIVE" } }, include: { checks: { orderBy: { createdAt: "asc" } } }, orderBy: [{ status: "asc" }, { firstName: "asc" }] }),
    prisma.jobRole.findMany({ where: { agencyId: user.agencyId } }),
  ]);
  const training = [...new Set(roles.flatMap((r) => r.requiredTraining))];
  const onboarding = carers.filter((c) => c.status === "ONBOARDING");

  return (
    <Page>
      <PageHeader eyebrow="WORKFORCE // ONBOARDING" title="Onboarding" intro="Bring carers in: record their checks and training, then mark them ready to work." />

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <p className="label-title text-[13px] text-muted">IN ONBOARDING ({onboarding.length})</p>
          {onboarding.length === 0 ? <Empty>No one is onboarding. Add a carer to start.</Empty> : null}
          {carers.map((c) => {
            const rows = [
              ...STATUTORY.map((s) => ({ label: s.label, check: c.checks.find((k) => k.kind === s.kind) ?? null })),
              ...training.map((t) => ({ label: t, check: c.checks.find((k) => k.kind === "TRAINING" && k.name === t) ?? null })),
              { label: "References", check: c.checks.find((k) => k.kind === "REFERENCE") ?? null },
            ];
            const blocking = rows.slice(0, STATUTORY.length).some((r) => ["MISSING", "EXPIRED"].includes(expiryState(r.check)));
            if (c.status === "ACTIVE" && !rows.some((r) => expiryState(r.check) !== "OK")) return null;
            return (
              <Card key={c.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-serif text-[21px]">{fullName(c)}</span>
                    <span className="ml-2">
                      <Badge tone={c.status === "ACTIVE" ? "ok" : "info"}>{c.status}</Badge>
                    </span>
                  </div>
                  {c.status === "ONBOARDING" ? (
                    <form action={setCarerStatus}>
                      <input type="hidden" name="carerId" value={c.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button disabled={blocking} title={blocking ? "DBS and right to work must be recorded first" : undefined} className={ghostButtonClass + " disabled:opacity-40"}>
                        Ready to work
                      </button>
                    </form>
                  ) : null}
                </div>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {rows.map((r) => {
                    const state = expiryState(r.check);
                    return (
                      <li key={r.label} className="flex items-center justify-between gap-2 border-b border-divider py-1.5 text-sm">
                        <span>{r.label}</span>
                        <span className="flex items-center gap-2 text-xs text-muted">
                          {r.check?.expiresAt ? fmtDate(r.check.expiresAt) : null}
                          <Badge tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Badge>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3">
                  <Details summary="Record a check">
                    <ActionForm action={addCheck} submit="Record">
                      <input type="hidden" name="carerId" value={c.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Kind">
                          <select name="kind" className={inputClass}>
                            <option value="DBS">DBS</option>
                            <option value="RIGHT_TO_WORK">Right to work</option>
                            <option value="TRAINING">Training</option>
                            <option value="REFERENCE">Reference</option>
                          </select>
                        </Field>
                        <Field label="Name">
                          <input name="name" list="check-names" required className={inputClass} placeholder="e.g. Enhanced DBS" />
                        </Field>
                        <Field label="Reference (optional)">
                          <input name="reference" className={inputClass} />
                        </Field>
                        <Field label="Expires (optional)">
                          <input name="expiresAt" type="date" className={inputClass} />
                        </Field>
                      </div>
                    </ActionForm>
                  </Details>
                </div>
              </Card>
            );
          })}
          <datalist id="check-names">
            {["Enhanced DBS", "Right to work", ...training, "Reference"].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        <Card className="h-fit">
          <p className="label-title text-[13px] text-accent mb-3">ADD A CARER</p>
          <ActionForm action={createCarer} submit="Add to onboarding">
            <Field label="First name">
              <input name="firstName" required className={inputClass} />
            </Field>
            <Field label="Last name">
              <input name="lastName" required className={inputClass} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" className={inputClass} />
            </Field>
            <Field label="Mobile">
              <input name="phone" className={inputClass} />
            </Field>
            <Field label="Role">
              <select name="jobTitle" className={inputClass}>
                {roles.map((r) => (
                  <option key={r.id}>{r.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Home postcode (for travel distance)">
              <input name="postcode" className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </Page>
  );
}
