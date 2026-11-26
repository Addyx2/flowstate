import { publicJwks } from "@/lib/aultrum-id";

export const dynamic = "force-dynamic";

// Flowstate's public key. Aultrum ID checks Flowstate's signed requests
// against it, so no secret is shared between them.
export async function GET() {
  return Response.json(await publicJwks(), { headers: { "Cache-Control": "public, max-age=300" } });
}
