import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { MAX_HISTORY, runAssist } from "@/lib/assist";
import { getSessionUser } from "@/lib/auth";
import { isOfficeRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const body = z.object({
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) })).min(1).max(MAX_HISTORY),
});

/** POST /api/assist {history}: one turn with Assist. Changes come back as proposals to confirm. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isOfficeRole(user.role)) return Response.json({ error: "Sign in again" }, { status: 401 });
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.history.at(-1)?.role !== "user") return Response.json({ error: "Bad request" }, { status: 400 });
  try {
    return Response.json(await runAssist(user.agencyId, user.id, parsed.data.history));
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "Assist isn't set up yet: the Anthropic API key is missing or wrong." }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "Assist is busy. Try again in a minute." }, { status: 429 });
    if (error instanceof Anthropic.APIError) {
      console.error("assist api error", error.status, error.message);
      return Response.json({ error: "Assist couldn't answer just now. Try again." }, { status: 502 });
    }
    // Raised before any request when no credential is configured.
    if (error instanceof Anthropic.AnthropicError) return Response.json({ error: "Assist isn't set up yet: add ANTHROPIC_API_KEY to the deployment." }, { status: 503 });
    console.error("assist failed", error);
    return Response.json({ error: "Assist couldn't answer just now. Try again." }, { status: 500 });
  }
}
