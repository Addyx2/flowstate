# Flowstate

Rota and carer coordination for home-care providers — **a prototype**.
Coordinators run carers, Packages and rotas here; carers use the shared
Aultrum carer app. Flowstate holds no care records.

**Start here:** [`AGENTS.md`](AGENTS.md) and [`docs/`](docs/README.md) — product, scope, status, decisions.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Prisma + Postgres ·
Aultrum ID (OpenID Connect) · Claude (Assist)

## Run it locally

Needs Node 22 and Postgres 16.

```bash
cp .env.example .env     # set DATABASE_URL and AUTH_SECRET
npm install
npx prisma migrate deploy
npm run db:seed          # demo agency: Northfield Home Care
npm run dev              # http://localhost:3000
```

Demo sign-ins (password `flowstate123`): `admin@flowstate.demo` (Admin),
`coordinator@flowstate.demo` (Coordinator).

## Checks

```bash
npm run typecheck
npm test                 # unit tests; the DB-backed ones need the seeded database
npm run build
```

CI (`.github/workflows/ci.yml`) runs all of these against a real Postgres.

## Layout

```
app/(app)/            coordinator app (sidebar: Flowstate · Persona · Elements, Account)
  workforce/          Directory, Onboarding, Teams (Packages)
  shifts/             Rotas, Open, Manage, Request
  watchboard/         today + the four Aultrum Layers as cards
  persona/            Assist, Qualifiers (Pushbots, Associate: placeholders)
  account/links/      everything published as a link
app/l/[token]/        public link pages (praise, shift requests) — no login
app/api/carer/v1/     Carer API v1 for the Aultrum carer app
app/api/assist/       Assist
lib/qualifiers.ts     Competence, Compliance, Shift Readiness, Rapport v0
lib/shifts.ts         booking rules shared by screens, Assist and the Carer API
lib/contracts/        shared Aultrum v1 contract (identical to Pleasant's)
prisma/               schema, migrations, demo seed
docs/                 the source of truth for what's being built
```

## Changing the database

Edit `prisma/schema.prisma`, run `npm run db:migrate -- --name what_changed`,
commit the schema and the migration together.
