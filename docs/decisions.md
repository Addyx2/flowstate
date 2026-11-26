# Decisions

Append-only. Each entry: date, decision, why. To change a decision, add a new
entry that supersedes it — don't edit old ones.

---

### D1 — Coordination, not care records (Nov 2026)
Flowstate is rota and carer coordination for home-care providers. It has no
compliance layer and never holds a person's care record.

### D2 — The care-record line (Nov 2026)
Care notes are out of scope. A Package holds logistics only. Full table in `scope.md`.

### D3 — Pleasant is the reference implementation (Nov 2026)
Pleasant already does most of the coordination process. Reuse its patterns where
a spec says so; Flowstate's functions and design differ (D11–D13).

### D4 — Copy never claims compliance (Nov 2026)
Say "helps you see late and missed visits", never "makes you CQC compliant".

### D5 — Everyone signs in with Aultrum ID (Sep 2026)
One account belongs to the person, not the agency. Aultrum ID never holds care
information; Flowstate never holds passwords or codes. Agencies can't edit a
carer's Aultrum ID.

### D6 — Roles (Sep 2026)
Coordinators use the Flowstate web app. Key persons (family) get a praise link,
no account. Care receivers: nothing in v1. (Carers: superseded by D10.)

### D7 — Peak fairness rules (Nov 2026)
See `product.md`.

### D8 — Gateway (Sep 2026) — superseded by D13

### D9 — Documentation lives in the repo (25 Nov 2026)
`AGENTS.md` + `docs/` are the build source of truth for every coding tool; every
session updates `status.md`. Business material stays out of this repo.

### D10 — Carers use the Aultrum carer app, shared with Pleasant (25 Nov 2026)
Carers use the Aultrum carer app, which already serves Pleasant. An organisation
joins a carer through an Aultrum Link; the app then reads the carer's work from
the organisation's product through **Carer API v1**. Flowstate builds the
coordinator side plus a Carer API v1 matching the shared contract Pleasant uses.

### D11 — Design comes first (25 Nov 2026)
Order: wireframes → concept theory → software references → designs in Paper.
These land in `docs/design/` and become specs before screens are coded.

### D12 — Coordinator sidebar (26 Nov 2026)
Workforce (Onboarding, Directory, Teams) · Shifts (Rotas, Open, Manage, Request) ·
Supply (Request, Manage) · Watchboard · Admin (Payroll, Invoice, Bid). Watchboard
replaces the Dashboard. Payroll and Invoice are part of Flowstate. Spec:
`spec/navigation.md`.

### D13 — Sidebar meanings; Elements and Account sections (26 Nov 2026)
- **Package** = a care receiver **or** a care home. **Teams** = the care team around each Package.
- **Shifts → Request** = carers' requests (shifts, swaps, time off).
- **Supply** requests workers from agencies on Pleasant and from the provider's
  own **Preferred Supply List**.
- **Invoice** works both ways: from supply agencies, and to councils and clients
  generated from Packages.
- **Bid** = bidding for hospital-discharge packages, connecting to commissioners'
  systems and showing which packages are attainable.
- **Elements** holds Gateway and Peak as add-ons (run on Canvas).
- **Account**: Settings, Integrations, Organisation, Links.

### D14 — Persona: Flowstate's AI functions (26 Nov 2026)
New **Persona** section: **Assist**, **Pushbots**, **Qualifiers** (own page) and
**Associate** (routines, directives, qualifying Packages or workforces). The
Watchboard shows the Qualifiers as sliding cards, one per Aultrum Layer, each
listing what's flagged. Every AI function confirms before changing anything and
scores the work, never the person receiving care. Spec: `spec/persona.md`.
