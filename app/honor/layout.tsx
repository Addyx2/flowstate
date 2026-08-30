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
      <nav className="h-16 border-b border-[#2a2a2a] bg-[#070708] flex items-center px-6 md:px-16">
        <Link href="/" className="font-mono text-xs tracking-[0.2em] text-[#a0a0a0] hover:text-white transition-colors">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-white">FLOWSTATE</span>
        </Link>
        <span className="text-[#3a3a3a] mx-2">/</span>
        <span className="font-mono text-xs tracking-[0.2em] text-[#ffb800]">HONOR</span>
      </nav>

      <div className="border-b border-[#2a2a2a] bg-[#070708] px-6 md:px-16 overflow-x-auto">
        <div className="flex gap-8 max-w-6xl mx-auto py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[10px] tracking-widest text-[#a0a0a0] hover:text-white whitespace-nowrap transition-colors"
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
