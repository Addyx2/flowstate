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
      <p className="label-title text-[13px] text-warn mb-2">
        HONOR // CARER APP
      </p>
      <h1 className="font-serif text-[36px] mb-2">Your care career, proven and portable.</h1>
      <p className="text-muted mb-12 max-w-2xl">
        Live CV, verified references, and recognition that travels with you —
        whether you work for one agency or three.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-card p-4">
            <div className="text-[13px] text-muted mb-2">{s.label}</div>
            <div className="font-serif text-[34px]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/honor/profile" className="border border-line bg-card p-8 hover:border-faint transition-colors">
          <div className="text-[13px] text-warn mb-3">LIVE CV</div>
          <div className="font-serif text-[22px] mb-2">Your proof</div>
          <p className="text-sm text-muted">Qualifications, skills, tier, and verified references — always current, always yours.</p>
        </Link>
        <Link href="/honor/chorals" className="border border-line bg-card p-8 hover:border-faint transition-colors">
          <div className="text-[13px] text-warn mb-3">CHORALS</div>
          <div className="font-serif text-[22px] mb-2">Your recognition</div>
          <p className="text-sm text-muted">Applause from managers and the people you care for — converted to points and tiers.</p>
        </Link>
        <Link href="/honor/jobs" className="border border-line bg-card p-8 hover:border-faint transition-colors">
          <div className="text-[13px] text-warn mb-3">MY JOBS</div>
          <div className="font-serif text-[22px] mb-2">Your work life</div>
          <p className="text-sm text-muted">Manage up to three roles — paid or family caregiving — in one place.</p>
        </Link>
      </div>
    </main>
  );
}
