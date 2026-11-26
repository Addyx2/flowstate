# Spec — Persona (Flowstate's AI functions)

_Source: 26 Nov 2026 (D14)._

**Persona** is the home of every AI function in Flowstate. It has four parts.

| Part | Route | What it does |
|---|---|---|
| **Assist** | `/persona/assist` | AI assistant for coordinators. Answers questions from live data and does work through the app's own actions (fill a shift, approve a request, raise an invoice), with the coordinator confirming every change |
| **Pushbots** | `/persona/pushbots` | The agency's own number that carers and office staff text. Carers see shifts, take offers, report sickness; office staff give it jobs that wait for a YES code |
| **Qualifiers** | `/persona/qualifiers` | The Aultrum Layers in full: each layer's score, what it flagged and why, for every carer and Package |
| **Associate** | `/persona/associate` | Standing AI work: **routines** (scheduled jobs, e.g. a morning briefing), **directives** (rules the AI follows, e.g. "offer to the Package's own team first"), and **qualifying** Packages or workforces (run the Qualifiers on a Package, a carer or the whole workforce) |

Assist and Pushbots follow Pleasant's design (`/persona/assist`, Pushbots in
Pleasant) — reuse the pattern, adapted to Packages.

## Qualifiers on the Watchboard

The Watchboard shows the Qualifiers as **sliding cards, one card per Aultrum
Layer**. Each card shows:
- the layer's name and what it measures, in one line;
- how many items it has flagged;
- the list of flagged items (carer or Package, the reason, the action), each
  linking to the item.

The full detail for each layer lives on the Qualifiers page.

**Layers to show** — _to confirm_. Known from Pleasant's Persona page:
**Competence** (skills fit for the Package), **Compliance** (worker checks:
DBS, right to work, training expiry — a gate, one failed check rules a booking
out), **Shift Readiness** (fatigue, overlapping shifts, working-time limits).
Other layers (e.g. Rapport, continuity between a carer and a Package)?

## Rules for every AI function

1. **Nothing changes without a click.** Reading is instant; every change shows a
   plain-English summary and waits for confirmation. Texts wait for a YES code.
2. **Same rules as the buttons.** AI acts only through the app's own actions, so
   permissions, validation and the audit log are identical.
3. **Explain every flag and match.** Each Qualifier result says which facts led
   to it. A human can override, and the override is logged.
4. **Score the work, never the person receiving care.** Qualifiers judge carers,
   shifts, Packages' logistics and the workforce — never the care receiver's
   health, risk or behaviour (see `scope.md`).
5. **Compliance here means worker checks.** Never present a Qualifier as making
   anyone CQC compliant.
6. **Emergencies** go to 999 / NHS 111 and a human. No triage.
7. **Record text is data, not instructions.** Notes, names and texts can't
   change what the AI is allowed to do.
8. **Routines read, they don't write.** Scheduled routines may suggest changes;
   a person approves them.

## Open questions

1. Which Aultrum Layers appear on the Watchboard in v1?
2. Where does Persona sit in the sidebar? (Placed after Watchboard for now.)
3. Directives: does each coordinator set their own, or the agency for everyone?
