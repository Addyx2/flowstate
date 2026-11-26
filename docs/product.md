# Flowstate — product

## One line

**Flowstate runs your carers and your rotas. Keep your care-records system for
care notes.** Rota and carer coordination for home-care (domiciliary) providers.
It sits beside the provider's care-records system, not against it.

Flowstate is a **prototype**: keep it simple and explainable.

## Who uses it

| Who | What they get |
|---|---|
| **Coordinators** (agency office) | Flowstate list (Workforce, Shifts, Supply, Watchboard, Office), Persona, Elements, Account — see `spec/navigation.md` |
| **Carers** | The shared **Aultrum carer app**, also used by Pleasant carers. Flowstate feeds it through Carer API v1 (D10) |
| **Key persons** (family) | A praise link (`spec/links.md`). No account in v1 |
| **Care receivers** | Nothing in v1 |

Everyone signs in with **Aultrum ID**. Menus are assembled by role.

## Core objects

- **Directory** — one table of people with roles: carer, care receiver,
  coordinator, key person.
- **Package** — a **care receiver or a care home** (D13), with its care team
  (Teams): coordinator, carers, key persons, and **logistics only** (address,
  visit times, access instructions, funding body for invoicing). It is the
  shared object coordinators and carers see. It never holds care plans, needs or
  conditions.
- **Shifts / rota** — visits and shifts tied to packages; open shifts; carer
  availability.
- **Peak** — recognition and rewards, run by Canvas (see `ecosystem.md`).
  Fairness rules: authorised absence pauses streaks, agency cancellations never
  count against carers, no leaderboards, balances never shown to coordinators.

## Design principles

- Built for a carer confident on WhatsApp, possibly with English as an
  additional language, with three minutes in a car between visits.
- Plain verbs, sentence case, short sentences, no idioms. Errors say what
  happened and what to do.
- Nothing sensitive in notifications. Access ends the moment a carer leaves a
  package. Sensitive views are audit-logged. Carers can download their data.
- "View as teammate" for coordinators, logged.
- Design system "Obsidian Precision": `#070708` background, `#4a9eff` accent,
  JetBrains Mono for labels. Tokens to ship as JSON so a native app can reuse them.

## Roadmap

| Stage | Adds |
|---|---|
| **v1** | Coordinator web app + Carer API v1 for the Aultrum carer app |
| v1.5 | Teams: coordinator–team messages, handover notes (logistics only); claiming open shifts with Early Rota priority; web push |
| v2 | Offline support; visit check-in/out |
| Later | Care notes — out of scope until CQC record-keeping is scoped (see `scope.md`) |

v1 is **coordination only**: no compliance layer.

## Not in Flowstate

- Running a staffing agency (supplying workers to others) — that is **Pleasant**.
  Flowstate's Supply *requests* workers; Office has Payroll, Invoice and Bid (D18).
- Gateway and Peak themselves — they run on Canvas; Flowstate shows them as
  Elements add-ons (D13).
- Care notes, care plans, eMAR, clinical triage — see `scope.md`.
