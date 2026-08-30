export default function HonorJobs() {
  const jobs = [
    { org: "Northside Care", role: "Senior Domiciliary Carer", status: "active", pct: "15 hrs/wk" },
    { org: "Thames View Care", role: "Domiciliary Carer", status: "active", pct: "22 hrs/wk" },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#ffb800] mb-2">HONOR // MY JOBS</p>
      <h1 className="text-3xl font-light mb-2">Your caregiving life, in one place.</h1>
      <p className="text-[#a0a0a0] mb-10 max-w-2xl">
        Hold and manage multiple roles side by side. Your Live CV and chorals move with you between them.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <div key={j.org} className="border border-[#2a2a2a] bg-[#111111] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">{j.org}</span>
              <span className="font-mono text-[10px] text-[#00e676]">● {j.status.toUpperCase()}</span>
            </div>
            <div className="text-lg font-light mb-2">{j.role}</div>
            <div className="font-mono text-xs text-[#a0a0a0]">{j.pct}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-dashed border-[#2a2a2a] p-4 text-center text-[#a0a0a0] font-mono text-xs">
        ADD ANOTHER ROLE — up to 3 active jobs
      </div>
    </main>
  );
}
