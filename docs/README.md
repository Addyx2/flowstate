# Flowstate documentation

The repository is the source of truth for **what is being built**. Strategy and
business material live elsewhere, privately. When a decision there changes the
product, write the product decision here in plain words, without the business
detail, so every tool can see it.

| Doc | Answers | Update when |
|---|---|---|
| [product.md](product.md) | What is Flowstate, for whom, what's in v1 | Scope or users change |
| [scope.md](scope.md) | Where the CQC / care-record line is | A feature is added near the line |
| [status.md](status.md) | What's built, what's mock, what's next, session log | **Every session** |
| [decisions.md](decisions.md) | What was decided, when, why | A decision is made |
| [spec/](spec/) | One spec per function (`navigation.md`, `persona.md`); code follows these | Before a function is built or changed |
| [design/](design/README.md) | Wireframes, concept theory, references, Paper designs | New design work arrives |
| [ecosystem.md](ecosystem.md) | How Flowstate fits with Pleasant, Aultrum ID, the carer app and Canvas | A dependency changes |
| [archive/](archive/) | Superseded docs, kept for history | Never edited |

## Why this exists

Flowstate is built across several agentic dev environments and many chats.
Context that lives only in a chat or one tool's memory gets lost. The rule:
**if it matters for the next session, it's written here.**
