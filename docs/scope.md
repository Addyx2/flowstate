# Scope — the CQC / care-record line

CQC regulates **care providers**, not software. Flowstate's customers are
providers; Flowstate itself stays outside care-record rules by **never holding a
person's care record**. Digital social care records have their own NHS England
data standard and an Assured Supplier List — Flowstate is not one.

## Feature by feature

| Feature | Care-record rules? | Notes |
|---|---|---|
| Shifts / rota | No | Workforce scheduling |
| Directory (staff, contacts) | No | Personal data under UK GDPR, not care data |
| Praise (praise links, Peak) | No | About the carer. Seen only by the carer praised and coordinators (D20). Families are asked not to include health details; Rapport uses only who, where and that praise was given |
| Peak (recognition, rewards) | No | Anything that pays out money early would be a financial-regulation question instead |
| Teammates profile, Aultrum ID | No | Staff data. Carers can download their own data |
| Teams messages, handover notes (v1.5) | **Careful** | "Running late", "cover needed" = fine. How someone is (meds, falls, mood) = care record |
| Package | **Depends on content** | Logistics (address, visit times, carers, access instructions) = outside. Care plan, needs, conditions = inside |
| Visit check-in/out (v2) | No | Call monitoring; useful inspection evidence for the agency |
| Care notes (Later) | **Yes — out of scope** | This is the line |

## Still applies

- ICO registration and UK GDPR.
- Key-safe codes and addresses are sensitive: restrict, audit-log, never put in notifications.
- Matching and Early Rota rules must be explainable, with human review.
- Copy: say "helps you see late and missed visits", never "makes you CQC compliant".
- Before real customer data goes in: get data-protection legal advice.

## How to use this page

Adding a field or screen? Ask: *does this describe the person receiving care —
their health, needs, condition, medication or how they are?* If yes, it doesn't
go in Flowstate. If unsure, stop and add an open question to `status.md`.
