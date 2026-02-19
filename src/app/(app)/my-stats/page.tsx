import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Star, TrendingUp, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Estadísticas" };

export default async function MyStatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const leaderboard = await db.leaderboard.findUnique({ where: { userId: session.user.id } });

  // Get prediction scores breakdown
  const scores = await db.predictionScore.findMany({
    where: { prediction: { userId: session.user.id } },
  });

  const totalByCategory = {
    winner: scores.reduce((a, s) => a + s.pointsWinner, 0),
    exactScore: scores.reduce((a, s) => a + s.pointsExactScore, 0),
    topScorer: scores.reduce((a, s) => a + s.pointsTopScorer, 0),
    firstScorer: scores.reduce((a, s) => a + s.pointsFirstScorer, 0),
    mvp: scores.reduce((a, s) => a + s.pointsMvp, 0),
    yellowCards: scores.reduce((a, s) => a + s.pointsYellowCards, 0),
    redCards: scores.reduce((a, s) => a + s.pointsRedCards, 0),
    mostPasses: scores.reduce((a, s) => a + s.pointsMostPasses, 0),
    perfectBonus: scores.reduce((a, s) => a + s.pointsPerfectBonus, 0),
  };

  const best = scores.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);

  const stats = [
    { label: "Puntos totales", value: leaderboard?.totalPoints ?? 0, icon: Trophy, color: "text-[var(--accent)]" },
    { label: "Posición global", value: leaderboard?.globalRank ? `#${leaderboard.globalRank}` : "—", icon: TrendingUp, color: "text-[var(--success)]" },
    { label: "Partidos pronosticados", value: leaderboard?.matchesPlayed ?? 0, icon: Target, color: "text-[var(--primary)]" },
    { label: "Marcadores exactos", value: leaderboard?.exactScores ?? 0, icon: Star, color: "text-[var(--warning)]" },
    { label: "Ganadores correctos", value: leaderboard?.correctWinners ?? 0, icon: Zap, color: "text-[var(--success)]" },
    { label: "Accuracy", value: `${(leaderboard?.accuracy ?? 0).toFixed(1)}%`, icon: Target, color: "text-[var(--accent)]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Mis Estadísticas</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Tu rendimiento en el Mundial 2026</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  <p className={`text-3xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`w-5 h-5 ${s.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Points breakdown */}
      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Puntos por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Resultados exactos", value: totalByCategory.exactScore },
              { label: "Ganadores correctos", value: totalByCategory.winner },
              { label: "Goleadores", value: totalByCategory.topScorer },
              { label: "Primeros goleadores", value: totalByCategory.firstScorer },
              { label: "MVP", value: totalByCategory.mvp },
              { label: "Tarjetas amarillas", value: totalByCategory.yellowCards },
              { label: "Tarjetas rojas", value: totalByCategory.redCards },
              { label: "Más pases", value: totalByCategory.mostPasses },
              { label: "Bonus perfecto", value: totalByCategory.perfectBonus },
            ].map((cat) => {
              const total = leaderboard?.totalPoints || 1;
              const pct = Math.round((cat.value / total) * 100);
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{cat.label}</span>
                    <span className="font-semibold text-[var(--accent)]">{cat.value} pts</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
