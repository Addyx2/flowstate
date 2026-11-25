export const metadata = { title: "Gateway" };

const FEATURES = [
  { icon: "M4 6c0 7 7 14 14 14l2-4-4-2-2 2c-2.5-1-5-3.5-6-6l2-2-2-4z", f: false, label: "ANSWER EVERY CALL", desc: "Runs 24/7 — every enquiry picked up, every interaction logged into Flowstate." },
  { icon: "M8 2v2M16 2v2M4 8h16M6 4h12a2 2 0 0 1 2 2v3H4V6a2 2 0 0 1 2-2z", f: false, label: "BOOK THE CONSULTATION", desc: "Captures the enquiry and books a call-back or meeting with the right person. Never gives care or medical advice." },
  { icon: "M12 3l8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z", f: false, label: "AUDIT-GRADE LOGS", desc: "Full call records and follow-up state kept in a compliance-ready audit trail." },
];

function EdgeIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current fill-none stroke-[1.8]" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GatewayPage() {
  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">
        ADDONS SUITE // GATEWAY
      </p>
      <h1 className="text-3xl md:text-4xl font-light mb-2">The always-on contact centre.</h1>
      <p className="text-[#a0a0a0] mb-12 max-w-2xl">
        An Aultrum add-on that plugs into Flowstate (or any product) to answer
        inbound calls, qualify, and book — while your CRM stays the system of record.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.label} className="border border-[#2a2a2a] bg-[#111111] p-6">
            <EdgeIcon d={f.icon} />
            <div className="font-mono text-[10px] text-[#4a9eff] mt-4 mb-2">{f.label}</div>
            <p className="text-sm text-[#a0a0a0]">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-dashed border-[#2a2a2a] p-6 mt-8 text-[#a0a0a0] font-mono text-xs">
        STATUS: AVAILABLE — PROVISIONED PER AGENCY
      </div>
    </main>
  );
}