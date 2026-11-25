/**
 * Compliance frameworks — OPTIONAL.
 *
 * Flowstate's core is regulator-agnostic: no module, route, or table depends on
 * any specific regulator (CQC or otherwise). A deployment runs with no framework
 * by default and simply keeps a generic audit trail.
 *
 * An organisation that *wants* regulator-specific labelling or reporting can
 * opt in by setting FLOWSTATE_COMPLIANCE_FRAMEWORK (or, per organisation, the
 * `organisations.compliance_framework` column). Nothing else changes.
 */

export type FrameworkId = "none" | "cqc" | "care-inspectorate" | "ciw" | "rqia";

export interface Framework {
  id: FrameworkId;
  /** Short label used in UI, e.g. "CQC". Empty for the default. */
  short: string;
  name: string;
  region: string;
}

export const FRAMEWORKS: Record<FrameworkId, Framework> = {
  none: { id: "none", short: "", name: "No regulator", region: "Any" },
  cqc: { id: "cqc", short: "CQC", name: "Care Quality Commission", region: "England" },
  "care-inspectorate": { id: "care-inspectorate", short: "CI", name: "Care Inspectorate", region: "Scotland" },
  ciw: { id: "ciw", short: "CIW", name: "Care Inspectorate Wales", region: "Wales" },
  rqia: { id: "rqia", short: "RQIA", name: "Regulation and Quality Improvement Authority", region: "Northern Ireland" },
};

export const DEFAULT_FRAMEWORK: FrameworkId = "none";

function isFrameworkId(v: string | null | undefined): v is FrameworkId {
  return !!v && Object.prototype.hasOwnProperty.call(FRAMEWORKS, v);
}

/** Resolve the framework for an org override, else the deployment env, else none. */
export function resolveFramework(orgOverride?: string | null): Framework {
  const candidate = orgOverride ?? process.env.FLOWSTATE_COMPLIANCE_FRAMEWORK;
  return FRAMEWORKS[isFrameworkId(candidate) ? candidate : DEFAULT_FRAMEWORK];
}

/** Dashboard label for audit/readiness — "AUDIT READY" unless a framework is opted into. */
export function readinessLabel(framework: Framework = resolveFramework()): string {
  return framework.short ? `${framework.short} READY` : "AUDIT READY";
}
