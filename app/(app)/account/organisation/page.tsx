import { ActionForm } from "@/components/ActionForm";
import { LinkMaker } from "@/components/LinkMaker";
import { Badge, Card, Field, inputClass, Label, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ago } from "@/lib/format";
import { ROLE_LABELS, type AppRole } from "@/lib/permissions";

import { addMember, changeRole, passwordLinkFor, renameOrganisation, setActive } from "./actions";

export const metadata = { title: "Organisation" };
export const dynamic = "force-dynamic";

export default async function OrganisationPage() {
  const me = await requireAdmin();
  const people = await prisma.user.findMany({
    where: { agencyId: me.agencyId, role: { not: "CARER" } },
    orderBy: [{ deactivatedAt: { sort: "asc", nulls: "first" } }, { role: "asc" }, { name: "asc" }],
  });
  const admins = people.filter((p) => p.role === "ADMIN" && !p.deactivatedAt).length;

  return (
    <Page>
      <PageHeader eyebrow="ACCOUNT // ORGANISATION" title="Organisation" intro="Your organisation's name and the people who run it in Flowstate. Carers aren't here: they join through the Aultrum carer app." />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Table head={["Person", "Role", "Aultrum ID", ""]}>
            {people.map((p) => {
              const lastAdmin = p.role === "ADMIN" && !p.deactivatedAt && admins <= 1;
              return (
                <tr key={p.id} className={p.deactivatedAt ? "opacity-55" : undefined}>
                  <Td>
                    <span className="text-ink">{p.name}</span>
                    {p.id === me.id ? <span className="ml-1.5 text-[12px] text-faint">(you)</span> : null}
                    <span className="block text-[12px] text-muted">{p.email}</span>
                    <span className="block text-[12px] text-faint">{p.lastLoginAt ? `Signed in ${ago(p.lastLoginAt)}` : "Hasn't signed in yet"}</span>
                  </Td>
                  <Td>
                    {p.deactivatedAt || lastAdmin ? (
                      <span>{ROLE_LABELS[p.role as AppRole]}</span>
                    ) : (
                      <form action={changeRole} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={p.id} />
                        <select name="role" defaultValue={p.role} className="rounded-md border border-line bg-field px-2 py-1 text-[13px]">
                          <option value="ADMIN">Admin</option>
                          <option value="COORDINATOR">Coordinator</option>
                        </select>
                        <button className="text-[12px] text-accent hover:underline">Save</button>
                      </form>
                    )}
                  </Td>
                  <Td>
                    {p.deactivatedAt ? <Badge>No access</Badge> : p.aultrumSub ? <Badge tone="ok">Linked</Badge> : p.passwordHash ? <Badge>Not linked</Badge> : <Badge tone="warn">Password not set</Badge>}
                  </Td>
                  <Td className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      {!p.deactivatedAt ? (
                        <LinkMaker action={passwordLinkFor} quiet submit={p.passwordHash ? "Reset link" : "Set-password link"} className="w-full max-w-[240px] text-right">
                          <input type="hidden" name="userId" value={p.id} />
                        </LinkMaker>
                      ) : null}
                      {p.id !== me.id && !lastAdmin ? (
                        <form action={setActive}>
                          <input type="hidden" name="userId" value={p.id} />
                          <input type="hidden" name="active" value={p.deactivatedAt ? "yes" : "no"} />
                          <button className={`text-[12px] ${p.deactivatedAt ? "text-accent" : "text-muted hover:text-bad"}`}>{p.deactivatedAt ? "Restore access" : "Remove access"}</button>
                        </form>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>

          <Card>
            <p className="mb-3 text-[15px] font-medium">Signing in with Aultrum ID</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-[14px] text-muted">
              <li>Add the person here with the email they use for Aultrum ID.</li>
              <li>Send them the set-password link. They choose a Flowstate password.</li>
              <li>
                They choose <span className="text-ink">Sign in with Aultrum ID</span> and confirm that password once. After that, Aultrum ID signs them straight in.
              </li>
            </ol>
          </Card>
        </div>

        <div className="grid content-start gap-5 md:grid-cols-2 2xl:grid-cols-1">
          <Card>
            <Label>Add someone</Label>
            <LinkMaker action={addMember} submit="Add">
              <div className="space-y-3">
                <Field label="Name">
                  <input name="name" required className={inputClass} />
                </Field>
                <Field label="Email (the one they use for Aultrum ID)">
                  <input name="email" type="email" required className={inputClass} />
                </Field>
                <Field label="Role">
                  <select name="role" className={inputClass} defaultValue="COORDINATOR">
                    <option value="COORDINATOR">Coordinator — everything except Office and Account</option>
                    <option value="ADMIN">Admin — everything</option>
                  </select>
                </Field>
              </div>
            </LinkMaker>
          </Card>

          <Card>
            <Label>Organisation name</Label>
            <ActionForm action={renameOrganisation} submit="Save">
              <input name="name" defaultValue={me.agency.name} required className={inputClass} />
            </ActionForm>
          </Card>

          <p className="px-1 text-[12px] text-faint md:col-span-2 2xl:col-span-1">
            Removing access signs the person out everywhere at once. There must always be at least one admin.
          </p>
        </div>
      </div>
    </Page>
  );
}
