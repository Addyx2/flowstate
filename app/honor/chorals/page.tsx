export default function HonorChorals() {
  const chorals = [
    { from: "Sarah M.", role: "Care Manager", message: "Thank you for covering the night shift at short notice. You're a lifesaver.", points: 25, time: "2h ago" },
    { from: "Mrs. Adeyemi", role: "Care Receiver", message: "You always make me feel so safe. Thank you for everything.", points: 50, time: "Yesterday" },
    { from: "Daniel R.", role: "Care Manager", message: "Thanks for mentoring the new starters this month. They all asked for you.", points: 40, time: "2 days ago" },
  ];

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="label-title text-[13px] text-warn mb-2">HONOR // CHORALS</p>
      <h1 className="font-serif text-[34px] mb-2">Recognition, converted.</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Every applause from a manager or the person you care for becomes a choral — points you can save, trade, or spend on training.
      </p>

      <div className="mb-10 flex flex-wrap gap-4 items-center">
        <div className="border border-line bg-card p-5">
          <div className="text-[13px] text-muted mb-1">BALANCE</div>
          <div className="font-serif text-[34px] text-warn">1,204</div>
        </div>
        <div className="border border-line bg-card p-5">
          <div className="text-[13px] text-muted mb-1">TIER</div>
          <div className="font-serif text-[34px]">GOLD</div>
        </div>
        <div className="border border-line bg-card p-5">
          <div className="text-[13px] text-muted mb-1">NEXT TIER</div>
          <div className="font-serif text-[34px]">PLATINUM</div>
        </div>
      </div>

      <div className="space-y-3">
        {chorals.map((c) => (
          <div key={c.time} className="border border-line bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">{c.from}</span>
                <span className="text-[13px] text-muted">{c.role}</span>
                <span className="text-[13px] text-faint">{c.time}</span>
              </div>
              <span className="text-[13px] text-warn">+{c.points}</span>
            </div>
            <p className="text-sm text-muted">&ldquo;{c.message}&rdquo;</p>
          </div>
        ))}
      </div>
    </main>
  );
}
