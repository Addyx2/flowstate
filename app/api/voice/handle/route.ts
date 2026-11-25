import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Handles captured speech from the caller.
 * Sends the transcript to Claude, gets a response, returns TwiML.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const speech = String(formData.get("SpeechResult") || "").trim();
  const callSid = String(formData.get("CallSid") || "");

  // No speech captured — prompt again
  if (!speech) {
    return twimlResponse(
      `<Say voice="alice" language="en-GB">I did not catch that. Please tell me how I can help.</Say>
       <Gather input="speech" speechTimeout="auto" language="en-GB" action="/api/voice/handle">
         <Pause length="3"/>
       </Gather>`
    );
  }

  // Phase 1 is non-regulated: no urgent or clinical triage. Route emergencies out.
  if (isUrgent(speech)) {
    return twimlResponse(
      `<Say voice="alice" language="en-GB">If this is an emergency, please hang up and call 999 now. For urgent medical advice, call NHS 111. I will also ask a member of the team to call you back.</Say>
       <Hangup/>`
    );
  }

  // If no Anthropic key, fall back to a canned response
  if (!process.env.ANTHROPIC_API_KEY) {
    return twimlResponse(
      `<Say voice="alice" language="en-GB">Thank you. I have noted that for the care team. Welcome to the Flowstate beta.</Say>
       <Hangup/>`
    );
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 300,
      system:
        "You are Flowstate, an AI contact-centre assistant for a care organisation. " +
        "You take general enquiries, capture messages, and book call-backs or consultations. " +
        "You do NOT give medical, clinical, medication, or care advice, and you do not assess care needs: " +
        "for anything health-related, say a member of the team will call back, and for emergencies tell the caller to call 999 or NHS 111. " +
        "Be warm, professional, concise. Keep your spoken reply under 2 sentences. Never invent personal data.",
      messages: [
        {
          role: "user",
          content: `The caller said: "${speech}". Respond as Flowstate.`,
        },
      ],
    });

    const text =
      msg.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim() || "Thank you, I have noted that.";

    // Escape text for TwiML
    const safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    return twimlResponse(
      `<Say voice="alice" language="en-GB">${safe}</Say>
       <Pause length="1"/>
       <Say voice="alice" language="en-GB">Is there anything else I can help with?</Say>
       <Gather input="speech" speechTimeout="auto" language="en-GB" action="/api/voice/handle">
         <Pause length="3"/>
       </Gather>`
    );
  } catch (err) {
    console.error("Claude error:", err);
    return twimlResponse(
      `<Say voice="alice" language="en-GB">I am having trouble connecting. A member of the care team will call you back shortly.</Say>
       <Hangup/>`
    );
  }
}

function twimlResponse(body: string) {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${body}</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

const URGENT_PATTERNS = [
  /emergenc/i, /\b999\b/, /ambulance/i, /can'?t breathe/i, /not breathing/i,
  /chest pain/i, /unconscious/i, /collapsed/i, /\bfallen\b|\bhad a fall\b/i,
  /bleeding/i, /overdose/i, /stroke/i, /seizure/i, /suicid/i, /\babuse\b/i,
];

function isUrgent(speech: string) {
  return URGENT_PATTERNS.some((re) => re.test(speech));
}
