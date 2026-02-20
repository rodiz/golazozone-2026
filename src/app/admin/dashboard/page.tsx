import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
    { label: "Usuarios activos",    value: totalUsers,                              icon: Users,        colorVar: "var(--primary)"  },
    { label: "Pronósticos totales", value: totalPredictions.toLocaleString(),       icon: Target,       colorVar: "var(--accent)"   },
    { label: "Partidos finalizados",value: `${finishedMatches}/104`,               icon: CalendarDays, colorVar: "var(--success)"  },
    { label: "Pts promedio",        value: Math.round(avgPoints._avg.totalPoints ?? 0), icon: Trophy,   colorVar: "var(--warning)"  },
  ];

  return (
    <div className="page-stack">
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Admin Dashboard</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          {scheduledMatches} partidos pendientes de resultado
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))", gap: "1rem" }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="card-content" style={{ paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="font-display font-bold" style={{ fontSize: "1.875rem", marginTop: "0.25rem", color: kpi.colorVar }}>
                    {kpi.value}
                  </p>
                </div>
                <kpi.icon size={20} style={{ color: kpi.colorVar, opacity: 0.6, flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.5rem" }}>
        {/* Top 5 players */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Top 5 Jugadores</div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {topUsers.map((entry, i) => (
                <div key={entry.userId} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.125rem", width: "1.5rem", textAlign: "center", flexShrink: 0 }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.user.name ?? entry.user.email}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{entry.matchesPlayed} partidos</p>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>{entry.totalPoints} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ Acciones rápidas</div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: "/admin/matches",       label: "📋 Cargar resultado de partido" },
                { href: "/admin/users",         label: "👥 Gestionar usuarios" },
                { href: "/admin/scoring",       label: "⚙️ Configurar puntos" },
                { href: "/admin/notifications", label: "🔔 Enviar notificación" },
                { href: "/admin/audit",         label: "📋 Ver logs de auditoría" },
              ].map((action) => (
                <a key={action.href} href={action.href} className="quick-action-link">
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
