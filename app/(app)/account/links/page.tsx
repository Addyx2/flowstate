import { LinkMaker } from "@/components/LinkMaker";
import { Badge, Card, inputClass, Label, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ago, fmtDate, fullName } from "@/lib/format";
import { LINK_LABEL } from "@/lib/links";

import { createCarerInvite, revokeLink } from "./actions";

export const metadata = { title: "Links" };
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const user = await requireOffice("/account/links");
  const [links, carers] = await Promise.all([
    prisma.link.findMany({ where: { agencyId: user.agencyId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.carer.findMany({ where: { agencyId: user.agencyId, status: { not: "INACTIVE" }, aultrumSub: null }, orderBy: { firstName: "asc" } }),
  ]);
  const now = new Date();

  return (
    <Page>
      <PageHeader
        eyebrow="ACCOUNT // LINKS"
        title="Links"
        intro="Everything you've published as a link: praise links for families, shift requests to agencies and carer invites. Each one shows only what it needs, expires, and can be revoked."
      />
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <Table head={["Link", "Status", "Opened", "Answer", ""]} empty="No links yet. Make one from a Package's page or an open shift.">
          {links.map((l) => {
            const status = l.revokedAt ? "REVOKED" : l.expiresAt < now ? "EXPIRED" : "LIVE";
            return (
              <tr key={l.id}>
                <Td>
                  <Badge tone="info">{LINK_LABEL[l.kind].toUpperCase()}</Badge>
                  <span className="mt-1 block">{l.purpose}</span>
                  <span className="text-xs text-muted">
                    Made {ago(l.createdAt)} · expires {fmtDate(l.expiresAt)}
                  </span>
                </Td>
                <Td>
                  <Badge tone={status === "LIVE" ? "ok" : "muted"}>{status}</Badge>
                </Td>
                <Td>{l.uses ? `${l.uses}× · ${ago(l.lastOpenedAt!)}` : "Not yet"}</Td>
                <Td className="max-w-[220px] text-xs">{l.response ?? "—"}</Td>
                <Td>
                  {status === "LIVE" ? (
                    <form action={revokeLink}>
                      <input type="hidden" name="linkId" value={l.id} />
                      <button className="text-[13px] text-muted hover:text-bad">Revoke</button>
                    </form>
                  ) : null}
                </Td>
              </tr>
            );
          })}
        </Table>

        <Card className="h-fit">
          <Label>INVITE A CARER TO THE AULTRUM CARER APP</Label>
          {carers.length ? (
            <LinkMaker action={createCarerInvite} submit="Make invite">
              <select name="carerId" className={inputClass}>
                {carers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {fullName(c)}
                  </option>
                ))}
              </select>
            </LinkMaker>
          ) : (
            <p className="text-sm text-muted">Every carer has joined.</p>
          )}
          <p className="mt-3 text-xs text-muted">Praise links are made on each Package&apos;s page; shift requests on Open shifts.</p>
        </Card>
      </div>
    </Page>
  );
}
