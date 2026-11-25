import { NextResponse } from "next/server";

/**
 * Twilio inbound call webhook.
 * Returns TwiML instructing Twilio to greet the caller and capture speech.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const callSid = String(formData.get("CallSid") || "");
  const from = String(formData.get("From") || "");
  const to = String(formData.get("To") || "");

  // Log the inbound call (async, non-blocking)
  try {
    await fetch(`${request.headers.get("origin")}/api/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callSid, from, to, status: "incoming" }),
    });
  } catch {
    // Best-effort logging
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-GB">Thank you for calling Flowstate. If this is an emergency, please hang up and call 999. Otherwise, I can take your enquiry or book a call-back. How can I help?</Say>
  <Gather input="speech" speechTimeout="auto" language="en-GB" action="/api/voice/handle">
    <Pause length="3"/>
  </Gather>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
