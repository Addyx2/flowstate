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
      <p className="font-mono text-[10px] tracking-widest text-[#ffb800] mb-2">HONOR // LIVE CV</p>
      <h1 className="text-3xl font-light mb-8">Amara Okoye</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="border border-[#2a2a2a] bg-[#111111] p-6">
            <h2 className="font-mono text-xs mb-4 text-[#a0a0a0]">HEADLINE</h2>
            <p className="text-lg font-light">
              Dedicated domiciliary carer with 5 years in dementia and elderly care.
            </p>
          </section>

          <section className="border border-[#2a2a2a] bg-[#111111] p-6">
            <h2 className="font-mono text-xs mb-4 text-[#a0a0a0]">QUALIFICATIONS</h2>
            <div className="space-y-3">
              {qualifications.map((q) => (
                <div key={q.name} className="flex justify-between border-b border-[#2a2a2a] pb-3">
                  <span>{q.name}</span>
                  <span className="text-sm text-[#a0a0a0]">{q.issuer} · {q.year}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-[#2a2a2a] bg-[#111111] p-6">
            <h2 className="font-mono text-xs mb-4 text-[#a0a0a0]">VERIFIED REFERENCES</h2>
            <div className="space-y-4">
              {references.map((r) => (
                <div key={r.author} className="border border-[#2a2a2a] bg-[#070708] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{r.author}</span>
                    <span className="font-mono text-[10px] text-[#a0a0a0]">{r.role}</span>
                    <span className="font-mono text-[10px] text-[#00e676]">✔ VERIFIED</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0]">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-[#2a2a2a] bg-[#111111] p-6">
            <div className="font-mono text-[10px] text-[#a0a0a0] mb-2">TIER</div>
            <div className="text-3xl font-light text-[#ffb800] mb-4">GOLD</div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#a0a0a0]">RATING</span><span>4.9 / 5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#a0a0a0]">CHORALS</span><span className="text-[#ffb800]">1,204</span>
            </div>
          </div>

          <div className="border border-dashed border-[#2a2a2a] p-6 text-center text-[#a0a0a0] font-mono text-xs">
            CV IS PORTABLE — travels with you between employers.
          </div>
        </aside>
      </div>
    </main>
  );
}
