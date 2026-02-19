import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Target, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/fixture/match-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Get leaderboard stats
  const leaderboard = await db.leaderboard.findUnique({ where: { userId } });

  // Get next 3 upcoming matches without prediction
  const upcomingUnpredicted = await db.match.findMany({
    where: {
      status: "SCHEDULED",
      dateUTC: { gte: new Date() },
      predictable: true,
      lockAt: { gte: new Date() },
      predictions: { none: { userId } },
    },
    include: {
      phase: { select: { slug: true, name: true } },
      group: { select: { letter: true, name: true } },
      home: true,
      away: true,
      result: true,
    },
    orderBy: { dateUTC: "asc" },
    take: 3,
  });

  // Get last 3 finished matches with predictions
  const recentFinished = await db.prediction.findMany({
    where: {
      userId,
      match: { status: "FINISHED" },
    },
    include: {
      match: {
        include: {
          phase: { select: { slug: true, name: true } },
          group: { select: { letter: true, name: true } },
          home: true,
          away: true,
          result: true,
        },
      },
      score: true,
    },
    orderBy: { match: { dateUTC: "desc" } },
    take: 3,
  });

  // Pending predictions count
  const pendingCount = await db.match.count({
    where: {
      status: "SCHEDULED",
      predictable: true,
      lockAt: { gte: new Date() },
      predictions: { none: { userId } },
    },
  });

  const stats = [
    {
      label: "Puntos totales",
      value: leaderboard?.totalPoints ?? 0,
      icon: Trophy,
      color: "text-[var(--accent)]",
    },
    {
      label: "Posición global",
      value: leaderboard?.globalRank ? `#${leaderboard.globalRank}` : "—",
      icon: TrendingUp,
      color: "text-[var(--success)]",
    },
    {
      label: "Marcadores exactos",
      value: leaderboard?.exactScores ?? 0,
      icon: Star,
      color: "text-[var(--warning)]",
    },
    {
      label: "Sin pronosticar",
      value: pendingCount,
      icon: Target,
      color: "text-[var(--danger)]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
          ¡Hola, {session.user.name?.split(" ")[0] ?? "crack"}! 👋
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          FIFA World Cup 2026 · 11 Jun – 19 Jul · USA / México / Canadá
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium">{stat.label}</p>
                  <p className={`text-3xl font-display font-bold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color} opacity-70 flex-shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming matches to predict */}
      {upcomingUnpredicted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">
              ⏳ Pronósticos pendientes
            </h2>
            <Link href="/fixture">
              <Button variant="ghost" size="sm">Ver todos →</Button>
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingUnpredicted.map((match) => (
              <MatchCard
                key={match.id}
                match={{ ...match, homeTeam: match.home, awayTeam: match.away, userPrediction: null }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent results */}
      {recentFinished.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">
              ✅ Últimos resultados
            </h2>
            <Link href="/predictions">
              <Button variant="ghost" size="sm">Ver todos →</Button>
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentFinished.map((pred) => (
              <MatchCard
                key={pred.matchId}
                match={{ ...pred.match, homeTeam: pred.match.home, awayTeam: pred.match.away, userPrediction: pred }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Colombia games highlight */}
      <div className="colombia-card rounded-[var(--radius-lg)] p-5 space-y-3">
        <h2 className="font-semibold text-[var(--warning)] flex items-center gap-2">
          🇨🇴 Partidos de Colombia — Grupo K
        </h2>
        <div className="grid gap-2 text-sm">
          {[
            { match: "Uzbekistán vs Colombia", date: "Mié 17 Jun · 9:00 PM (COL)", venue: "Estadio Azteca, CDMX" },
            { match: "Colombia vs Rep. FIFA-1", date: "Mar 23 Jun · 9:00 PM (COL)", venue: "Estadio Akron, Guadalajara" },
            { match: "Colombia vs Portugal", date: "Sáb 27 Jun · 6:30 PM (COL)", venue: "Hard Rock Stadium, Miami" },
          ].map((g) => (
            <div key={g.match} className="flex items-start gap-3 bg-black/20 rounded-[var(--radius-sm)] p-3">
              <span className="text-lg flex-shrink-0">⚽</span>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{g.match}</p>
                <p className="text-xs text-[var(--text-muted)]">{g.date} · {g.venue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
