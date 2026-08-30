import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET /api/honor/chorals?carerId=1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carerId = searchParams.get("carerId");

  try {
    const { rows } = carerId
      ? await sql`SELECT * FROM chorals WHERE carer_id = ${Number(carerId)} ORDER BY created_at DESC LIMIT 50`
      : await sql`SELECT * FROM chorals ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ ok: true, chorals: rows });
  } catch (err) {
    // Table may not exist yet
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// POST /api/honor/chorals  { carerId, fromPersonId, points, message, channel }
export async function POST(request: Request) {
  const body = await request.json();
  const { carerId, fromPersonId, points = 1, message = "", channel = "manager" } = body;

  if (!carerId || !fromPersonId) {
    return NextResponse.json({ ok: false, error: "carerId and fromPersonId required" }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      INSERT INTO chorals (carer_id, from_person_id, points, message, channel)
      VALUES (${Number(carerId)}, ${Number(fromPersonId)}, ${Number(points)}, ${message}, ${channel})
      RETURNING *
    `;
    return NextResponse.json({ ok: true, choral: rows[0] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
