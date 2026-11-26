"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION } from "@/lib/navigation";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 stroke-current fill-none stroke-[1.8]" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-2.5 rounded-md px-2 py-2 font-mono text-[11px] tracking-wider transition-colors",
    active ? "bg-[#1a1a1a] text-[#e2e2e2]" : "text-[#8a8a8a] hover:bg-[#141416] hover:text-[#e2e2e2]"
  );

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex min-h-screen w-60 shrink-0 flex-col gap-5 border-r border-[#2a2a2a] bg-[#0a0a0b] px-4 py-8">
      <div className="flex items-center gap-2 px-2">
        <span className="font-mono text-xs tracking-[0.12em] text-[#e2e2e2]">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-[#4a9eff]">FLOWSTATE</span>
        </span>
        <span className="font-mono text-[9px] text-[#ffb800] ml-1">PROTOTYPE</span>
      </div>

      {NAVIGATION.map((section) =>
        section.href ? (
          <Link key={section.title} href={section.href} className={linkClass(isActive(section.href))}>
            <Icon d={section.icon} />
            {section.title}
          </Link>
        ) : (
          <div key={section.title} className="space-y-1">
            <p className="flex items-center gap-2 px-2 font-mono text-[9px] tracking-[0.18em] text-[#5a5a5a]">
              <Icon d={section.icon} />
              {section.title.toUpperCase()}
            </p>
            {section.items?.map((item) => (
              <Link key={item.href} href={item.href} className={cn(linkClass(isActive(item.href)), "pl-8")}>
                {item.label}
              </Link>
            ))}
          </div>
        )
      )}
    </nav>
  );
}
