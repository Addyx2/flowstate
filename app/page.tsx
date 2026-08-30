export default function Home() {
  const modules = [
    { href: "/dashboard", label: "TEAMS", name: "Operations", desc: "Command center for agencies." },
    { href: "/honor", label: "HONOR", name: "Carer app", desc: "Live CV, chorals, and multi-job for professional caregivers." },
    { href: "/api/health", label: "API", name: "Health", desc: "Service liveness check." },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#4a9eff] mb-6">
          FLOWSTATE // PLATFORM // v0.1.0
        </p>
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-[#e2e2e2]">
          The care ecosystem.
        </h1>
        <p className="text-lg text-[#a0a0a0] mb-12">
          One platform. Multiple modules. Marketing at the brand level, value in
          each module.
        </p>

        <div className="grid md:grid-cols-3 gap-4 text-left">
          {modules.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="border border-[#2a2a2a] bg-[#111111] p-6 hover:border-[#4a9eff] transition-colors"
            >
              <div className="font-mono text-[10px] text-[#4a9eff] mb-3">{m.label}</div>
              <div className="text-xl font-light mb-2">{m.name}</div>
              <p className="text-sm text-[#a0a0a0]">{m.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
