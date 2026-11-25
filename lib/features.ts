/**
 * Flowstate function registry — launch scope vs. CQC-regulated (deferred).
 *
 * Flowstate launches with NON-REGULATED functions only: tools for carers,
 * recognition, careers, contact-centre admin. Nothing at launch delivers,
 * directs, or records personal care or treatment.
 *
 * Functions that would make Flowstate (or its operator) carry out a CQC
 * regulated activity — e.g. personal care, treatment, medication — are pushed
 * forward to the "regulated" phase. They are listed here so the roadmap is
 * explicit, but they are NOT built and must not be shipped until the
 * operator is CQC-registered for the relevant activity.
 */

export type Phase = "launch" | "regulated";

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
  { id: "ops-dashboard", name: "Operations dashboard (calls, enquiries, recognition)", module: "Teams", phase: "launch" },

  // ── Pushed forward: CQC-regulated ────────────────────────────────────
  { id: "care-plans", name: "Care plans & needs assessments", module: "Teams", phase: "regulated", reason: "Assessing and planning personal care is part of the regulated activity." },
  { id: "visit-scheduling", name: "Care visit scheduling & task lists", module: "Teams", phase: "regulated", reason: "Directing carers to deliver personal care tasks." },
  { id: "care-notes", name: "Daily care notes / AI care documentation", module: "Teams", phase: "regulated", reason: "Care records of a regulated provider." },
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
