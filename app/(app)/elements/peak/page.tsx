export const metadata = { title: "Peak" };

const FEATURES = [
  { icon: "M12 3l2.4 6.3L21 12l-6.6 2.7L12 21l-2.4-6.3L3 12l6.6-2.7z", label: "EARN", desc: "Carers earn Cashable Points for worked shifts, punctuality, and praise from coordinators." },
  { icon: "M4 6h16M4 12h10M4 18h7", label: "SPEND", desc: "Points cash out or convert to perks, with fair rules: absence never breaks a streak." },
  { icon: "M3 7h18v10H3zM7 10v5M3 12h4", label: "CARD ISSUING", desc: "Physical and virtual cashable cards issued straight from approved timesheets." },
  { icon: "M8 17l4-4 4 4M8 13l4-4 4 4", label: "LEDGER", desc: "Per-worker points ledger, reconciled against the payroll run — always auditable." },
];

function EdgeIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current fill-none stroke-[1.8]" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PeakPage() {
  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#00e676] mb-2">
        ELEMENTS // PEAK
      </p>
      <h1 className="text-3xl md:text-4xl font-light mb-2">Recognition that pays.</h1>
      <p className="text-[#a0a0a0] mb-12 max-w-2xl">
        An Aultrum add-on that plugs into any product — Flowstate or Pleasant —
        turning approved shifts into cashable recognition without touching the care data model.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div key={f.label} className="border border-[#2a2a2a] bg-[#111111] p-6">
            <EdgeIcon d={f.icon} />
            <div className="font-mono text-[10px] text-[#00e676] mt-4 mb-2">{f.label}</div>
            <p className="text-sm text-[#a0a0a0]">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-dashed border-[#2a2a2a] p-6 mt-8 text-[#a0a0a0] font-mono text-xs">
        STATUS: AVAILABLE — READY FOR THE POINTS LEDGER
      </div>
    </main>
  );
}