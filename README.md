# GolazoZone 2026 ⚽🏆

**La polla mundialista más completa del FIFA World Cup 2026**

> 104 partidos · 48 equipos · 12 grupos · Sistema de puntuación multi-categoría · Ranking en tiempo real

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Estilos | TailwindCSS v4 + Design System custom |
| Animaciones | Framer Motion |
| Backend API | Next.js API Routes |
| ORM | Prisma |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticación | NextAuth.js v5 + Credentials + OAuth |
| Emails | Resend |
| Deploy | Vercel + Supabase |

## Setup

### 1. Clonar e instalar
```bash
git clone https://github.com/rodiz/golazozone-2026.git
cd golazozone-2026
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env.local
# Completa DATABASE_URL, DIRECT_URL, AUTH_SECRET, RESEND_API_KEY
```

### 3. Base de datos (Supabase)
```bash
npm run db:push       # Aplica el schema
npm run db:seed       # Carga 104 partidos + superadmin
```

### 4. Desarrollo
```bash
npm run dev
```

Accede a [http://localhost:3000](http://localhost:3000)

**Superadmin:** `admin@golazozone.com` / `SuperAdmin2026!`

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Reset Password, Verify Email
│   ├── (app)/           # Dashboard, Fixture, Predictions, Leaderboard, Groups, Profile, My Stats
│   ├── admin/           # Panel Admin (Dashboard, Matches, Users, Scoring, Audit)
│   └── api/             # API Routes + Cron Jobs
├── components/
│   ├── ui/              # Button, Input, Card, Badge, CountdownTimer
│   ├── fixture/         # MatchCard
│   ├── predictions/     # PredictionForm (multi-step)
│   └── layout/          # Navbar (desktop sidebar + mobile bottom nav)
├── lib/
│   ├── auth/            # NextAuth config + middleware
│   ├── db/              # Prisma client
│   ├── scoring/         # Motor de calculo de puntos
│   ├── email/           # Templates con Resend
│   └── validations/     # Schemas Zod compartidos
└── types/               # TypeScript types globales
```

## Sistema de Puntuacion

| Categoria | Puntos |
|-----------|--------|
| Resultado exacto (score + ganador) | 5 pts |
| Ganador correcto | 2 pts |
| Goleador del partido | 3 pts |
| Primer goleador | 3 pts |
| MVP del partido | 2 pts |
| Tarjetas amarillas exactas | 1 pt |
| Tarjetas rojas exactas | 2 pts |
| Jugador mas pases | 1 pt |
| Bonus perfecto (todos correctos) | +5 pts |
| Maximo posible | 24 pts |

Configurable desde /admin/scoring sin necesidad de codigo.

## Partidos de Colombia

| Match | Partido | Fecha COL | Sede |
|-------|---------|-----------|------|
| #23 | Uzbekistan vs Colombia | Mie 17 Jun - 9:00 PM | Estadio Azteca, CDMX |
| #45 | Colombia vs Rep. FIFA-1 | Mar 23 Jun - 9:00 PM | Estadio Akron, GDL |
| #69 | Colombia vs Portugal | Sab 27 Jun - 6:30 PM | Hard Rock, Miami |

## Cron Jobs (Vercel)

| Job | Frecuencia | Funcion |
|-----|-----------|---------|
| /api/cron/lock-predictions | Cada 5 min | Cierra pronosticos al kickoff |
| /api/cron/match-reminders | Cada hora | Envia emails 2h antes |

## Deploy en Vercel

1. Conecta el repo en vercel.com
2. Agrega las variables de entorno
3. Agrega CRON_SECRET en las env vars
4. Deploy automatico en cada push a main

---

FIFA World Cup 2026 - 11 Jun a 19 Jul - USA / Mexico / Canada
