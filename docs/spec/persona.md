# Spec — Persona (Flowstate's AI functions)

_Source: 26 Nov 2026 (D14–D17)._

Persona has its own list in the sidebar, side by side with Flowstate and
Elements (see `spec/navigation.md`).

**Persona** is the home of every AI function in Flowstate. It has four parts.

| Part | Route | What it does |
|---|---|---|
| **Assist** | `/persona/assist` | AI assistant for coordinators. Answers questions from live data and does work through the app's own actions (fill a shift, approve a request, raise an invoice), with the coordinator confirming every change |
| **Pushbots** | `/persona/pushbots` | The agency's own number that carers and office staff text. Carers see shifts, take offers, report sickness; office staff give it jobs that wait for a YES code |
| **Qualifiers** | `/persona/qualifiers` | The Aultrum Layers in full: each layer's score, what it flagged and why, for every carer and Package |
| **Associate** | `/persona/associate` | Standing AI work: **routines** (scheduled jobs, e.g. a morning briefing), **directives** (instructions each user saves for the AI — rules to follow or things to watch for), and **qualifying** Packages or workforces (run the Qualifiers on a Package, a carer or the whole workforce) |

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

**The four layers (v1):**

| Layer | Measures | Flags, for example |
|---|---|---|
| **Competence** | Skills fit between a carer and a Package's logistics and role | A carer booked on a role they have no training record for |
| **Compliance** | Worker checks: DBS, right to work, training expiry. A gate — one failed check rules a booking out | An expired DBS on a carer booked next week |
| **Shift Readiness** | Fatigue and capacity: overlapping shifts, long runs, working-time limits, travel between visits | A carer on a 13-hour day with no break |
| **Rapport** | The bond between a carer and a Package, found by **pattern recognition** across many signals (see below). Praise is one of them | A Package that sees a new carer every week; a carer who keeps asking to leave one Package |

## Rapport — pattern recognition

Rapport qualifies care **socio-technically**: it learns from patterns in how
people work together, not from one score. Praise is one signal among many.

**Signals — all in v1** (D17):

| Signal | From |
|---|---|
| Praise for a carer on a Package (families, teammates, coordinators) | Peak, praise Links |
| Continuity: how often the same carers return to a Package | Shifts |
| Punctuality and attendance on that Package | Shifts / visit check-in |
| Requests to leave, swap off or avoid a Package | Shifts → Request |
| How quickly carers accept offers for that Package | Pushbots, offers |
| Coordinator feedback on a pairing | Flowstate |
| Complaints or changes of carer asked for | Flowstate |
| Travel distance between the carer and the Package | Directory / Packages (postcodes) |

**Rules for Rapport**
1. **Signals describe the relationship and the work, never the care
   receiver's health.** Text such as praise is read only for who it praises and
   whether it is positive; health details in it are not stored or used.
2. **Explain every pattern.** "Rapport between Sarah and Package 12 is rising:
   4 praises in 3 weeks, every visit on time, no swap requests."
3. **A pattern is a prompt for a human, never a verdict.** Coordinators review;
   no automatic removal of a carer from a Package on Rapport alone.
4. **No rankings or leaderboards** of carers (Peak fairness rules).
5. **Patterns sharpen over time** as outcomes are recorded (e.g. a pairing that
   lasted vs one that broke down), with human review of what the AI learns.

**How v1 does it (move fast).** Every signal except praise is a by-product of
running shifts, so v1 adds no data entry. v1:
- records each signal as a dated **event** from day one (the data is the asset);
- scores Rapport with **simple, explainable rules** ("Rapport v0") — e.g.
  continuity, on-time rate, praise count, swap-off requests, distance;
- shows the reasons, never a bare number.
The research on what makes good rapport runs alongside and improves the rules
later; it doesn't block v1. Rule versions are named so results can be compared.

## Directives

Directives belong to **each user's account** (each email address saves its
own). Two kinds:
- **Rules** the AI follows when it acts for that user, e.g. "offer shifts to the
  Package's own team first".
- **Watches** that notify the user when something becomes true, e.g. "Let me know
  when Sarah and Mark have a better rapport".

A directive can only narrow what the AI does or ask to be told something; it
never grants new permissions.

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

1. How should a watch notify — in Flowstate only, email, or text?
