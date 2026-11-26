"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logoutAction } from "@/app/login/actions";
import { groupForPath, NAV_GROUPS, NAVIGATION, type NavGroup, type NavSection } from "@/lib/navigation";

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

const STORAGE_KEY = "flowstate.sidebar.group";

export function AppSidebar({ user }: { user: { name: string; role: string; agency: string } }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Open on the list the current page belongs to; otherwise the last one used.
  const [group, setGroup] = useState<NavGroup>(() => groupForPath(pathname) ?? "flowstate");
  useEffect(() => {
    const fromPath = groupForPath(pathname);
    if (fromPath) {
      setGroup(fromPath);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as NavGroup | null;
      if (saved && NAV_GROUPS.some((g) => g.id === saved)) setGroup(saved);
    } catch {
      // storage unavailable: keep the default
    }
  }, [pathname]);

  const choose = (g: NavGroup) => {
    setGroup(g);
    try {
      localStorage.setItem(STORAGE_KEY, g);
    } catch {
      // storage unavailable: the choice lasts for this page only
    }
  };

  const visible = (s: NavSection) => !s.adminOnly || user.role === "ADMIN";

  const renderSection = (section: NavSection) =>
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
    );

  return (
    <nav className="flex min-h-screen w-60 shrink-0 flex-col gap-5 border-r border-[#2a2a2a] bg-[#0a0a0b] px-4 py-8">
      <div className="flex items-center gap-2 px-2">
        <span className="font-mono text-xs tracking-[0.12em] text-[#e2e2e2]">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-[#4a9eff]">FLOWSTATE</span>
        </span>
        <span className="font-mono text-[9px] text-[#ffb800] ml-1">PROTOTYPE</span>
      </div>

      <div role="tablist" aria-label="Sidebar list" className="grid grid-cols-3 gap-1 rounded-md border border-[#2a2a2a] p-1">
        {NAV_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            onClick={() => choose(g.id)}
            className={cn(
              "rounded px-1 py-1.5 font-mono text-[9px] tracking-wider transition-colors",
              group === g.id ? "bg-[#1a1a1a] text-[#4a9eff]" : "text-[#8a8a8a] hover:text-[#e2e2e2]"
            )}
          >
            {g.label.toUpperCase()}
          </button>
        ))}
      </div>

      {NAVIGATION.filter((s) => s.group === group && visible(s)).map(renderSection)}

      <div className="mt-auto border-t border-[#2a2a2a] pt-5">
        {NAVIGATION.filter((s) => !s.group && visible(s)).map(renderSection)}
        <div className="mt-4 px-2">
          <p className="truncate text-xs text-[#e2e2e2]">{user.name}</p>
          <p className="truncate font-mono text-[9px] tracking-wider text-[#5a5a5a]">{user.agency.toUpperCase()}</p>
          <form action={logoutAction}>
            <button type="submit" className="mt-2 font-mono text-[10px] tracking-wider text-[#8a8a8a] hover:text-[#e2e2e2]">SIGN OUT</button>
          </form>
        </div>
      </div>
    </nav>
  );
}
