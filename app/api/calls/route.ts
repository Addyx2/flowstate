import { NextResponse } from "next/server";

/**
 * Log a call object (best-effort persistence until Postgres is wired).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ ok: true, received: body });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
