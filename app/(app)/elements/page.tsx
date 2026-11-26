import Link from "next/link";

export const metadata = { title: "Elements" };

const ADDONS = [
  {
    href: "/elements/gateway",
    tag: "GATEWAY",
    name: "Always-on contact centre",
    desc: "Answers every inbound call, qualifies enquiries, and books the next-step meeting — logged straight into Flowstate.",
    accent: "#4a9eff",
  },
  {
    href: "/elements/peak",
    tag: "PEAK",
    name: "Recognition that pays",
    desc: "Points for shifts, punctuality, and praise — cashed out or spent on perks. Built on the Flowstate points ledger.",
    accent: "#00e676",
  },
];

export default function AddonsPage() {
  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="label-title text-[13px] text-accent mb-2">
        ELEMENTS
      </p>
      <h1 className="font-serif text-[36px] mb-2">Extend Flowstate.</h1>
      <p className="text-muted mb-12 max-w-2xl">
        Optional Aultrum modules that plug into any product — Flowstate, Pleasant,
        or future verticals — without forking the data model.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {ADDONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="border border-line bg-card p-8 hover:border-faint transition-colors"
          >
            <div className="text-[13px] mb-3" style={{ color: a.accent }}>{a.tag}</div>
            <div className="font-serif text-[22px] mb-2">{a.name}</div>
            <p className="text-sm text-muted">{a.desc}</p>
          </Link>
        ))}
      </div>

      <div className="border border-dashed border-line p-8 mt-8 text-muted text-[13px]">
        MORE ADD-ONS IN THE WORKS — METRICS // TENDER — CQC-REGULATED FUNCTIONS IN PHASE 2
      </div>
    </main>
  );
}