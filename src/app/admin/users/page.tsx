import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Usuarios" };

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

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
        Usuarios ({users.length})
      </h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Nombre", "Email", "Rol", "Verificado", "Pronósticos", "Puntos", "Rank", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                          {user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === "SUPERADMIN" ? "bg-red-500/20 text-red-400" :
                        user.role === "ADMIN" ? "bg-[var(--primary)]/30 text-blue-400" :
                        "bg-[var(--border)] text-[var(--text-muted)]"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.emailVerified ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                      {user._count.predictions}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[var(--accent)]">
                      {user.leaderboard?.totalPoints ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                      {user.leaderboard?.globalRank ? `#${user.leaderboard.globalRank}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${user.isBlocked ? "bg-red-500/20 text-red-400" : "text-[var(--text-muted)]"}`}>
                        {user.isBlocked ? "Bloqueado" : "Activo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
