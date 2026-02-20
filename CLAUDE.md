# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GolazoZone 2026 is a FIFA World Cup 2026 prediction tournament platform. Users register, make predictions per match, and earn points based on a scoring engine. Features include social friend groups, a leaderboard, an admin panel, and multi-provider authentication.

The UI and all user-facing text are in **Spanish**.

## Commands

```bash
# Development
npm run dev             # Start dev server

# Build
npm run build           # prisma generate + next build

# Linting
npm run lint            # ESLint

# Database
npm run db:generate     # Regenerate Prisma client after schema changes
npm run db:push         # Push schema to DB without migration (dev)
npm run db:migrate      # Create and apply a migration
npm run db:seed         # Seed database (tsx prisma/seed.ts)
npm run db:studio       # Open Prisma Studio GUI
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: TailwindCSS v4 + Radix UI + Framer Motion
- **Auth**: NextAuth.js v5 (beta) — JWT sessions, Credentials + Google + Discord providers
- **Database**: PostgreSQL via Supabase, ORM via Prisma 6
- **Email**: Resend
- **Forms**: React Hook Form + Zod
- **Data fetching**: TanStack React Query v5

## Architecture

### Route Groups

```
src/app/
├── (auth)/          # Unauthenticated pages: login, register, verify-email, reset-password
├── (app)/           # Authenticated user app: dashboard, fixture, predictions, leaderboard, groups, profile
├── admin/           # Admin-only panel
└── api/             # API routes (auth, matches, predictions, leaderboard, groups, admin/*, cron/*)
```

### Middleware & Auth (`src/middleware.ts`, `src/lib/auth/index.ts`)

Middleware enforces route protection:
- Unauthenticated users are redirected to `/login`
- Authenticated users are blocked from accessing auth pages
- Role-based access: `USER`, `ADMIN`, `SUPERADMIN`
- Email verification is required before accessing the app

NextAuth is configured with a PrismaAdapter and JWT strategy. The JWT callback enriches the token with `role`, `id`, and `emailVerified`.

### Database (`src/lib/db/index.ts`, `prisma/schema.prisma`)

Prisma client is a global singleton to avoid connection exhaustion in dev. Key schema domains:
- **Auth**: `User`, `Account`, `Session`, `VerificationToken` (NextAuth v5 compatible)
- **Tournament**: `Phase`, `TournamentGroup`, `Team`, `Match`
- **Predictions**: `Prediction`, `PredictionScore`, `ScoringConfig`
- **Social**: `FriendGroup`, `FriendGroupMember`
- **Meta**: `Leaderboard`, `Notification`, `AuditLog`

After any schema change, run `npm run db:generate` then `npm run db:push` (dev) or `npm run db:migrate` (production).

### Scoring Engine (`src/lib/scoring/engine.ts`)

Calculates points per match prediction. Point categories (configurable via admin `ScoringConfig`):
- Exact score: 5 pts
- Correct winner (not exact): 2 pts
- Top scorer / First scorer: 3 pts each
- MVP: 2 pts, Yellow cards exact: 1 pt, Red cards exact: 2 pts
- Most passes: 1 pt
- Perfect bonus (all correct): +5 pts — Max: 24 pts/match

### Cron Jobs (`src/app/api/cron/`)

- `lock-predictions` — locks predictions 5 min before kickoff
- `match-reminders` — sends email reminders 2h before matches

These are Vercel cron endpoints and require the `CRON_SECRET` header for authorization.

### Key Env Variables

See `.env.example` for required variables:
- `DATABASE_URL` / `DIRECT_URL` — Supabase connection strings
- `AUTH_SECRET`, `AUTH_URL` — NextAuth
- `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_ID/SECRET` — OAuth
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — email
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

### Component Conventions

- `src/components/ui/` — reusable Radix UI primitives and custom base components
- `src/components/layout/` — client-side layout wrappers (`client-layout.tsx`, `admin-client-layout.tsx`)
- `src/lib/validations/` — Zod schemas for auth and prediction forms
- `src/types/index.ts` — shared TypeScript interfaces (`MatchWithDetails`, `LeaderboardEntry`, etc.)
