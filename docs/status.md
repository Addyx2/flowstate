# Status

_Last updated: 26 Nov 2026 (Core built). Update this page at the end of every session._

## Built (in this repo)

Core (D18 step 1) is built and runs against Postgres with a demo seed.

| Area | Where | State |
|---|---|---|
| Foundation | `prisma/`, `lib/auth.ts`, `lib/audit.ts`, `middleware.ts` | **Done** — sessions, roles (Admin, Coordinator, Carer), lockout, audit log; ported from Pleasant |
| Sign-in with Aultrum ID | `lib/aultrum-id.ts`, `app/api/auth/aultrum/*`, `/.well-known/jwks.json` | **Built, not live** — Flowstate isn't registered as a product in Aultrum ID yet (`aid_flowstate`); password sign-in works meanwhile |
| Sidebar | `docs/spec/navigation.md`, `lib/navigation.ts` | **Done** — Flowstate / Persona / Elements lists, Account pinned |
| Directory | `/workforce/directory` | **Done** |
| Onboarding | `/workforce/onboarding` | **Done** — checks and training, ready-to-work gate |
| Teams (Packages) | `/workforce/teams`, `/workforce/teams/[id]` | **Done** — logistics only, team with Rapport, key persons, praise links, pairing feedback |
| Shifts | `/shifts/rotas`, `/open`, `/manage`, `/requests`; `lib/shifts.ts` | **Done** — generate weeks from rotas, explained suggestions, Compliance gate, clash checks |
| Watchboard | `/watchboard` | **Done** — today's visits, late/missed, open, requests, praise, Layer cards |
| Qualifiers | `/persona/qualifiers`, `lib/qualifiers.ts` | **Done** — Competence, Compliance, Shift Readiness, Rapport v0 (D17) |
| Links | `/account/links`, `/l/[token]`, `lib/links.ts` | **Done** — praise, shift request (agency answers), carer invite (needs Aultrum ID) |
| Carer API v1 | `app/api/carer/v1/*`, `lib/carer/*` | **Done** — matches the shared contract; live once Aultrum ID knows Flowstate |
| Assist | `/persona/assist`, `lib/assist.ts`, `app/api/assist` | **Done** — needs `ANTHROPIC_API_KEY`; proposals wait for confirmation |
| Pushbots, Associate | `/persona/*` | Placeholder (D18 step 3) |
| Office, Supply | `/office/*`, `/supply/*` | Placeholder (D18 step 2) |
| Elements | `/elements/*` | Marketing pages; not connected to Canvas yet |
| Honor, Roadmap | `app/honor/*`, `/roadmap` | Old mock-ups, not in the sidebar |
| Tests and CI | `lib/*.test.ts`, `.github/workflows/ci.yml` | 10 tests: checks, Rapport, readiness, the carer contract and a carer's day, Assist's loop |

## Next

1. **Register Flowstate in Aultrum ID** (`aid_flowstate`, `https://flowstate.aultrum.co.uk`) so sign-in, carer invites and the carer app work live. That's a change in the `aultrum-id` repo.
2. **Deploy**: Vercel project + Postgres; set `AUTH_SECRET`, `ANTHROPIC_API_KEY`; run migrations.
3. **Designs** (D11) refine the screens as they arrive in `docs/design/`.
4. **Office and Supply** (D18 step 2), then **Associate** and Pushbots (step 3).
5. Peak via Canvas in Elements and the carer app's Peak tab.

## Open questions

- Postcode lookups use postcodes.io (only the postcode is sent) for travel distance. OK to keep, or use another source?
- Praise text is shown to coordinators and the carer; Rapport uses only who, where and that it was given. Should families' praise be visible to the whole team?

- Persona: how watches notify (`spec/persona.md`).
- Links: v1 link kinds; can links be forwarded (`spec/links.md`).
- Account pinned under every list, or Flowstate list only (`spec/navigation.md`).

- Sidebar: two remaining questions in `spec/navigation.md` (which commissioner APIs Bid connects to first; keep/remove `/roadmap` and `/honor`).

- Honor (Live CV, chorals, multi-job): fold into Teammates Profile + Peak, or remove?
- Design deliverables still missing: tokens as JSON, component library, real
  screens, clickable prototypes. Wireframes still show expiring training on the
  Dashboard — align with v1 scope.

## Session log

| Date | Tool | Branch | Summary |
|---|---|---|---|
| 27 Aug – 1 Oct 2026 | — | `main` | Scaffold: Next.js app, voice webhook, Honor module, add-ons sidebar |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Built Core (D19): Prisma foundation, Workforce, Shifts, Watchboard + Qualifiers, Links, Carer API v1, Assist; tests and CI |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D18: build order (Core → Office + Supply → Associate); Admin → Office; Gateway via API only |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D17: all Rapport signals + travel distance in v1; Rapport v0 = explainable rules over recorded events |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D16: Rapport as pattern recognition; candidate signals and rules in `spec/persona.md` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D15: four Layers, per-user directives, `spec/links.md`; sidebar toggle Flowstate / Persona / Elements |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Persona section (D14): Assist, Pushbots, Qualifiers, Associate; Qualifier cards on Watchboard; `spec/persona.md` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Sidebar answers recorded (D13): Package = care receiver or care home; Elements (Gateway, Peak) and Account sections; add-ons moved to `/elements` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Sidebar structure (D12): spec, `lib/navigation.ts`, placeholders; Dashboard → Watchboard |
| 25 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Recorded D10 (shared carer app) and D11 (design first); added `docs/design/` intake. Earlier: removed CQC claims; added `lib/features.ts` + `/roadmap`; voice agent 999/111 routing; created `AGENTS.md` and `docs/` |
