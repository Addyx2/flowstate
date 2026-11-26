import { carerFromRequest, json, unauthorised } from "@/lib/carer/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/carer/v1/disconnect: the carer left this agency in the Aultrum app. */
export async function POST(request: Request) {
  const carer = await carerFromRequest(request);
  if (!carer) return unauthorised();
  await prisma.carer.update({ where: { id: carer.carerId }, data: { aultrumSub: null } });
  return json({ ok: true });
}
