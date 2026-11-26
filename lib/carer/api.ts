import { verifyCarerToken } from "@/lib/aultrum-id";
import { prisma } from "@/lib/db";

// Carer API v1: what the Aultrum carer app calls to show a carer their work
// at this agency. Every request carries a one-minute token Aultrum ID signed
// for the person (sub) and the agency (org).

export interface CarerRef {
  agencyId: string;
  carerId: string;
}

export async function carerClaims(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? verifyCarerToken(auth.slice(7)) : null;
}

export async function carerFromRequest(request: Request): Promise<CarerRef | null> {
  const claims = await carerClaims(request);
  if (!claims) return null;
  const carer = await prisma.carer.findFirst({ where: { aultrumSub: claims.sub, agencyId: claims.org, status: { not: "INACTIVE" } }, select: { id: true, agencyId: true } });
  return carer ? { agencyId: carer.agencyId, carerId: carer.id } : null;
}

const noStore = { "Cache-Control": "no-store" };
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore });
export const unauthorised = () => json({ error: "Not signed in to this organisation" }, 401);
