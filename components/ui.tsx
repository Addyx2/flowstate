// Shared building blocks in the Obsidian Precision style.
import Link from "next/link";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">{eyebrow}</p>
        <h1 className="text-3xl font-light">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-[#a0a0a0]">{intro}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border border-[#2a2a2a] bg-[#111111] p-5", className)}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] tracking-widest text-[#a0a0a0] mb-2">{children}</p>;
}

const TONES = {
  ok: "text-[#00e676] border-[#00e676]/30",
  warn: "text-[#ffb800] border-[#ffb800]/30",
  bad: "text-[#ff6b6b] border-[#ff6b6b]/30",
  info: "text-[#4a9eff] border-[#4a9eff]/30",
  muted: "text-[#8a8a8a] border-[#2a2a2a]",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={cn("inline-block border px-1.5 py-0.5 font-mono text-[9px] tracking-wider whitespace-nowrap", TONES[tone])}>{children}</span>;
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  return (
    <div className="overflow-x-auto border border-[#2a2a2a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a2a] text-left">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-mono text-[10px] font-normal tracking-widest text-[#8a8a8a]">
                {h.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={head.length} className="px-4 py-8 text-center text-[#8a8a8a]">
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
  return <td className={cn("border-t border-[#1d1d1f] px-4 py-3 align-top", className)}>{children}</td>;
}

export const inputClass =
  "w-full border border-[#2a2a2a] bg-[#0a0a0b] px-3 py-2 text-sm text-[#e2e2e2] outline-none focus:border-[#4a9eff]";
export const buttonClass = "bg-[#4a9eff] px-3 py-2 text-sm text-[#070708] hover:bg-[#6bb0ff] disabled:opacity-60";
export const ghostButtonClass = "border border-[#2a2a2a] px-3 py-2 text-sm text-[#e2e2e2] hover:border-[#4a9eff]";
export const linkClass = "text-[#4a9eff] hover:underline";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] tracking-widest text-[#a0a0a0]">{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

export function Tabs({ tabs, active }: { tabs: { href: string; label: string; count?: number }[]; active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-[#2a2a2a]">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "-mb-px border-b px-3 py-2 font-mono text-[11px] tracking-wider",
            active === t.href ? "border-[#4a9eff] text-[#e2e2e2]" : "border-transparent text-[#8a8a8a] hover:text-[#e2e2e2]"
          )}
        >
          {t.label}
          {t.count !== undefined ? <span className="ml-1.5 text-[#5a5a5a]">{t.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-[#2a2a2a] p-8 text-center text-sm text-[#8a8a8a]">{children}</div>;
}

export function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="border border-[#2a2a2a] bg-[#111111]">
      <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] tracking-wider text-[#4a9eff]">{summary.toUpperCase()}</summary>
      <div className="border-t border-[#2a2a2a] p-4">{children}</div>
    </details>
  );
}
