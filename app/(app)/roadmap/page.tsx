import { launchFunctions, regulatedFunctions } from "@/lib/features";

export const metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  const launch = launchFunctions();
  const regulated = regulatedFunctions();

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">ROADMAP</p>
      <h1 className="text-3xl md:text-4xl font-light mb-2">Launch first. Regulated later.</h1>
      <p className="text-[#a0a0a0] mb-12 max-w-2xl">
        Flowstate launches with functions that need no CQC registration. Anything that
        delivers, directs, or records personal care is pushed forward to the regulated phase.
      </p>

      <section className="mb-12">
        <h2 className="font-mono text-xs text-[#00e676] mb-4">PHASE 1 — LIVE ({launch.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {launch.map((f) => (
            <div key={f.id} className="border border-[#2a2a2a] bg-[#111111] p-4 flex justify-between gap-4">
              <span>{f.name}</span>
              <span className="font-mono text-[10px] text-[#a0a0a0] shrink-0">{f.module.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xs text-[#ffb800] mb-4">
          PHASE 2 — CQC-REGULATED, PUSHED FORWARD ({regulated.length})
        </h2>
        <div className="space-y-3">
          {regulated.map((f) => (
            <div key={f.id} className="border border-dashed border-[#2a2a2a] p-4">
              <div className="flex justify-between gap-4 mb-1">
                <span>{f.name}</span>
                <span className="font-mono text-[10px] text-[#a0a0a0] shrink-0">{f.module.toUpperCase()}</span>
              </div>
              <p className="text-sm text-[#a0a0a0]">{f.reason}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[10px] text-[#5a5a5a] mt-6">
          NOT BUILT — UNLOCKS ONLY AFTER CQC REGISTRATION FOR THE RELEVANT REGULATED ACTIVITY
        </p>
      </section>
    </main>
  );
}
