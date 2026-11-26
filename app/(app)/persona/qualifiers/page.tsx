import Link from "next/link";

import { Badge, Card, Label, linkClass, Page, PageHeader, Table, Td } from "@/components/ui";
import { requireOffice } from "@/lib/auth";
import { computeLayers, RAPPORT_LOW, RAPPORT_RULES_VERSION, rapportPairs } from "@/lib/qualifiers";

export const metadata = { title: "Qualifiers" };
export const dynamic = "force-dynamic";

export default async function QualifiersPage() {
  const user = await requireOffice();
  const [layers, pairs] = await Promise.all([computeLayers(user.agencyId), rapportPairs(user.agencyId)]);
  const teamPairs = pairs.filter((p) => p.onTeam);

  return (
    <Page>
      <PageHeader
        eyebrow="PERSONA // QUALIFIERS"
        title="Qualifiers"
        intro="The four Aultrum Layers in full. Each flag says why; you decide what to do. Qualifiers judge the work, never the person receiving care."
      />
      <div className="space-y-6">
        {layers.map((l) => (
          <section key={l.id} id={l.id}>
            <div className="mb-2 flex items-baseline gap-3">
              <h2 className="font-serif text-[22px]">{l.name}</h2>
              <Badge tone={l.flags.length ? "warn" : "ok"}>{l.flags.length ? `${l.flags.length} FLAGGED` : "CLEAR"}</Badge>
            </div>
            <p className="mb-3 text-sm text-muted">{l.measures}</p>
            {l.flags.length ? (
              <Table head={["", "Who", "Why", "What to do"]}>
                {l.flags.map((f) => (
                  <tr key={f.id}>
                    <Td>{f.severity === "block" ? <Badge tone="bad">BLOCKS</Badge> : <Badge tone="warn">CHECK</Badge>}</Td>
                    <Td>
                      <Link href={f.href} className={linkClass}>
                        {f.subject}
                      </Link>
                    </Td>
                    <Td>{f.reason}</Td>
                    <Td className="text-muted">{f.action}</Td>
                  </tr>
                ))}
              </Table>
            ) : null}
          </section>
        ))}

        <Card>
          <Label>RAPPORT ACROSS EVERY TEAM — {RAPPORT_RULES_VERSION.toUpperCase()}</Label>
          <p className="mb-3 text-sm text-muted">
            Pattern recognition over the last eight weeks: visits together, praise, punctuality, missed visits, swaps, offers, complaints, change-of-carer requests, your feedback and travel distance. Below {RAPPORT_LOW} is flagged. A prompt for you, never a verdict — no rankings are shown to carers.
          </p>
          <Table head={["Pairing", "Rapport", "Because"]}>
            {teamPairs.map((p) => (
              <tr key={`${p.carerId}-${p.packageId}`}>
                <Td>
                  {p.carerName} ·{" "}
                  <Link href={`/workforce/teams/${p.packageId}`} className={linkClass}>
                    {p.packageName}
                  </Link>
                </Td>
                <Td>
                  <Badge tone={p.rapport.score < RAPPORT_LOW ? "warn" : p.rapport.score >= 70 ? "ok" : "muted"}>{p.rapport.score}</Badge>
                </Td>
                <Td className="text-xs text-muted">{p.rapport.reasons.join(" · ")}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </Page>
  );
}
