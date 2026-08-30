import Link from "next/link";

export default function HonorHome() {
  const stats = [
    { label: "CHORAL BALANCE", value: "1,204" },
    { label: "TIER", value: "GOLD" },
    { label: "RATING", value: "4.9" },
    { label: "ACTIVE JOBS", value: "2" },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#ffb800] mb-2">
        HONOR // CARER APP
      </p>
      <h1 className="text-3xl md:text-4xl font-light mb-2">Your care career, proven and portable.</h1>
      <p className="text-[#a0a0a0] mb-12 max-w-2xl">
        Live CV, verified references, and recognition that travels with you —
        whether you work for one agency or three.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="border border-[#2a2a2a] bg-[#111111] p-4">
            <div className="font-mono text-[10px] text-[#a0a0a0] mb-2">{s.label}</div>
            <div className="text-3xl font-light">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/honor/profile" className="border border-[#2a2a2a] bg-[#111111] p-8 hover:border-[#ffb800] transition-colors">
          <div className="font-mono text-[10px] text-[#ffb800] mb-3">LIVE CV</div>
          <div className="text-xl font-light mb-2">Your proof</div>
          <p className="text-sm text-[#a0a0a0]">Qualifications, skills, tier, and verified references — always current, always yours.</p>
        </Link>
        <Link href="/honor/chorals" className="border border-[#2a2a2a] bg-[#111111] p-8 hover:border-[#ffb800] transition-colors">
          <div className="font-mono text-[10px] text-[#ffb800] mb-3">CHORALS</div>
          <div className="text-xl font-light mb-2">Your recognition</div>
          <p className="text-sm text-[#a0a0a0]">Applause from managers and the people you care for — converted to points and tiers.</p>
        </Link>
        <Link href="/honor/jobs" className="border border-[#2a2a2a] bg-[#111111] p-8 hover:border-[#ffb800] transition-colors">
          <div className="font-mono text-[10px] text-[#ffb800] mb-3">MY JOBS</div>
          <div className="text-xl font-light mb-2">Your work life</div>
          <p className="text-sm text-[#a0a0a0]">Manage up to three roles — paid or family caregiving — in one place.</p>
        </Link>
      </div>
    </main>
  );
}
