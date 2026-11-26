import Link from "next/link";

export default function HonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    { href: "/honor", label: "HOME" },
    { href: "/honor/profile", label: "LIVE CV" },
    { href: "/honor/chorals", label: "CHORALS" },
    { href: "/honor/jobs", label: "MY JOBS" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="h-16 border-b border-line bg-canvas flex items-center px-6 md:px-16">
        <Link href="/" className="text-sm text-muted hover:text-white transition-colors">
          AULTRUM<span className="text-faint">/</span>
          <span className="text-white">FLOWSTATE</span>
        </Link>
        <span className="text-faint mx-2">/</span>
        <span className="text-sm text-warn">HONOR</span>
      </nav>

      <div className="border-b border-line bg-canvas px-6 md:px-16 overflow-x-auto">
        <div className="flex gap-8 max-w-6xl mx-auto py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="label-title text-[13px] text-muted hover:text-white whitespace-nowrap transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
