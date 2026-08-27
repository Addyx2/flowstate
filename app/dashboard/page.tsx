export default function Dashboard() {
  const stats = [
    { label: "HANDLED TODAY", value: "—" },
    { label: "ACTIVE CALLS", value: "—" },
    { label: "DOC FROM AGENTS", value: "—" },
    { label: "CQC READY", value: "—" },
  ];

  return (
    <main className="min-h-screen">
      <nav className="h-16 border-b border-[#2a2a2a] flex items-center px-6 md:px-16">
        <span className="font-mono text-xs tracking-[0.2em] text-[#a0a0a0]">
          AULTRUM<span className="text-[#3a3a3a]">/</span>
          <span className="text-[#e2e2e2]">FLOWSTATE</span>
        </span>
        <span className="font-mono text-[10px] text-[#ffb800] ml-2">BETA</span>
      </nav>

      <div className="px-6 md:px-16 py-10 max-w-6xl mx-auto">
        <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">
          OPERATIONS // LIVE
        </p>
        <h1 className="text-2xl md:text-3xl font-light mb-10">Command Center</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border border-[#2a2a2a] bg-[#111111] p-4"
            >
              <div className="font-mono text-[10px] text-[#a0a0a0] mb-2">
                {s.label}
              </div>
              <div className="text-3xl font-light">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="border border-dashed border-[#2a2a2a] p-8 text-center text-[#a0a0a0] font-mono text-xs">
          DATABASE UNCONNECTED — ADD VERIFIED POSTGRES — VOICE AGENT PENDING
        </div>
      </div>
    </main>
  );
}
