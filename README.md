<<<<<<< HEAD
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
=======
Here’s a **clean, portfolio-grade README** you can drop directly into your project:

---

# Physique Accountability

An AI-assisted accountability and compliance platform for physique coaching.
Designed to replicate the **structure, pressure, and feedback loop of a professional coach**—without requiring one.

---

## Overview

Physique Accountability is not a generic fitness tracker or chatbot.

It is a **system-driven accountability engine** that enforces:

* consistent check-ins
* measurable adherence
* data-backed decision making
* structured weekly reviews
* progressive intervention when compliance slips

The platform ensures that **no meaningful feedback is generated without sufficient data**, mirroring how high-level coaching actually works.

---

## Core Problem

Most physique progress does not fail due to lack of knowledge—it fails due to:

* inconsistent execution
* lack of accountability
* emotional decision-making
* poor adherence tracking
* absence of structured feedback loops

Traditional coaching solves this with human oversight.

This system replicates that through:

* required inputs
* enforced reporting
* deterministic analysis
* AI-assisted feedback

---

## Key Features

### 1. Structured Check-In System

* Daily check-ins (weight, sleep, training, nutrition, recovery)
* Weekly check-ins (photos, measurements, performance trends)
* Required fields enforce data completeness

---

### 2. Accountability Engine

* Scheduled prompts for required inputs
* Escalation system for missed check-ins
* State-based tracking:

  * scheduled
  * partial
  * completed
  * overdue
  * escalated

---

### 3. Compliance & Reporting Scores

Two independent scoring systems:

**Compliance Score**

* Measures how well the user followed the plan

**Reporting Score**

* Measures how consistently the user submitted required data

This distinction prevents false confidence from incomplete reporting.

---

### 4. Weekly Review Gate

* Weekly analysis is **blocked until required evidence is submitted**
* Missing data reduces confidence and halts full recommendations
* Forces adherence to a structured review process

---

### 5. Deterministic Decision Engine

* Rule-based adjustments (not AI hallucination)
* Handles:

  * weight trends
  * adherence patterns
  * recovery signals
* Produces controlled, explainable outputs

---

### 6. AI-Assisted Feedback Layer

AI is used to:

* summarize trends
* explain decisions
* highlight risks
* generate directives

AI is **not** the source of truth—it enhances structured outputs.

---

### 7. Pattern Recognition & Interventions

Tracks repeated behaviors such as:

* missed weigh-ins
* inconsistent nutrition
* poor weekly completion

Applies corrective actions:

* reduced complexity
* adjusted expectations
* targeted directives

---

### 8. Coach-Style Messaging System

System-generated messages include:

* reminders
* blocked states
* escalation notices
* weekly summaries
* actionable directives

Tone is:

* firm
* rational
* performance-oriented

---

## System Philosophy

This platform is built on a simple principle:

> **No data → No score → No decision**

Unlike traditional apps:

* it does not guess
* it does not fill gaps
* it does not provide false reassurance

It enforces the same constraints a real coach would:

* incomplete reporting reduces decision quality
* repeated non-compliance triggers intervention
* progress is judged by trends, not emotions

---

## Architecture Overview

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Next.js API routes / server actions
* Prisma ORM
* PostgreSQL

### Core Systems

* Check-in ingestion layer
* Scoring engine (compliance + reporting)
* Prompt scheduling & escalation system
* Weekly review gate
* Message generation layer
* AI summary module

---

## Data Model Highlights

Core entities include:

* `User`
* `Goal`
* `DailyCheckIn`
* `WeeklyCheckIn`
* `ComplianceScore`
* `ReportingScore`
* `ScheduledPrompt`
* `PromptAttempt`
* `AccountabilityFlag`
* `Intervention`
* `MessageHistory`

This enables:

* stateful tracking
* behavioral pattern detection
* structured feedback loops

---

## Accountability Workflow

1. User receives scheduled prompt
2. Required data is submitted (or missed)
3. System updates check-in state
4. Scores are computed (if valid)
5. Missing data triggers escalation
6. Weekly review requires full evidence
7. AI generates structured summary
8. System issues next directive

---

## Example Output

**Weekly Review**

* Compliance: 84
* Reporting: 62

**Assessment**
Progress is positive, but reporting inconsistency is reducing decision accuracy.

**Key Issue**
Missed 3 morning weigh-ins and incomplete weekly inputs.

**Adjustment**
Maintain calories, increase reporting consistency before modifying variables.

**Directive**
Submit all morning check-ins this week before changing any part of the plan.

---

## AI Integration Philosophy

AI is used for:

* summarization
* explanation
* communication

AI is **not used for:**

* core decision-making
* scoring
* data inference

This prevents:

* hallucinated coaching advice
* inconsistent recommendations
* loss of system integrity

---

## Local Development

```bash
git clone <repo>
cd physique-accountability
npm install
npx prisma migrate dev
npm run dev
```

---

## Future Roadmap

* Push notifications / SMS integration
* iOS-native app (Apple ecosystem optimization)
* Wearable integration (Apple Health, WHOOP, etc.)
* Image-based physique analysis
* Advanced trend modeling
* Coach dashboard (multi-client support)
* Custom intervention strategies
* Nutrition planning system
* Contest prep modules

---

## Positioning

This project is designed as:

> **An AI-assisted accountability and compliance system for physique development**

Not:

* a generic fitness app
* a chatbot
* a replacement for all coaching

But a system that delivers:

* structure
* consistency
* measurable execution

---

## Author Intent

This project explores how structured systems + AI can replicate:

* accountability
* behavioral enforcement
* decision support

within a performance-driven domain.

---

If you want, next step I can help you:

* turn this into a **GitHub-ready polished repo (badges, screenshots, demo section)**
* or create a **short demo script** so you can present it cleanly in interviews
>>>>>>> ccd6353ab704749c302899e48947eb8491afefe1
