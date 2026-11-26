// Shared building blocks: warm canvas, white rounded cards, serif headings,
// quiet labels. Tokens live in app/globals.css.
import Link from "next/link";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** "SHIFTS // OPEN" → "Shifts · Open" */
function crumb(eyebrow: string) {
  return eyebrow
    .split("//")
    .map((p) => p.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase()))
    .filter(Boolean)
    .join("  ·  ");
}

export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-1.5 text-[13px] text-faint">{crumb(eyebrow)}</p>
        <h1 className="font-serif text-[34px] leading-tight tracking-[-0.01em] text-ink md:text-[40px]">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-[15px] text-muted">{intro}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-card p-6", className)}>{children}</div>;
}

/** A card's title. Written in any case; shown in sentence case. */
export function Label({ children }: { children: React.ReactNode }) {
  return <p className="label-title mb-3 text-[15px] font-medium text-ink">{children}</p>;
}

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-accent-soft text-accent",
  muted: "bg-subtle text-muted",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "muted", raw = false, children }: { tone?: Tone; raw?: boolean; children: React.ReactNode }) {
  return <span className={cn(!raw && "label-title", "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", TONES[tone])}>{children}</span>;
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-[12px] font-normal text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={head.length} className="px-4 py-10 text-center text-muted">
                {empty ?? "Nothing here yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-t border-divider px-4 py-3 align-top", className)}>{children}</td>;
}

export const inputClass =
  "w-full rounded-lg border border-line bg-field px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10";
export const buttonClass = "rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50";
export const ghostButtonClass = "rounded-lg border border-line bg-card px-3.5 py-2 text-sm text-ink transition hover:border-faint disabled:opacity-50";
export const linkClass = "text-accent underline-offset-2 hover:underline";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Tabs({ tabs, active }: { tabs: { href: string; label: string; count?: number }[]; active: string }) {
  return (
    <nav className="mb-6 inline-flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn("rounded-lg px-3 py-1.5 text-[13px] transition", active === t.href ? "bg-ink text-white" : "text-muted hover:bg-hover hover:text-ink")}
        >
          {t.label}
          {t.count !== undefined ? <span className={cn("ml-1.5", active === t.href ? "text-white/60" : "text-faint")}>{t.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-card/50 p-10 text-center text-sm text-muted">{children}</div>;
}

export function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-line bg-card">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm text-ink marker:hidden">
        <span className="mr-2 inline-block text-faint transition group-open:rotate-90">›</span>
        {summary}
      </summary>
      <div className="border-t border-line p-4">{children}</div>
    </details>
  );
}
