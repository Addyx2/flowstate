import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET /api/honor/profile?carerId=1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carerId = searchParams.get("carerId");

  if (!carerId) {
    return NextResponse.json({ ok: false, error: "carerId required" }, { status: 400 });
  }

  try {
    const profile = await sql`
      SELECT * FROM carer_profiles WHERE id = ${Number(carerId)} LIMIT 1
    `;
    const jobs = await sql`SELECT * FROM jobs WHERE carer_id = ${Number(carerId)} ORDER BY start_date DESC`;
    const references = await sql`SELECT * FROM references_x WHERE carer_id = ${Number(carerId)} AND verified = true`;
    return NextResponse.json({
      ok: true,
      profile: profile.rows[0] ?? null,
      jobs: jobs.rows,
      references: references.rows,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
