export default function HonorProfile() {
  const qualifications = [
    { name: "Care Certificate", issuer: "Skills for Care", year: "2023" },
    { name: "Level 2 Diploma in Care", issuer: "City & Guilds", year: "2022" },
    { name: "First Aid at Work", issuer: "Red Cross", year: "2025" },
  ];

  const references = [
    {
      author: "Sarah M.",
      role: "Care Manager",
      verified: true,
      text: "Reliable, warm, and meticulous with records. Clients consistently request her.",
    },
    {
      author: "Mrs. Adeyemi",
      role: "Care Receiver",
      verified: true,
      text: "She always makes me feel safe and looked after. I trust her completely.",
    },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="label-title text-[13px] text-warn mb-2">HONOR // LIVE CV</p>
      <h1 className="font-serif text-[34px] mb-8">Amara Okoye</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="border border-line bg-card p-6">
            <h2 className="text-[13px] mb-4 text-muted">HEADLINE</h2>
            <p className="font-serif text-[21px]">
              Dedicated domiciliary carer with 5 years in dementia and elderly care.
            </p>
          </section>

          <section className="border border-line bg-card p-6">
            <h2 className="text-[13px] mb-4 text-muted">QUALIFICATIONS</h2>
            <div className="space-y-3">
              {qualifications.map((q) => (
                <div key={q.name} className="flex justify-between border-b border-line pb-3">
                  <span>{q.name}</span>
                  <span className="text-sm text-muted">{q.issuer} · {q.year}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-line bg-card p-6">
            <h2 className="text-[13px] mb-4 text-muted">VERIFIED REFERENCES</h2>
            <div className="space-y-4">
              {references.map((r) => (
                <div key={r.author} className="border border-line bg-canvas p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{r.author}</span>
                    <span className="text-[13px] text-muted">{r.role}</span>
                    <span className="text-[13px] text-ok">✔ VERIFIED</span>
                  </div>
                  <p className="text-sm text-muted">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-line bg-card p-6">
            <div className="text-[13px] text-muted mb-2">TIER</div>
            <div className="font-serif text-[34px] text-warn mb-4">GOLD</div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">RATING</span><span>4.9 / 5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">CHORALS</span><span className="text-warn">1,204</span>
            </div>
          </div>

          <div className="border border-dashed border-line p-6 text-center text-muted text-[13px]">
            CV IS PORTABLE — travels with you between employers.
          </div>
        </aside>
      </div>
    </main>
  );
}
