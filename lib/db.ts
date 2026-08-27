import { sql } from "@vercel/postgres";

/**
 * Database access helpers using Vercel Postgres.
 *
 * First deployment: create the table once via a script or the Vercel Postgres
 * dashboard SQL editor:
 *
 *   CREATE TABLE IF NOT EXISTS calls (
 *     id SERIAL PRIMARY KEY,
 *     call_sid TEXT UNIQUE,
 *     phone_from TEXT,
 *     phone_to TEXT,
 *     status TEXT,
 *     transcript TEXT,
 *     created_at TIMESTAMPTZ DEFAULT now()
 *   );
 */
export async function logCall(data: {
  callSid: string;
  from?: string;
  to?: string;
  status?: string;
  transcript?: string;
}) {
  try {
    await sql`
      INSERT INTO calls (call_sid, phone_from, phone_to, status, transcript)
      VALUES (${data.callSid}, ${data.from ?? null}, ${data.to ?? null}, ${data.status ?? null}, ${data.transcript ?? null})
      ON CONFLICT (call_sid) DO UPDATE SET
        status = EXCLUDED.status,
        transcript = EXCLUDED.transcript
    `;
    return { ok: true };
  } catch (err) {
    // If the table doesn't exist yet, don't crash the request.
    console.error("logCall error:", err);
    return { ok: false, error: String(err) };
  }
}

export async function getCalls(limit = 50) {
  try {
    const { rows } = await sql`
      SELECT * FROM calls ORDER BY created_at DESC LIMIT ${limit}
    `;
    return rows;
  } catch (err) {
    console.error("getCalls error:", err);
    return [];
  }
}
