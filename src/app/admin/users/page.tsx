import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Usuarios" };

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  verticalAlign: "middle",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      leaderboard: { select: { totalPoints: true, globalRank: true } },
      _count: { select: { predictions: true } },
    },
  });

  const getRoleBadgeStyle = (role: string): React.CSSProperties => {
    if (role === "SUPERADMIN") return { background: "rgba(239,68,68,0.2)", color: "#f87171" };
    if (role === "ADMIN") return { background: "rgba(26,60,110,0.3)", color: "#60a5fa" };
    return { background: "var(--border)", color: "var(--text-muted)" };
  };

  return (
    <div className="page-stack">
      <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
        Usuarios ({users.length})
      </h1>

      <div className="card">
        <div className="card-content-p0" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Nombre", "Email", "Rol", "Verificado", "Pronósticos", "Puntos", "Rank", "Estado"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table-row-hover" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span style={{ fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "7.5rem" }}>
                        {user.name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-secondary)", fontSize: "0.75rem" }}>{user.email}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 700, ...getRoleBadgeStyle(user.role) }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {user.emailVerified ? "✅" : "❌"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--text-secondary)" }}>
                    {user._count.predictions}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "var(--accent)" }}>
                    {user.leaderboard?.totalPoints ?? 0}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--text-muted)" }}>
                    {user.leaderboard?.globalRank ? `#${user.leaderboard.globalRank}` : "—"}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: "0.75rem", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-sm)", ...(user.isBlocked ? { background: "rgba(239,68,68,0.2)", color: "#f87171" } : { color: "var(--text-muted)" }) }}>
                      {user.isBlocked ? "Bloqueado" : "Activo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
