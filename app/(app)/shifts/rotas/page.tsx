import { ActionForm } from "@/components/ActionForm";
import { Card, Details, Empty, Field, inputClass, Label, Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fullName } from "@/lib/format";

import { addRotaLineAction, createRotaAction, generateAction, removeRotaLineAction } from "../actions";

export const metadata = { title: "Rotas" };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function RotasPage() {
  const user = await requireOffice();
  const [rotas, packages, carers, roles] = await Promise.all([
    prisma.rota.findMany({
      where: { agencyId: user.agencyId, active: true },
      include: { package: true, lines: { include: { carer: true, jobRole: true }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }] } },
      orderBy: { package: { name: "asc" } },
    }),
    prisma.package.findMany({ where: { agencyId: user.agencyId, active: true }, orderBy: { name: "asc" } }),
    prisma.carer.findMany({ where: { agencyId: user.agencyId, status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.jobRole.findMany({ where: { agencyId: user.agencyId } }),
  ]);

  return (
    <Page>
      <PageHeader
        eyebrow="SHIFTS // ROTAS"
        title="Rotas"
        intro="Each Package's repeating week. Generate a week and Flowstate books the usual carer where they're clear to work, and leaves the rest open."
        actions={
          <ActionForm action={generateAction} submit="Generate next week for all">
            <input type="hidden" name="rotaId" value="all" />
            <input type="hidden" name="week" value="1" />
          </ActionForm>
        }
      />
      {rotas.length === 0 ? <Empty>No rotas yet.</Empty> : null}
      <div className="space-y-4">
        {rotas.map((r) => (
          <Card key={r.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] text-muted">{r.package.name}</p>
                <p className="-mt-1 font-serif text-[21px]">{r.name}</p>
              </div>
              <div className="flex gap-2">
                <ActionForm action={generateAction} submit="This week">
                  <input type="hidden" name="rotaId" value={r.id} />
                  <input type="hidden" name="week" value="0" />
                </ActionForm>
                <ActionForm action={generateAction} submit="Next week">
                  <input type="hidden" name="rotaId" value={r.id} />
                  <input type="hidden" name="week" value="1" />
                </ActionForm>
              </div>
            </div>
            <div className="grid gap-1 sm:grid-cols-7">
              {DAYS.map((d, i) => (
                <div key={d} className="border border-divider p-2">
                  <p className="text-[12px] text-muted">{d}</p>
                  {r.lines
                    .filter((l) => l.weekday === i)
                    .map((l) => (
                      <div key={l.id} className="mt-1 text-xs">
                        <span className="text-ink">
                          {l.startTime}–{l.endTime}
                        </span>
                        <span className="block text-muted">{l.carer ? fullName(l.carer) : "open"}</span>
                        <form action={removeRotaLineAction}>
                          <input type="hidden" name="lineId" value={l.id} />
                          <button className="text-[11px] text-faint hover:text-bad">Remove</button>
                        </form>
                      </div>
                    ))}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Details summary="Add to this rota">
                <ActionForm action={addRotaLineAction} submit="Add">
                  <input type="hidden" name="rotaId" value={r.id} />
                  <div className="grid gap-3 sm:grid-cols-5">
                    <Field label="Day">
                      <select name="weekday" className={inputClass}>
                        {DAYS.map((d, i) => (
                          <option key={d} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Start">
                      <input name="startTime" type="time" required className={inputClass} />
                    </Field>
                    <Field label="End">
                      <input name="endTime" type="time" required className={inputClass} />
                    </Field>
                    <Field label="Role">
                      <select name="jobRoleId" className={inputClass}>
                        <option value="">—</option>
                        {roles.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Usual carer">
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
          </Card>
        ))}
        <Details summary="New rota">
          <ActionForm action={createRotaAction} submit="Create rota">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Package">
                <select name="packageId" className={inputClass}>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Name">
                <input name="name" required className={inputClass} placeholder="e.g. Morning and evening visits" />
              </Field>
            </div>
          </ActionForm>
        </Details>
      </div>
    </Page>
  );
}
