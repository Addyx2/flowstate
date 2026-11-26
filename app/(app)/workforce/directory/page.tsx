import Link from "next/link";

import { Badge, linkClass, Page, PageHeader, Table, Tabs, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { expiryState, STATUTORY } from "@/lib/checks";
import { prisma } from "@/lib/db";
import { fullName } from "@/lib/format";
import { ROLE_LABELS, type AppRole } from "@/lib/permissions";

export const metadata = { title: "Directory" };

const TABS = ["carers", "receivers", "homes", "coordinators", "key"] as const;
type Tab = (typeof TABS)[number];

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireOffice();
  const tab: Tab = (TABS as readonly string[]).includes((await searchParams).tab ?? "") ? ((await searchParams).tab as Tab) : "carers";
  const a = user.agencyId;

  const [carers, packages, users, keyPersons] = await Promise.all([
    prisma.carer.findMany({ where: { agencyId: a }, include: { checks: true, teams: { include: { package: true } } }, orderBy: { firstName: "asc" } }),
    prisma.package.findMany({ where: { agencyId: a }, include: { team: true, keyPersons: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { agencyId: a, role: { not: "CARER" } }, orderBy: { name: "asc" } }),
    prisma.keyPerson.findMany({ where: { package: { agencyId: a } }, include: { package: true }, orderBy: { name: "asc" } }),
  ]);
  const receivers = packages.filter((p) => p.kind === "CARE_RECEIVER");
  const homes = packages.filter((p) => p.kind === "CARE_HOME");

  const tabs = [
    { href: "/workforce/directory?tab=carers", label: "Carers", count: carers.length },
    { href: "/workforce/directory?tab=receivers", label: "Care receivers", count: receivers.length },
    { href: "/workforce/directory?tab=homes", label: "Care homes", count: homes.length },
    { href: "/workforce/directory?tab=coordinators", label: "Coordinators", count: users.length },
    { href: "/workforce/directory?tab=key", label: "Key persons", count: keyPersons.length },
  ];

  return (
    <Page>
      <PageHeader eyebrow="WORKFORCE // DIRECTORY" title="Directory" intro="Everyone around your Packages. Contact and logistics details only — no care records." />
      <Tabs tabs={tabs} active={`/workforce/directory?tab=${tab}`} />

      {tab === "carers" ? (
        <Table head={["Carer", "Role", "Status", "Checks", "Teams", "Carer app"]}>
          {carers.map((c) => {
            const missing = STATUTORY.filter((s) => {
              const state = expiryState(c.checks.find((k) => k.kind === s.kind));
              return state === "MISSING" || state === "EXPIRED";
            });
            return (
              <tr key={c.id}>
                <Td>
                  <span className="text-[#e2e2e2]">{fullName(c)}</span>
                  <span className="block text-xs text-[#8a8a8a]">{[c.email, c.phone, c.postcode].filter(Boolean).join(" · ")}</span>
                </Td>
                <Td>{c.jobTitle ?? "—"}</Td>
                <Td>
                  <Badge tone={c.status === "ACTIVE" ? "ok" : c.status === "ONBOARDING" ? "info" : "muted"}>{c.status}</Badge>
                </Td>
                <Td>{missing.length ? <Badge tone="bad">{missing.map((m) => m.label).join(", ").toUpperCase()}</Badge> : <Badge tone="ok">CLEAR</Badge>}</Td>
                <Td>
                  {c.teams.map((t) => (
                    <Link key={t.id} href={`/workforce/teams/${t.packageId}`} className={`${linkClass} mr-2 text-xs`}>
                      {t.package.name}
                    </Link>
                  ))}
                </Td>
                <Td>{c.aultrumSub ? <Badge tone="ok">CONNECTED</Badge> : <Badge>NOT YET</Badge>}</Td>
              </tr>
            );
          })}
        </Table>
      ) : null}

      {tab === "receivers" || tab === "homes" ? (
        <Table head={["Package", "Postcode", "Funding", "Team", "Key persons"]} empty="No Packages yet.">
          {(tab === "receivers" ? receivers : homes).map((p) => (
            <tr key={p.id}>
              <Td>
                <Link href={`/workforce/teams/${p.id}`} className={linkClass}>
                  {p.name}
                </Link>
              </Td>
              <Td>{p.postcode ?? "—"}</Td>
              <Td>{p.fundingBody ?? "—"}</Td>
              <Td>{p.team.length}</Td>
              <Td>{p.keyPersons.length}</Td>
            </tr>
          ))}
        </Table>
      ) : null}

      {tab === "coordinators" ? (
        <Table head={["Name", "Email", "Role", "Aultrum ID"]}>
          {users.map((u) => (
            <tr key={u.id}>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>{ROLE_LABELS[u.role as AppRole]}</Td>
              <Td>{u.aultrumSub ? <Badge tone="ok">LINKED</Badge> : <Badge>NOT LINKED</Badge>}</Td>
            </tr>
          ))}
        </Table>
      ) : null}

      {tab === "key" ? (
        <Table head={["Name", "Relationship", "Package", "Contact"]} empty="No key persons yet. Add them on a Package's page.">
          {keyPersons.map((k) => (
            <tr key={k.id}>
              <Td>{k.name}</Td>
              <Td>{k.relationship ?? "—"}</Td>
              <Td>
                <Link href={`/workforce/teams/${k.packageId}`} className={linkClass}>
                  {k.package.name}
                </Link>
              </Td>
              <Td>{[k.email, k.phone].filter(Boolean).join(" · ") || "—"}</Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </Page>
  );
}
