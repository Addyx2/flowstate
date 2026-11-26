const TZ = "Europe/London";

export const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
export const fmtTime = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
export const fmtRange = (a: Date, b: Date) => `${fmtDay(a)} ${fmtTime(a)}–${fmtTime(b)}`;
export const hoursBetween = (a: Date, b: Date) => Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`.trim();

export function ago(d: Date, now = new Date()): string {
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return fmtDate(d);
}

/** Monday 00:00 (local server time) of the week containing d. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
