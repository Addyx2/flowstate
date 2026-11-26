// Small, quiet SVG charts. No library: server-rendered, no client JS.
import { cn } from "./ui";

export function Stat({ value, label, delta, deltaGood = true }: { value: string; label: string; delta?: string | null; deltaGood?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[44px] leading-none tracking-[-0.02em] text-ink">{value}</span>
        {delta ? <span className={cn("text-[13px]", deltaGood ? "text-ok" : "text-bad")}>{delta}</span> : null}
      </div>
      <p className="mt-1.5 text-[14px] text-muted">{label}</p>
    </div>
  );
}

/** Thin vertical bars, one per value, like a hairline histogram. */
export function Hairlines({ values, labels, height = 150 }: { values: number[]; labels?: { index: number; text: string }[]; height?: number }) {
  const max = Math.max(1, ...values);
  const w = 600;
  const step = w / Math.max(1, values.length);
  const barW = Math.max(1.2, Math.min(6, step * 0.38));
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="h-[150px] w-full" role="img" aria-label="Chart">
        <line x1="0" x2={w} y1={height - 0.5} y2={height - 0.5} className="stroke-line" strokeWidth="1" />
        {values.map((v, i) => {
          const h = Math.max(v > 0 ? 3 : 1, (v / max) * (height - 8));
          return <rect key={i} x={i * step + (step - barW) / 2} y={height - h} width={barW} height={h} className={v > 0 ? "fill-bar" : "fill-bar-soft"} />;
        })}
      </svg>
      {labels ? (
        <div className="relative mt-2 h-4 text-[11px] text-faint">
          {labels.map((l) => (
            <span key={l.index} className="absolute -translate-x-1/2" style={{ left: `${((l.index + 0.5) / values.length) * 100}%` }}>
              {l.text}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Paired bars per group: a main series and a second one (e.g. booked vs open). */
export function PairedBars({
  groups,
  aLabel,
  bLabel,
  bTone = "attention",
  height = 170,
}: {
  groups: { label: string; a: number; b: number }[];
  aLabel: string;
  bLabel: string;
  bTone?: "attention" | "soft";
  height?: number;
}) {
  const max = Math.max(1, ...groups.flatMap((g) => [g.a, g.b]));
  const ticks = [0, 0.5, 1].map((t) => Math.round(t * max));
  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-[170px] flex-col-reverse justify-between pb-0 text-right text-[11px] text-faint" style={{ height }}>
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex flex-1 items-end justify-around border-b border-line" style={{ height }}>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-divider" />
          {groups.map((g) => (
            <div key={g.label} className="flex h-full items-end gap-1">
              <div className="w-3.5 rounded-t-[3px] bg-bar" style={{ height: `${(g.a / max) * 100}%` }} title={`${g.label}: ${g.a} ${aLabel.toLowerCase()}`} />
              <div
                className={cn("w-3.5 rounded-t-[3px]", bTone === "attention" ? "bg-bad/70" : "bg-bar-soft")}
                style={{ height: `${(g.b / max) * 100}%` }}
                title={`${g.label}: ${g.b} ${bLabel.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-8 mt-2 flex justify-around text-[11px] text-faint">
        {groups.map((g) => (
          <span key={g.label}>{g.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; tone: "bar" | "soft" | "attention" }[] }) {
  const dot = { bar: "bg-bar", soft: "bg-bar-soft", attention: "bg-bad/70" };
  return (
    <div className="flex flex-wrap gap-4 border-t border-divider pt-4 text-[12px] text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", dot[i.tone])} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** Horizontal bars with a value at the end. */
export function HBars({ rows, suffix = "" }: { rows: { label: string; value: number; href?: string }[]; suffix?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[120px_1fr] items-center gap-3 text-[12px]">
          <span className="truncate text-muted">{r.label}</span>
          <span className="flex items-center gap-2">
            <span className="h-3 rounded-[3px] bg-bar" style={{ width: `${Math.max(2, (r.value / max) * 85)}%` }} />
            <span className="whitespace-nowrap text-faint">
              {Number.isInteger(r.value) ? r.value : r.value.toFixed(1)}
              {suffix}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
