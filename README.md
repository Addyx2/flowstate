# Flowstate (product)

AI-native social care product. Separated from the marketing site.

- **Host:** Vercel
- **Domain:** flowstate.aultrum.co.uk
- **Stack:** Next.js (App Router) · TypeScript · Tailwind v4 · Vercel Postgres
- **AI:** Claude (Anthropic) · ElevenLabs · Twilio

## Structure

```
app/
  page.tsx            → product home
  dashboard/          → operations command center
  api/
    health/           → health check
    voice/incoming    → Twilio inbound webhook
    voice/handle      → speech → Claude → TwiML
    calls/            → call log persistence
lib/db.ts             → Vercel Postgres helpers
```

## Local dev

1. `cp .env.example .env` and fill in keys
2. `npm install`
3. `npm run dev`

## Regulation

Flowstate has no CQC dependency. It runs regulator-agnostic by default;
set `FLOWSTATE_COMPLIANCE_FRAMEWORK` (`cqc`, `care-inspectorate`, `ciw`, `rqia`)
only if an organisation wants regulator-specific labelling. See
`docs/architecture.md`.

## Telephony webhook (Twilio)

Point your Twilio number's "A CALL COMES IN" webhook to:
`https://flowstate.aultrum.co.uk/api/voice/incoming`

The voice pipeline: inbound call → greeting → capture speech → Claude response → TwiML.

## Database

Create the `calls` table via the Vercel Postgres SQL editor (see `lib/db.ts`).
