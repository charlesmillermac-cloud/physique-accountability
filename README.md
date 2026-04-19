# Physique Accountability

Initial scaffold for a portfolio-grade physique coaching accountability platform built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui conventions, Prisma, and PostgreSQL.

## Current scope

This foundation intentionally covers only the first version of the product:

- daily and weekly check-in surfaces
- compliance and reporting-score oriented dashboard structure
- missing required data tracking at the schema level
- reminder escalation groundwork
- weekly summary persistence groundwork

It does **not** implement auth, AI generation, form submission logic, or scoring engines yet.

## Project structure

```text
app/
  (workspace)/        Internal app shell and placeholder product routes
  globals.css         Tailwind v4 theme tokens and global styles
  layout.tsx          Root document and typography setup
  page.tsx            Public homepage / product overview
components/
  dashboard/          Dashboard-specific presentational pieces
  layout/             Workspace shell, nav, and page headers
  ui/                 shadcn-style shared primitives
lib/
  db/                 Prisma client bootstrap
  navigation.ts       Route metadata for workspace navigation
  placeholders.ts     Temporary UI data until live queries are wired in
  utils.ts            Shared utility helpers (`cn`)
prisma/
  schema.prisma       Core accountability data model
generated/
  prisma/             Generated Prisma client output (gitignored)
prisma.config.ts      Prisma v7 config with env-backed datasource
```

## Why this architecture

- `app/page.tsx` stays public while `app/(workspace)` holds the internal coaching product shell. That keeps future auth and role-based access changes localized.
- `components/ui` contains reusable primitives and `components/layout` contains product scaffolding so route files stay focused on page intent.
- `lib/placeholders.ts` makes it easy to replace temporary data with Prisma queries later without rewriting page composition.
- The Prisma schema reflects the current product scope only: `Athlete`, `DailyCheckIn`, `WeeklyCheckIn`, `Reminder`, and `WeeklySummary`.
- Prisma is configured using the Prisma 7 flow: `prisma.config.ts` owns the datasource URL and the app consumes a generated client with the PostgreSQL adapter.

## Prisma model notes

- `DailyCheckIn` and `WeeklyCheckIn` both include `status` and `missingFields` so the system can distinguish incomplete data from fully missed submissions.
- `Reminder` supports escalation state, scheduling, and optional links to the related daily or weekly record.
- `WeeklySummary` stores generated narrative output alongside compliance and reporting scores for each review window.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Update `DATABASE_URL` to your PostgreSQL instance.

4. Generate Prisma client and run the initial migration:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

## Recommended next build steps

1. Add authentication and an initial athlete/coach account model strategy.
2. Implement real form flows for daily and weekly check-ins.
3. Replace placeholder dashboard data with Prisma queries and server actions.
4. Add scoring services and reminder orchestration.
5. Layer in AI summary generation on top of structured weekly data.
