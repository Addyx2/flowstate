import { fmtRange } from "@/lib/format";
import { openLink, postcodeArea } from "@/lib/links";

import { PraiseForm, ShiftResponseForm } from "./Forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Flowstate", robots: { index: false, follow: false } };

function Shell({ agency, children }: { agency?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-md">
        <p className="mb-8 text-[13px] text-muted">{agency ? `${agency} · via ` : ""}<span className="font-serif text-[16px] text-ink">Flowstate</span></p>
        {children}
      </div>
    </main>
  );
}

export default async function PublicLink({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { link, live } = await openLink(token);
  if (!link || !live) {
    return (
      <Shell>
        <h1 className="font-serif text-[28px] mb-2">This link has ended</h1>
        <p className="text-muted">Ask the person who sent it for a new one.</p>
      </Shell>
    );
  }

  if (link.kind === "PRAISE" && link.package) {
    const team = link.package.team.map((m) => ({ id: m.carer.id, name: `${m.carer.firstName} ${m.carer.lastName.charAt(0)}.` }));
    return (
      <Shell agency={link.agency.name}>
        <h1 className="font-serif text-[28px] mb-2">Say thank you</h1>
        <p className="mb-6 text-muted">A few words go straight to the carer, and help {link.agency.name} recognise great care.</p>
        {team.length ? <PraiseForm token={token} team={team} defaultName={link.keyPerson?.name ?? ""} /> : <p>There&apos;s no one to thank yet.</p>}
      </Shell>
    );
  }

  if (link.kind === "SHIFT_REQUEST" && link.shift) {
    const s = link.shift;
    return (
      <Shell agency={link.agency.name}>
        <h1 className="font-serif text-[28px] mb-2">Can you cover this shift?</h1>
        <dl className="mb-6 space-y-2 border border-line bg-card p-4 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">When</dt>
            <dd>{fmtRange(s.startAt, s.endAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Area</dt>
            <dd>{postcodeArea(s.package.postcode)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Setting</dt>
            <dd>{s.package.kind === "CARE_HOME" ? "Care home" : "Home visit"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Role</dt>
            <dd>{s.jobRole?.name ?? "Care worker"}</dd>
          </div>
        </dl>
        {s.status !== "OPEN" ? <p className="text-ok">This shift has been covered. Thank you.</p> : link.respondedAt ? <p className="text-muted">You&apos;ve answered: {link.response}</p> : <ShiftResponseForm token={token} />}
      </Shell>
    );
  }

  return (
    <Shell agency={link.agency.name}>
      <h1 className="font-serif text-[28px]">Nothing to do here</h1>
    </Shell>
  );
}
