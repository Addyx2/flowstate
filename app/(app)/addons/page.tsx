import Link from "next/link";

export const metadata = { title: "Add-ons" };

const ADDONS = [
  {
    href: "/addons/gateway",
    tag: "GATEWAY",
    name: "Always-on contact centre",
    desc: "Answers every inbound call, qualifies enquiries, and books the next-step meeting — logged straight into Flowstate.",
    accent: "#4a9eff",
  },
  {
    href: "/addons/peak",
    tag: "PEAK",
    name: "Recognition that pays",
    desc: "Points for shifts, punctuality, and praise — cashed out or spent on perks. Built on the Flowstate points ledger.",
    accent: "#00e676",
  },
];

export default function AddonsPage() {
  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">
        ADDONS SUITE
      </p>
      <h1 className="text-3xl md:text-4xl font-light mb-2">Extend Flowstate.</h1>
      <p className="text-[#a0a0a0] mb-12 max-w-2xl">
        Optional Aultrum modules that plug into any product — Flowstate, Pleasant,
        or future verticals — without forking the data model.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {ADDONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="border border-[#2a2a2a] bg-[#111111] p-8 hover:border-[#4a9eff] transition-colors"
          >
            <div className="font-mono text-[10px] mb-3" style={{ color: a.accent }}>{a.tag}</div>
            <div className="text-xl font-light mb-2">{a.name}</div>
            <p className="text-sm text-[#a0a0a0]">{a.desc}</p>
          </Link>
        ))}
      </div>

      <div className="border border-dashed border-[#2a2a2a] p-8 mt-8 text-[#a0a0a0] font-mono text-xs">
        MORE ADD-ONS IN THE WORKS — METRICS // TENDER — CQC-REGULATED FUNCTIONS IN PHASE 2
      </div>
    </main>
  );
}