# Spec — coordinator sidebar

_Source: 26 Nov 2026 (D12, D13, D14). Code: `lib/navigation.ts` renders
this; if they differ, this file wins._

Carers don't see this: they use the Aultrum carer app (D10).

## Structure

| Section | Item | Route | Purpose |
|---|---|---|---|
| **Workforce** | Onboarding | `/workforce/onboarding` | Bring new carers in: application → checks (right to work, DBS, references, training) → ready to work. _Wording not yet confirmed_ |
| | Directory | `/workforce/directory` | Everyone: carers, care receivers, coordinators, key persons. _Wording not yet confirmed_ |
| | Teams | `/workforce/teams` | The care team around each **Package**. A Package is a care receiver **or** a care home |
| **Shifts** | Rotas | `/shifts/rotas` | The weekly rota and repeating patterns. _Wording not yet confirmed_ |
| | Open | `/shifts/open` | Shifts nobody is booked on yet. _Wording not yet confirmed_ |
| | Manage | `/shifts/manage` | All shifts: create, change, cancel. _Wording not yet confirmed_ |
| | Request | `/shifts/requests` | Requests from carers: shifts they want, swaps, time off |
| **Supply** | Request | `/supply/request` | Request workforce from supply agencies — agencies on **Pleasant** (via Pleasant's Supply API), and agencies the provider adds to its own **Preferred Supply List** |
| | Manage | `/supply/manage` | Requests made, agency workers booked, their timesheets |
| **Watchboard** | — | `/watchboard` | The important parts of every feature, in one view. Includes the **Qualifiers as sliding cards**, one per Aultrum Layer, each listing what's flagged (`spec/persona.md`) |
| **Persona** | Assist | `/persona/assist` | AI assistant that answers and does work, with confirmation |
| | Pushbots | `/persona/pushbots` | The agency's texting bot for carers and office staff |
| | Qualifiers | `/persona/qualifiers` | Each Aultrum Layer in full: scores, flags and reasons |
| | Associate | `/persona/associate` | Routines, directives, and qualifying Packages or workforces |
| **Admin** | Payroll | `/admin/payroll` | Pay the agency's own carers |
| | Invoice | `/admin/invoices` | **Two directions:** (1) invoices *from* supply agencies; (2) invoices *to* councils and clients, generated from Packages |
| | Bid | `/admin/bids` | Bid for hospital-discharge packages (Tender, inside Flowstate). Connects to commissioners' APIs and shows **what's attainable**: which packages the agency can realistically cover with its carers, area and hours |
| **Elements** | Gateway | `/elements/gateway` | Always-on contact centre — Canvas add-on |
| | Peak | `/elements/peak` | Recognition and rewards — Canvas add-on |
| **Account** | Settings | `/account/settings` | Agency settings |
| | Integrations | `/account/integrations` | Connected systems and APIs |
| | Organisation | `/account/organisation` | The organisation's details, team and roles |
| | Links | `/account/links` | Aultrum Links that invite carers to join the agency in the Aultrum carer app |

Order in the sidebar is as listed. Watchboard is a single link; other sections
show their items underneath. `/elements` is the hub for all Elements.

## Rules

- Admin and Account are for admins only; the other sections for coordinators and admins.
- Every page not yet built shows its purpose and "Not built yet", never a 404.
- **Packages and the care-record line:** a Package (care receiver or care home)
  holds logistics only — address, visit times, team, access instructions,
  funding body for invoicing. Never needs, conditions or care plans (`scope.md`).
- **Bid:** discharge referrals often carry health details. Bid stores and shows
  logistics only (area, hours, visits a day, start date, funding body). Clinical
  detail stays in the commissioner's system.
- **Invoices from Packages** use hours and rates only, never care detail.

## Open questions

0. Persona's position in the sidebar (after Watchboard for now) — see `spec/persona.md`.

1. Which commissioner APIs does Bid connect to first (a council brokerage portal, an NHS trust, a named system)?
2. `/roadmap` and `/honor` are not in the sidebar — keep, move or remove?
