export default function HonorChorals() {
  const chorals = [
    { from: "Sarah M.", role: "Care Manager", message: "Thank you for covering the night shift at short notice. You're a lifesaver.", points: 25, time: "2h ago" },
    { from: "Mrs. Adeyemi", role: "Care Receiver", message: "You always make me feel so safe. Thank you for everything.", points: 50, time: "Yesterday" },
    { from: "Daniel R.", role: "Care Manager", message: "Brilliant documentation this month. Audit-ready without a single ask.", points: 40, time: "2 days ago" },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#ffb800] mb-2">HONOR // CHORALS</p>
      <h1 className="text-3xl font-light mb-2">Recognition, converted.</h1>
      <p className="text-[#a0a0a0] mb-10 max-w-2xl">
        Every applause from a manager or the person you care for becomes a choral — points you can save, trade, or spend on training.
      </p>

      <div className="mb-10 flex flex-wrap gap-4 items-center">
        <div className="border border-[#2a2a2a] bg-[#111111] p-5">
          <div className="font-mono text-[10px] text-[#a0a0a0] mb-1">BALANCE</div>
          <div className="text-3xl font-light text-[#ffb800]">1,204</div>
        </div>
        <div className="border border-[#2a2a2a] bg-[#111111] p-5">
          <div className="font-mono text-[10px] text-[#a0a0a0] mb-1">TIER</div>
          <div className="text-3xl font-light">GOLD</div>
        </div>
        <div className="border border-[#2a2a2a] bg-[#111111] p-5">
          <div className="font-mono text-[10px] text-[#a0a0a0] mb-1">NEXT TIER</div>
          <div className="text-3xl font-light">PLATINUM</div>
        </div>
      </div>

      <div className="space-y-3">
        {chorals.map((c) => (
          <div key={c.time} className="border border-[#2a2a2a] bg-[#111111] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">{c.from}</span>
                <span className="font-mono text-[10px] text-[#a0a0a0]">{c.role}</span>
                <span className="font-mono text-[10px] text-[#3a3a3a]">{c.time}</span>
              </div>
              <span className="font-mono text-xs text-[#ffb800]">+{c.points}</span>
            </div>
            <p className="text-sm text-[#a0a0a0]">&ldquo;{c.message}&rdquo;</p>
          </div>
        ))}
      </div>
    </main>
  );
}
