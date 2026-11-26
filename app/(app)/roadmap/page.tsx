import { launchFunctions, regulatedFunctions } from "@/lib/features";

export const metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  const launch = launchFunctions();
  const regulated = regulatedFunctions();

  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="label-title text-[13px] text-accent mb-2">ROADMAP</p>
      <h1 className="font-serif text-[36px] mb-2">Launch first. Regulated later.</h1>
      <p className="text-muted mb-12 max-w-2xl">
        Flowstate launches with functions that need no CQC registration. Anything that
        delivers, directs, or records personal care is pushed forward to the regulated phase.
      </p>

      <section className="mb-12">
        <h2 className="text-[13px] text-ok mb-4">PHASE 1 — LIVE ({launch.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {launch.map((f) => (
            <div key={f.id} className="border border-line bg-card p-4 flex justify-between gap-4">
              <span>{f.name}</span>
              <span className="text-[13px] text-muted shrink-0">{f.module.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[13px] text-warn mb-4">
          PHASE 2 — CQC-REGULATED, PUSHED FORWARD ({regulated.length})
        </h2>
        <div className="space-y-3">
          {regulated.map((f) => (
            <div key={f.id} className="border border-dashed border-line p-4">
              <div className="flex justify-between gap-4 mb-1">
                <span>{f.name}</span>
                <span className="text-[13px] text-muted shrink-0">{f.module.toUpperCase()}</span>
              </div>
              <p className="text-sm text-muted">{f.reason}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-faint mt-6">
          NOT BUILT — UNLOCKS ONLY AFTER CQC REGISTRATION FOR THE RELEVANT REGULATED ACTIVITY
        </p>
      </section>
    </main>
  );
}
