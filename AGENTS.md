# Flowstate — instructions for every coding agent

This file is the entry point for any agent or ADE (Claude Code, Opencode,
Cursor, Codex, Copilot, …) working in this repository. `CLAUDE.md` points here.
Read this first, then the docs it links to, **before** changing code.

## Read before you start

1. [`docs/product.md`](docs/product.md) — what Flowstate is, who uses it, v1 scope.
2. [`docs/scope.md`](docs/scope.md) — the CQC / care-record line. Never cross it.
3. [`docs/status.md`](docs/status.md) — what is built, what is mock, what is next.
4. [`docs/decisions.md`](docs/decisions.md) — decisions already made. Don't re-open them.
5. [`docs/ecosystem.md`](docs/ecosystem.md) — the other Aultrum repos Flowstate depends on.

## Before you finish a session

Documentation is part of the change, not a follow-up.

- Update [`docs/status.md`](docs/status.md): what you changed, what's left, and a
  dated line in its **Session log** (date, tool, branch, one-line summary).
- A new decision (scope, naming, architecture, a "we won't do X") goes in
  [`docs/decisions.md`](docs/decisions.md) as a new numbered entry. Never edit an
  old decision; supersede it with a new one.
- If code and docs disagree, fix whichever is wrong in the same commit.

## Hard rules

- **No care records.** Care notes, care plans, needs, conditions, medication,
  health details of the person receiving care: none of these are stored or
  shown. See `docs/scope.md`.
- **Never claim compliance.** UI and copy may say "helps you see late and missed
  visits", never "makes you CQC compliant". Don't write "no compliance constraint".
- **Label it a prototype.** Keep it simple and explainable.
- **Emergencies:** any voice or text agent tells the person to ring 999 (or NHS
  111) and hands over to a human. It never triages or claims to dispatch help.
- **This repository is public.** No secrets, customer names, prospect lists,
  pricing or other business material in code or docs.
- **Sign-in is Aultrum ID.** Don't build a separate identity system.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # typecheck
npm run build
```
