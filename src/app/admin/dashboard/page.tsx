import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Trophy, Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalPredictions,
    finishedMatches,
    scheduledMatches,
    topUsers,
  ] = await Promise.all([
    db.user.count({ where: { isBlocked: false } }),
    db.prediction.count(),
    db.match.count({ where: { status: "FINISHED" } }),
    db.match.count({ where: { status: "SCHEDULED" } }),
    db.leaderboard.findMany({
      orderBy: { totalPoints: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const avgPoints = await db.leaderboard.aggregate({ _avg: { totalPoints: true } });

  const kpis = [
    { label: "Usuarios activos", value: totalUsers, icon: Users, color: "text-[var(--primary)]" },
    { label: "Pronósticos totales", value: totalPredictions.toLocaleString(), icon: Target, color: "text-[var(--accent)]" },
    { label: "Partidos finalizados", value: `${finishedMatches}/104`, icon: CalendarDays, color: "text-[var(--success)]" },
    { label: "Pts promedio", value: Math.round(avgPoints._avg.totalPoints ?? 0), icon: Trophy, color: "text-[var(--warning)]" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {scheduledMatches} partidos pendientes de resultado
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{kpi.label}</p>
                  <p className={`text-3xl font-display font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top 5 Jugadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUsers.map((entry, i) => (
              <div key={entry.userId} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                    {entry.user.name ?? entry.user.email}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{entry.matchesPlayed} partidos</p>
                </div>
                <span className="font-bold text-[var(--accent)]">{entry.totalPoints} pts</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/admin/matches", label: "📋 Cargar resultado de partido" },
              { href: "/admin/users", label: "👥 Gestionar usuarios" },
              { href: "/admin/scoring", label: "⚙️ Configurar puntos" },
              { href: "/admin/notifications", label: "🔔 Enviar notificación" },
              { href: "/admin/audit", label: "📋 Ver logs de auditoría" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="block px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-card-hover)] hover:bg-[var(--border)] transition-colors text-sm text-[var(--text-primary)]"
              >
                {action.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
