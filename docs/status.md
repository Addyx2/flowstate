# Status

_Last updated: 26 Nov 2026. Update this page at the end of every session._

## Built (in this repo)

Everything below is a **UI mock-up with hardcoded sample data** unless marked.

| Area | Path | State |
|---|---|---|
| Home (module links) | `app/page.tsx` | Mock |
| Sidebar (D12) | `docs/spec/navigation.md`, `lib/navigation.ts`, `components/AppSidebar.tsx` | **Done** — Workforce, Shifts, Supply, three toggleable lists — Flowstate, Persona, Elements — with Account pinned (D12–D15). Unbuilt pages are a "Not built yet" placeholder (`app/(app)/[...slug]`). `/dashboard` redirects to `/watchboard` |
| Honor: home, Live CV, Chorals, My Jobs | `app/honor/*` | Mock (one sample carer). **Not in brief v1.3** — see open questions |
| Elements: Gateway, Peak, hub | `app/(app)/elements/*` | Marketing copy only; no Canvas connection. `/addons` redirects to `/elements` |
| Roadmap | `app/(app)/roadmap/page.tsx`, `lib/features.ts` | Renders launch vs out-of-scope functions |
| Voice webhook | `app/api/voice/*` | **Works** with Twilio + Anthropic keys; emergency keywords route to 999/111. Uses an old model id (`claude-3-5-sonnet-latest`). Superseded by Gateway on Canvas (D8) |
| Honor APIs | `app/api/honor/*` | Written against Postgres; tables never created; unused by UI |
| Call log | `app/api/calls`, `lib/db.ts` | `/api/calls` discards data; `logCall` never called |
| Schema | `db/schema.sql` | Draft; not applied. Doesn't yet have Directory/Package per brief |

Not built: Aultrum ID sign-in, Directory, Package, Shifts/rota, Carer API v1,
Peak via Canvas, praise link, database, tests, CI.

## Next

**Waiting on design work** (D11): wireframes → concept theory →
software references → Paper designs, into `docs/design/`. Then:

1. Function map `docs/spec/functions.md`: every Pleasant function marked
   Keep / Change / Drop / New for Flowstate.
2. One spec per function in `docs/spec/`, from the designs.
3. Build: Pleasant's foundation (Prisma/Postgres, sessions, roles, audit log,
   Aultrum ID sign-in), the coordinator screens, and Carer API v1 for the
   Aultrum carer app (D10). Register Flowstate with Aultrum ID.

## Open questions

- Persona: which Rapport signals are in v1; how watches notify (`spec/persona.md`).
- Links: v1 link kinds; can links be forwarded (`spec/links.md`).
- Account pinned under every list, or Flowstate list only (`spec/navigation.md`).

- Sidebar: two remaining questions in `spec/navigation.md` (which commissioner APIs Bid connects to first; keep/remove `/roadmap` and `/honor`).

- Copy Pleasant's code and adapt it, or rebuild fresh to the brief?
- Honor (Live CV, chorals, multi-job): fold into Teammates Profile + Peak, or remove?
- Design deliverables still missing: tokens as JSON, component library, real
  screens, clickable prototypes. Wireframes still show expiring training on the
  Dashboard — align with v1 scope.

## Session log

| Date | Tool | Branch | Summary |
|---|---|---|---|
| 27 Aug – 1 Oct 2026 | — | `main` | Scaffold: Next.js app, voice webhook, Honor module, add-ons sidebar |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D16: Rapport as pattern recognition; candidate signals and rules in `spec/persona.md` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | D15: four Layers, per-user directives, `spec/links.md`; sidebar toggle Flowstate / Persona / Elements |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Persona section (D14): Assist, Pushbots, Qualifiers, Associate; Qualifier cards on Watchboard; `spec/persona.md` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Sidebar answers recorded (D13): Package = care receiver or care home; Elements (Gateway, Peak) and Account sections; add-ons moved to `/elements` |
| 26 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Sidebar structure (D12): spec, `lib/navigation.ts`, placeholders; Dashboard → Watchboard |
| 25 Nov 2026 | Claude Code (cloud) | `claude/flowstate-no-cqc-w3j841` | Recorded D10 (shared carer app) and D11 (design first); added `docs/design/` intake. Earlier: removed CQC claims; added `lib/features.ts` + `/roadmap`; voice agent 999/111 routing; created `AGENTS.md` and `docs/` |
