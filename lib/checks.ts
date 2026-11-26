export type ExpiryState = "EXPIRED" | "DUE_SOON" | "OK" | "MISSING";

export const DUE_SOON_DAYS = 60;

export function daysUntil(date: Date, now: Date = new Date()): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.ceil((start(date) - start(now)) / 86_400_000);
}

/** A check with no expiry date is OK once it exists. */
export function expiryState(check: { expiresAt: Date | null } | null | undefined, now: Date = new Date()): ExpiryState {
  if (!check) return "MISSING";
  if (!check.expiresAt) return "OK";
  const days = daysUntil(check.expiresAt, now);
  if (days < 0) return "EXPIRED";
  if (days <= DUE_SOON_DAYS) return "DUE_SOON";
  return "OK";
}

/** The statutory checks every carer needs before working. */
export const STATUTORY = [
  { kind: "DBS", label: "Enhanced DBS" },
  { kind: "RIGHT_TO_WORK", label: "Right to work" },
] as const;

export const STATE_TONE = { OK: "ok", DUE_SOON: "warn", EXPIRED: "bad", MISSING: "bad" } as const;
export const STATE_LABEL = { OK: "OK", DUE_SOON: "DUE SOON", EXPIRED: "EXPIRED", MISSING: "MISSING" } as const;
