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
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const itemClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-[7px] text-[14px] transition-colors",
    active ? "bg-side-active text-side-ink" : "text-side-ink/80 hover:bg-side-hover hover:text-side-ink",
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
      <Link key={section.title} href={section.href} className={itemClass(isActive(section.href))}>
        <Icon d={section.icon} />
        {section.title}
      </Link>
    ) : (
      <div key={section.title}>
        <p className="mb-1 mt-5 px-3 text-[13px] text-side-muted">{section.title}</p>
        {section.items?.map((item) => (
          <Link key={item.href} href={item.href} className={itemClass(isActive(item.href))}>
            <Icon d={section.icon} />
            {item.label}
          </Link>
        ))}
      </div>
    );

  return (
    <nav className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col overflow-y-auto bg-side px-4 py-7 text-side-ink">
      <div className="mb-6 flex items-baseline justify-between px-3">
        <Link href="/watchboard" className="font-serif text-[26px] leading-none tracking-[-0.01em]">
          Flowstate
        </Link>
        <span className="rounded-full border border-side-line px-2 py-0.5 text-[10px] text-side-muted">Prototype</span>
      </div>

      <div role="tablist" aria-label="Sidebar list" className="mx-1 grid grid-cols-3 gap-1 rounded-xl bg-side-hover p-1">
        {NAV_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            onClick={() => choose(g.id)}
            className={cn(
              "rounded-lg px-1 py-1.5 text-[12px] transition-colors",
              group === g.id ? "bg-side-active text-side-ink" : "text-side-muted hover:text-side-ink",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-2">{NAVIGATION.filter((s) => s.group === group && visible(s)).map(renderSection)}</div>

      <div className="mt-auto pt-6">
        {NAVIGATION.filter((s) => !s.group && visible(s)).map(renderSection)}
        <div className="mt-6 flex items-center gap-3 border-t border-side-line px-3 pt-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-side-active text-[13px]">{user.name.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px]">{user.name}</p>
            <p className="truncate text-[12px] text-side-muted">{user.agency}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" title="Sign out" className="text-[12px] text-side-muted hover:text-side-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
