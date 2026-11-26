import { revalidatePath } from "next/cache";

import { carerFromRequest, json, unauthorised } from "@/lib/carer/api";
import { doAction } from "@/lib/carer/work";

export const dynamic = "force-dynamic";

/** POST /api/carer/v1/actions with {action, ...}: something the carer did in the Aultrum carer app. */
export async function POST(request: Request) {
  const carer = await carerFromRequest(request);
  if (!carer) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") return json({ ok: false, error: "Body must be JSON with an action" }, 400);
  const result = await doAction(carer, body);
  for (const p of ["/watchboard", "/shifts/manage", "/shifts/requests", "/shifts/open"]) revalidatePath(p);
  return json(result, result.ok ? 200 : 422);
}
