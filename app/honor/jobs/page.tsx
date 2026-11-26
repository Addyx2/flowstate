export default function HonorJobs() {
  const jobs = [
    { org: "Northside Care", role: "Senior Domiciliary Carer", status: "active", pct: "15 hrs/wk" },
    { org: "Thames View Care", role: "Domiciliary Carer", status: "active", pct: "22 hrs/wk" },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="label-title text-[13px] text-warn mb-2">HONOR // MY JOBS</p>
      <h1 className="font-serif text-[34px] mb-2">Your caregiving life, in one place.</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Hold and manage multiple roles side by side. Your Live CV and chorals move with you between them.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <div key={j.org} className="border border-line bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">{j.org}</span>
              <span className="text-[13px] text-ok">● {j.status.toUpperCase()}</span>
            </div>
            <div className="font-serif text-[21px] mb-2">{j.role}</div>
            <div className="text-[13px] text-muted">{j.pct}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-dashed border-line p-4 text-center text-muted text-[13px]">
        ADD ANOTHER ROLE — up to 3 active jobs
      </div>
    </main>
  );
}
