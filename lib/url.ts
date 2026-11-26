import { headers } from "next/headers";

export function defaultOrigin(): string {
  return process.env.NODE_ENV === "production" ? "https://flowstate.aultrum.co.uk" : "http://localhost:3000";
}

/** Absolute URL for links that leave the app: APP_URL, else the request's host, else the default. */
export async function absoluteUrl(path: string): Promise<string> {
  const configured = process.env.APP_URL?.replace(/\/+$/, "");
  if (configured) return `${configured}${path}`;
  let h: Awaited<ReturnType<typeof headers>> | null = null;
  try {
    h = await headers();
  } catch {
    h = null;
  }
  const host = h?.get("x-forwarded-host") ?? h?.get("host");
  if (!host) return `${defaultOrigin()}${path}`;
  const proto = h?.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}${path}`;
}

/** Only same-origin paths after sign-in. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/[\u0000-\u001f]/.test(next)) return null;
  return next;
}
