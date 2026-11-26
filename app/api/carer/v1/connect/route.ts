import { carerClaims, json, unauthorised } from "@/lib/carer/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/carer/v1/connect: a carer accepted an Aultrum Link this agency made for them (ref = the carer record). */
export async function POST(request: Request) {
  const claims = await carerClaims(request);
  if (!claims?.ref) return unauthorised();
  const carer = await prisma.carer.findFirst({ where: { id: claims.ref, agencyId: claims.org }, select: { id: true, aultrumSub: true, status: true } });
  if (!carer || carer.status === "INACTIVE") return json({ ok: false, error: "This agency no longer has you as a carer. Ask them for a new link." }, 422);
  if (carer.aultrumSub && carer.aultrumSub !== claims.sub) {
    return json({ ok: false, error: "Another Aultrum account is already connected to you at this agency. Ask them to disconnect it, then send a new link." }, 422);
  }
  await prisma.carer.update({ where: { id: carer.id }, data: { aultrumSub: claims.sub } });
  return json({ ok: true });
}
