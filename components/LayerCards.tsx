import Link from "next/link";

import type { Layer } from "@/lib/qualifiers";

import { Badge } from "./ui";

/** The Aultrum Layers as sliding cards, each listing what's flagged (D14). */
export function LayerCards({ layers, max = 5 }: { layers: Layer[]; max?: number }) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
      {layers.map((l) => {
        const blocks = l.flags.filter((f) => f.severity === "block").length;
        return (
          <section key={l.id} className="w-[330px] shrink-0 snap-start border border-[#2a2a2a] bg-[#111111] p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-mono text-[11px] tracking-widest text-[#4a9eff]">{l.name.toUpperCase()}</h3>
              <span className={l.flags.length ? "text-3xl font-light text-[#ffb800]" : "text-3xl font-light text-[#00e676]"}>{l.flags.length}</span>
            </div>
            <p className="mb-3 mt-1 text-xs text-[#8a8a8a]">{l.measures}</p>
            {blocks ? (
              <p className="mb-2">
                <Badge tone="bad">{blocks} BLOCKING</Badge>
              </p>
            ) : null}
            {l.flags.length === 0 ? <p className="text-sm text-[#00e676]">Nothing flagged.</p> : null}
            <ul className="space-y-2">
              {l.flags.slice(0, max).map((f) => (
                <li key={f.id} className="border-t border-[#1d1d1f] pt-2 text-sm">
                  <Link href={f.href} className="text-[#e2e2e2] hover:text-[#4a9eff]">
                    {f.severity === "block" ? <span className="mr-1 text-[#ff6b6b]">●</span> : <span className="mr-1 text-[#ffb800]">●</span>}
                    {f.subject}
                  </Link>
                  <p className="text-xs text-[#a0a0a0]">{f.reason}</p>
                  <p className="text-xs text-[#5a5a5a]">{f.action}</p>
                </li>
              ))}
            </ul>
            {l.flags.length > max ? (
              <Link href={`/persona/qualifiers#${l.id}`} className="mt-3 block font-mono text-[10px] tracking-wider text-[#4a9eff]">
                +{l.flags.length - max} MORE ON QUALIFIERS →
              </Link>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
