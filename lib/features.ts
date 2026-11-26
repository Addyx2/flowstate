/**
 * Flowstate function registry — launch scope vs. CQC-regulated (deferred).
 *
 * The line is whether a function holds a person's care record (docs/scope.md).
 * Coordination (shifts, rota, package logistics, directory, Peak) is in scope.
 * Functions that hold care records are listed under "regulated" so the line is
 * explicit; they are NOT built and stay in the provider's care-records system.
 */

export type Phase = "launch" | "regulated"; // "regulated" = outside Flowstate: holds care records

export interface FlowstateFunction {
  id: string;
  name: string;
  module: "Teams" | "Honor" | "Gateway" | "Peak" | "Tender" | "Drive";
  phase: Phase;
  /** For regulated functions: why they are deferred. */
  reason?: string;
}

export const FUNCTIONS: FlowstateFunction[] = [
  // ── Launch: non-regulated ────────────────────────────────────────────
  { id: "live-cv", name: "Live CV & qualifications", module: "Honor", phase: "launch" },
  { id: "references", name: "Verified references", module: "Honor", phase: "launch" },
  { id: "chorals", name: "Chorals (recognition → points)", module: "Honor", phase: "launch" },
  { id: "tiers", name: "Tiers (Silver → Platinum)", module: "Honor", phase: "launch" },
  { id: "multi-job", name: "Multi-job management", module: "Honor", phase: "launch" },
  { id: "training", name: "Training marketplace", module: "Honor", phase: "launch" },
  { id: "gateway-calls", name: "Inbound call answering & enquiry capture", module: "Gateway", phase: "launch" },
  { id: "gateway-booking", name: "Consultation / call-back booking", module: "Gateway", phase: "launch" },
  { id: "peak-points", name: "Points ledger & perks", module: "Peak", phase: "launch" },
  { id: "shifts-rota", name: "Shifts & rota (visit times, carers)", module: "Teams", phase: "launch" },
  { id: "package-logistics", name: "Package — care team & logistics (address, visit times, access)", module: "Teams", phase: "launch" },
  { id: "visit-check-in", name: "Visit check-in/out (call monitoring, v2)", module: "Teams", phase: "launch" },
  { id: "ops-dashboard", name: "Operations dashboard (calls, enquiries, recognition)", module: "Teams", phase: "launch" },

  // ── Pushed forward: CQC-regulated ────────────────────────────────────
  { id: "care-plans", name: "Care plans, needs & conditions in a Package", module: "Teams", phase: "regulated", reason: "A person's care record. Package holds logistics only." },
  { id: "care-notes", name: "Daily care notes / AI care documentation", module: "Teams", phase: "regulated", reason: "The line: care records stay in the provider's care-records system." },
  { id: "handover-condition", name: "Handover notes about how someone is (meds, falls, mood)", module: "Teams", phase: "regulated", reason: "Becomes a care record. Logistics messages are fine (v1.5)." },
  { id: "emar", name: "Medication administration records (eMAR)", module: "Teams", phase: "regulated", reason: "Medication support within personal care." },
  { id: "clinical-triage", name: "Urgent / clinical triage by the voice agent", module: "Gateway", phase: "regulated", reason: "Advice on health or care needs — callers are routed to 999 / NHS 111 instead." },
  { id: "safeguarding", name: "Incident & safeguarding reporting", module: "Teams", phase: "regulated", reason: "Regulated providers' statutory notifications." },
  { id: "cqc-readiness", name: "CQC readiness & inspection evidence", module: "Teams", phase: "regulated", reason: "Only meaningful once registered." },
  { id: "client-records", name: "Care-receiver health records", module: "Teams", phase: "regulated", reason: "Health and care data held as a provider." },
];

export const launchFunctions = () => FUNCTIONS.filter((f) => f.phase === "launch");
export const regulatedFunctions = () => FUNCTIONS.filter((f) => f.phase === "regulated");

export function isLive(id: string): boolean {
  return FUNCTIONS.find((f) => f.id === id)?.phase === "launch";
}
