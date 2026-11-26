> **Superseded.** Early (Aug–Nov 2026) architecture notes, kept for history.
> Current docs: `docs/product.md`, `docs/scope.md`, `docs/decisions.md`.
> The "Phasing" section below wrongly treated rota and visit scheduling as
> CQC-regulated; see `docs/scope.md` for the correct line.

# Flowstate Product Architecture

## Vision

Let a care ecosystem grow from a single substrate: the carer, the client, and the
bond between them. Flowstate is not one product — it is a **suite of modules**,
each the "front door" for a different audience, all sharing one platform and one
data model.

## Brand Map

```
AULTRUM (company · manifesto · Aultrum Layers — the moat)
│
├── Landing (aultrumpro.vercel.app)         marketing
├── /flowstatebeta                          product marketing (future homepage)
│
└── FLOWSTATE — the product platform (flowstate.aultrum.co.uk)
      ├── Teams (dashboard / operations)
      ├── Shift                              ← where professional carers work
      │     └── HONOR ✦                       ← professional caregiver module
      ├── DRIVE   (future)  events & visits for disabled / special-needs orgs
      └── TENDER  (future)  family & friends caregiving — social app
```

## Phasing — CQC-regulated functions pushed forward

**Phase 1 (launch) ships non-regulated functions only**, so Flowstate can go
live with no CQC registration: Honor (Live CV, references, chorals, tiers,
multi-job, training), Gateway (call answering, enquiry capture, call-back
booking), Peak (points & perks), and the operations dashboard.

**Phase 2 (regulated)** holds every function that delivers, directs, or records
personal care or treatment. These are not built until the operator is CQC
registered for the relevant regulated activity:

| Deferred function | Why it is regulated |
|-------------------|---------------------|
| Care plans & needs assessments | Planning personal care |
| Care visit scheduling & task lists | Directing care delivery |
| Daily care notes / AI care documentation | Provider care records |
| eMAR (medication records) | Medication support |
| Urgent / clinical triage by voice | Health advice — Phase 1 routes to 999 / NHS 111 |
| Incident & safeguarding reporting | Provider statutory notifications |
| CQC readiness / inspection evidence | Only meaningful once registered |
| Care-receiver health records | Health data held as a provider |

The single source of truth is `lib/features.ts`; the in-app `/roadmap` page
renders it.

## The "Apps inside a platform" model

Just as Outlook bundles Mail + Calendar + Contacts, **Flowstate bundles modules**.
The professional carer does not install a separate app — Honor lives inside
Flowstate / Shift. Marketing happens at the brand level, value lives in modules.

## HONOR — professional caregivers (in Flowstate Shift)

**Positioning:** the front door for employed/professional carers. Built for the
person who *delivers care as their profession*.

**Primary hook (Launch):** **Live CV + verified references** — "Your career,
proven and portable."

**Modules:**

| Module | Description |
|--------|-------------|
| Live CV | Portable, current proof of skills, qualifications, rating, tier |
| References | Verifiable, real-time references from managers & care receivers |
| Chorals | Applause (recognition) converted into a points balance |
| Tiers | Clubcard-style levels (Silver → Gold → Platinum) |
| Multi-job | Manage 2–3 paid roles at once |
| Training | Discounted growth links / marketplace |
| Wage stream | EWA — ROADMAP (FCA-regulated, later) |

## TENDER — (future) informal / family caregivers

Family & friends caregiving, positioned as a **social app**. "Everyone should
tender for people" — easy for the tendered and the tenderer. _Not scoped now._

## DRIVE — (future)

Events & visits management for organisations serving disabled / special-needs
people. _Not scoped now._

## Data Model (core)

```
Person        (carer / client / manager)
CarerProfile  (qualifications, skills, tier, rating)  ← feeds Aultrum Layers
Job           (up to ~3 active jobs per carer)
Reference     (verifiable, from manager / receiver)
Choral        (applause event → points)
Redemption    (points → training / perk)
Call          (telephony audit)
```

The carer profile is the substrate for **Persona Intelligence** and the
**Aultrum Layers** — Honor's chorals and retention data feed Purpose / Rapport
up into the layers, deepening the moat.
