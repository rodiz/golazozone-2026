import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Target, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/fixture/match-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const matchGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  gap: "0.75rem",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const leaderboard = await db.leaderboard.findUnique({ where: { userId } });

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

  const recentFinished = await db.prediction.findMany({
    where: { userId, match: { status: "FINISHED" } },
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

  const pendingCount = await db.match.count({
    where: {
      status: "SCHEDULED",
      predictable: true,
      lockAt: { gte: new Date() },
      predictions: { none: { userId } },
    },
  });

  const stats = [
    { label: "Puntos totales",    value: leaderboard?.totalPoints ?? 0,                       icon: Trophy,    colorVar: "var(--accent)"  },
    { label: "Posición global",   value: leaderboard?.globalRank ? `#${leaderboard.globalRank}` : "—", icon: TrendingUp, colorVar: "var(--success)" },
    { label: "Marcadores exactos",value: leaderboard?.exactScores ?? 0,                       icon: Star,      colorVar: "var(--warning)" },
    { label: "Sin pronosticar",   value: pendingCount,                                         icon: Target,    colorVar: "var(--danger)"  },
  ];

  return (
    <div className="page-stack">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
          ¡Hola, {session.user.name?.split(" ")[0] ?? "crack"}! 👋
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          FIFA World Cup 2026 · 11 Jun – 19 Jul · USA / México / Canadá
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))", gap: "1rem" }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="card-content" style={{ paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</p>
                  <p className="font-display font-bold" style={{ fontSize: "1.875rem", marginTop: "0.25rem", color: stat.colorVar }}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon size={20} style={{ color: stat.colorVar, opacity: 0.7, flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming matches to predict */}
      {upcomingUnpredicted.length > 0 && (
        <div className="page-stack-sm">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 600, color: "var(--text-primary)" }}>⏳ Pronósticos pendientes</h2>
            <Link href="/fixture">
              <Button variant="ghost" size="sm">Ver todos →</Button>
            </Link>
          </div>
          <div style={matchGrid}>
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
        <div className="page-stack-sm">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 600, color: "var(--text-primary)" }}>✅ Últimos resultados</h2>
            <Link href="/predictions">
              <Button variant="ghost" size="sm">Ver todos →</Button>
            </Link>
          </div>
          <div style={matchGrid}>
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
      <div className="colombia-card" style={{ borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
        <h2 style={{ fontWeight: 600, color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          🇨🇴 Partidos de Colombia — Grupo K
        </h2>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {[
            { match: "Uzbekistán vs Colombia",  date: "Mié 17 Jun · 9:00 PM (COL)", venue: "Estadio Azteca, CDMX" },
            { match: "Colombia vs Rep. FIFA-1", date: "Mar 23 Jun · 9:00 PM (COL)", venue: "Estadio Akron, Guadalajara" },
            { match: "Colombia vs Portugal",    date: "Sáb 27 Jun · 6:30 PM (COL)", venue: "Hard Rock Stadium, Miami" },
          ].map((g) => (
            <div key={g.match} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
              <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>⚽</span>
              <div>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{g.match}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{g.date} · {g.venue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
