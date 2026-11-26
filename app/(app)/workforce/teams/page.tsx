import Link from "next/link";

import { ActionForm } from "@/components/ActionForm";
import { Badge, Card, Field, inputClass, linkClass, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fullName } from "@/lib/format";

import { createPackage } from "../actions";

export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const user = await requireOffice();
  const packages = await prisma.package.findMany({
    where: { agencyId: user.agencyId, active: true },
    include: { team: { include: { carer: true }, orderBy: { primary: "desc" } }, keyPersons: true, _count: { select: { shifts: { where: { status: "OPEN", startAt: { gt: new Date() } } } } } },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  return (
    <Page>
      <PageHeader eyebrow="WORKFORCE // TEAMS" title="Teams" intro="Each Package — a care receiver or a care home — and the care team around it." />
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <Table head={["Package", "Kind", "Team", "Open shifts"]} empty="No Packages yet. Create one to start a team.">
          {packages.map((p) => (
            <tr key={p.id}>
              <Td>
                <Link href={`/workforce/teams/${p.id}`} className={linkClass}>
                  {p.name}
                </Link>
                <span className="block text-xs text-muted">{p.postcode}</span>
              </Td>
              <Td>
                <Badge tone={p.kind === "CARE_HOME" ? "info" : "muted"}>{p.kind === "CARE_HOME" ? "CARE HOME" : "CARE RECEIVER"}</Badge>
              </Td>
              <Td>
                {p.team.length === 0 ? <span className="text-muted">No one yet</span> : p.team.map((m) => fullName(m.carer)).join(", ")}
              </Td>
              <Td>{p._count.shifts ? <Badge tone="warn">{p._count.shifts} OPEN</Badge> : <span className="text-muted">—</span>}</Td>
            </tr>
          ))}
        </Table>

        <Card className="h-fit">
          <p className="label-title text-[13px] text-accent mb-3">NEW PACKAGE</p>
          <ActionForm action={createPackage} submit="Create Package">
            <Field label="Kind">
              <select name="kind" className={inputClass}>
                <option value="CARE_RECEIVER">Care receiver</option>
                <option value="CARE_HOME">Care home</option>
              </select>
            </Field>
            <Field label="Short name">
              <input name="name" required placeholder="e.g. Mrs A. or Oakwood House" className={inputClass} />
            </Field>
            <Field label="Address">
              <input name="address" className={inputClass} />
            </Field>
            <Field label="Postcode">
              <input name="postcode" className={inputClass} />
            </Field>
            <Field label="Funding body">
              <input name="fundingBody" placeholder="e.g. City council" className={inputClass} />
            </Field>
            <Field label="Hourly rate (£)">
              <input name="hourlyRate" inputMode="decimal" className={inputClass} />
            </Field>
            <p className="text-xs text-muted">Logistics only. Don&apos;t add needs, conditions or care plans — they stay in your care-records system.</p>
          </ActionForm>
        </Card>
      </div>
    </Page>
  );
}
