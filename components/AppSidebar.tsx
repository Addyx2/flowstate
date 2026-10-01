"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ d, filled = false }: { d: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-3.5 w-3.5 shrink-0", filled ? "fill-current" : "stroke-current fill-none stroke-[1.8]")}
      aria-hidden="true"
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  dashboard: "M3 4h7v7H3zM14 4h7v12h-7zM3 13h7v7H3zM14 17h7v3h-7z",
  honor: "M12 3l8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6zM8 12l3 3 5-6",
  gateway: "M4 6c0 7 7 14 14 14l2-4-4-2-2 2c-2.5-1-5-3.5-6-6l2-2-2-4z",
  peak: "M12 3l2.4 6.3L21 12l-6.6 2.7L12 21l-2.4-6.3L3 12l6.6-2.7z",
  puzzle: "M4 5h4a1 1 0 0 1 1 1v2a2 2 0 0 0 4 0V6a1 1 0 0 1 1-1h4v4h-2a2 2 0 0 0 0 4h2v4h-4a1 1 0 0 1-1-1v-2a2 2 0 0 0-4 0v2a1 1 0 0 1-1 1H4z",
} as const;

const CATEGORIES = [
  {
    title: "OPERATIONS",
    items: [{ href: "/dashboard", label: "Command Center", icon: ICONS.dashboard }],
  },
  {
    title: "HONOR",
    items: [{ href: "/honor", label: "Carer App", icon: ICONS.honor }],
  },
  {
    title: "ADDONS SUITE",
    items: [
      { href: "/addons/gateway", label: "Gateway", icon: ICONS.gateway },
      { href: "/addons/peak", label: "Peak", icon: ICONS.peak },
      { href: "/addons", label: "All Add-ons", icon: ICONS.puzzle },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-screen w-60 flex-col gap-5 border-r border-[#2a2a2a] bg-[#0a0a0b] px-4 py-8">
      <div className="flex items-center gap-2 px-2">
        <span className="font-mono text-xs tracking-[0.2em] text-[#e2e2e2]">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-[#4a9eff]">FLOWSTATE</span>
        </span>
        <span className="font-mono text-[9px] text-[#ffb800] ml-1">BETA</span>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat.title} className="space-y-1">
          <p className="px-2 font-mono text-[9px] tracking-[0.18em] text-[#5a5a5a]">{cat.title}</p>
          {cat.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2 py-2 font-mono text-[11px] tracking-wider transition-colors",
                  active
                    ? "bg-[#1a1a1a] text-[#e2e2e2]"
                    : "text-[#8a8a8a] hover:bg-[#141416] hover:text-[#e2e2e2]"
                )}
              >
                <Icon d={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}