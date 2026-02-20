import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Target, Star, TrendingUp, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Estadísticas" };

export default async function MyStatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const leaderboard = await db.leaderboard.findUnique({ where: { userId: session.user.id } });

  const scores = await db.predictionScore.findMany({
    where: { prediction: { userId: session.user.id } },
  });

  const totalByCategory = {
    winner:       scores.reduce((a, s) => a + s.pointsWinner, 0),
    exactScore:   scores.reduce((a, s) => a + s.pointsExactScore, 0),
    topScorer:    scores.reduce((a, s) => a + s.pointsTopScorer, 0),
    firstScorer:  scores.reduce((a, s) => a + s.pointsFirstScorer, 0),
    mvp:          scores.reduce((a, s) => a + s.pointsMvp, 0),
    yellowCards:  scores.reduce((a, s) => a + s.pointsYellowCards, 0),
    redCards:     scores.reduce((a, s) => a + s.pointsRedCards, 0),
    mostPasses:   scores.reduce((a, s) => a + s.pointsMostPasses, 0),
    perfectBonus: scores.reduce((a, s) => a + s.pointsPerfectBonus, 0),
  };

  const stats = [
    { label: "Puntos totales",        value: leaderboard?.totalPoints ?? 0,                           icon: Trophy,    colorVar: "var(--accent)"  },
    { label: "Posición global",        value: leaderboard?.globalRank ? `#${leaderboard.globalRank}` : "—", icon: TrendingUp, colorVar: "var(--success)" },
    { label: "Partidos pronosticados", value: leaderboard?.matchesPlayed ?? 0,                         icon: Target,    colorVar: "var(--primary)" },
    { label: "Marcadores exactos",     value: leaderboard?.exactScores ?? 0,                           icon: Star,      colorVar: "var(--warning)" },
    { label: "Ganadores correctos",    value: leaderboard?.correctWinners ?? 0,                        icon: Zap,       colorVar: "var(--success)" },
    { label: "Accuracy",               value: `${(leaderboard?.accuracy ?? 0).toFixed(1)}%`,           icon: Target,    colorVar: "var(--accent)"  },
  ];

  return (
    <div className="page-stack">
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Mis Estadísticas</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Tu rendimiento en el Mundial 2026</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))", gap: "1rem" }}>
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="card-content" style={{ paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.label}</p>
                  <p className="font-display font-bold" style={{ fontSize: "1.875rem", marginTop: "0.25rem", color: s.colorVar }}>
                    {s.value}
                  </p>
                </div>
                <s.icon size={20} style={{ color: s.colorVar, opacity: 0.6, flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Points breakdown */}
      {scores.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Puntos por categoría</div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { label: "Resultados exactos",   value: totalByCategory.exactScore   },
                { label: "Ganadores correctos",  value: totalByCategory.winner       },
                { label: "Goleadores",           value: totalByCategory.topScorer    },
                { label: "Primeros goleadores",  value: totalByCategory.firstScorer  },
                { label: "MVP",                  value: totalByCategory.mvp          },
                { label: "Tarjetas amarillas",   value: totalByCategory.yellowCards  },
                { label: "Tarjetas rojas",       value: totalByCategory.redCards     },
                { label: "Más pases",            value: totalByCategory.mostPasses   },
                { label: "Bonus perfecto",       value: totalByCategory.perfectBonus },
              ].map((cat) => {
                const total = leaderboard?.totalPoints || 1;
                const pct = Math.round((cat.value / total) * 100);
                return (
                  <div key={cat.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{cat.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>{cat.value} pts</span>
                    </div>
                    <div style={{ height: "0.375rem", borderRadius: "9999px", background: "var(--border)" }}>
                      <div style={{ height: "100%", borderRadius: "9999px", background: "var(--accent)", width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
