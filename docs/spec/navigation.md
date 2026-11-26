# Spec — coordinator sidebar

_Source: 26 Nov 2026 (D12–D18). Code: `lib/navigation.ts` renders this; if
they differ, this file wins._

Carers don't see this: they use the Aultrum carer app (D10).

## Three lists, side by side

A toggle at the top of the sidebar switches between three lists:
**Flowstate · Persona · Elements**. The sidebar opens on the list the current
page belongs to, otherwise the last one used. **Account** is pinned at the
bottom under every list.

### Flowstate

| Section | Item | Route | Purpose |
|---|---|---|---|
| **Workforce** | Onboarding | `/workforce/onboarding` | Bring new carers in: application → checks (right to work, DBS, references, training) → ready to work. _Wording not yet confirmed_ |
| | Directory | `/workforce/directory` | Everyone: carers, care receivers, coordinators, key persons. _Wording not yet confirmed_ |
| | Teams | `/workforce/teams` | The care team around each **Package**. A Package is a care receiver **or** a care home |
| **Shifts** | Rotas | `/shifts/rotas` | The weekly rota and repeating patterns. _Wording not yet confirmed_ |
| | Open | `/shifts/open` | Shifts nobody is booked on yet. _Wording not yet confirmed_ |
| | Manage | `/shifts/manage` | All shifts: create, change, cancel. _Wording not yet confirmed_ |
| | Request | `/shifts/requests` | Requests from carers: shifts they want, swaps, time off |
| **Supply** | Request | `/supply/request` | Request workforce from agencies on **Pleasant** (Supply API) and from the provider's own **Preferred Supply List** |
| | Manage | `/supply/manage` | Requests made, agency workers booked, their timesheets |
| **Watchboard** | — | `/watchboard` | The important parts of every feature in one view, including the **Qualifiers as sliding cards** (`spec/persona.md`) |
| **Office** | Payroll | `/office/payroll` | Pay the agency's own carers |
| | Invoice | `/office/invoices` | **Two directions:** (1) invoices *from* supply agencies; (2) invoices *to* councils and clients, generated from Packages |
| | Bid | `/office/bids` | Bid for hospital-discharge packages. Connects to commissioners' systems and shows **what's attainable** with the agency's carers, area and hours |

### Persona — the AI functions (`spec/persona.md`)

| Item | Route | Purpose |
|---|---|---|
| Assist | `/persona/assist` | AI assistant that answers and does work, with confirmation |
| Pushbots | `/persona/pushbots` | The agency's texting bot for carers and office staff |
| Qualifiers | `/persona/qualifiers` | Competence, Compliance, Shift Readiness and Rapport in full |
| Associate | `/persona/associate` | Routines, each user's directives, and qualifying Packages or workforces |

### Elements — add-ons run on Canvas

| Item | Route | Purpose |
|---|---|---|
| Gateway | `/elements/gateway` | Always-on contact centre. Built in Canvas; Flowstate only connects to it by API |
| Peak | `/elements/peak` | Recognition and rewards; its praise feeds the Rapport layer |

`/elements` is the hub for all Elements.

### Account (pinned)

| Item | Route | Purpose |
|---|---|---|
| Settings | `/account/settings` | Agency settings |
| Integrations | `/account/integrations` | Connected systems and APIs |
| Organisation | `/account/organisation` | The organisation's details, team and roles |
| Links | `/account/links` | Manage everything published as a link (`spec/links.md`) |

## Rules

- Office and Account are for admins only; the rest for coordinators and admins.
- Every page not yet built shows its purpose and "Not built yet", never a 404.
- **Packages and the care-record line:** a Package (care receiver or care home)
  holds logistics only — address, visit times, team, access instructions,
  funding body for invoicing. Never needs, conditions or care plans (`scope.md`).
- **Bid:** discharge referrals often carry health details. Bid stores and shows
  logistics only (area, hours, visits a day, start date, funding body). Clinical
  detail stays in the commissioner's system.
- **Invoices from Packages** use hours and rates only, never care detail.

## Open questions

1. Which commissioner systems does Bid connect to first (a council brokerage portal, an NHS trust, a named system)?
2. `/roadmap` and `/honor` are not in the sidebar — keep, move or remove?
3. Account is pinned under all three lists — or should it live inside the Flowstate list only?
