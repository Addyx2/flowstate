import Link from "next/link";

import type { Layer } from "@/lib/qualifiers";

/** The Aultrum Layers as sliding cards, each listing what's flagged (D14). */
export function LayerCards({ layers, max = 4 }: { layers: Layer[]; max?: number }) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
      {layers.map((l) => {
        const blocks = l.flags.filter((f) => f.severity === "block").length;
        return (
          <section key={l.id} className="w-[320px] shrink-0 snap-start rounded-2xl border border-line bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-medium text-ink">{l.name}</h3>
                <p className="mt-1 text-[12px] leading-snug text-muted">{l.measures}</p>
              </div>
              <span className={`font-serif text-[36px] leading-none ${l.flags.length ? "text-ink" : "text-ok"}`}>{l.flags.length}</span>
            </div>
            {blocks ? <p className="mt-3 inline-block rounded-full bg-bad-soft px-2 py-0.5 text-[11px] text-bad">{blocks} blocking a booking</p> : null}
            {l.flags.length === 0 ? <p className="mt-4 text-[13px] text-ok">Nothing flagged.</p> : null}
            <ul className="mt-4 space-y-3">
              {l.flags.slice(0, max).map((f) => (
                <li key={f.id} className="border-t border-divider pt-3 text-[13px]">
                  <Link href={f.href} className="flex items-center gap-2 text-ink hover:text-accent">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${f.severity === "block" ? "bg-bad" : "bg-warn"}`} />
                    {f.subject}
                  </Link>
                  <p className="mt-0.5 pl-3.5 text-[12px] leading-snug text-muted">{f.reason}</p>
                </li>
              ))}
            </ul>
            {l.flags.length > max ? (
              <Link href={`/persona/qualifiers#${l.id}`} className="mt-4 block text-[12px] text-accent hover:underline">
                {l.flags.length - max} more on Qualifiers
              </Link>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
