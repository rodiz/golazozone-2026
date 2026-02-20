import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Auditoría" };

const ACTION_COLORS: Record<string, string> = {
  RESULT_CREATED:  "var(--success)",
  SCORING_UPDATED: "var(--warning)",
  USER_BLOCKED:    "var(--danger)",
  USER_ROLE_CHANGED: "var(--primary)",
};

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="page-stack">
      <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
        Log de Auditoría
      </h1>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Últimas 100 acciones admin</div>
        </div>
        <div className="card-content-p0">
          {logs.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
              Sin registros de auditoría
            </p>
          ) : (
            <div className="rows-divided">
              {logs.map((log) => (
                <div key={log.id} className="row-item" style={{ alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, width: "8rem", textAlign: "right" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: ACTION_COLORS[log.action] ?? "var(--text-primary)" }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                      en {log.entity}{log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ""}
                    </span>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      por {log.user.name ?? log.user.email}
                      {log.ip && ` · ${log.ip}`}
                    </p>
                    {log.metadata && (
                      <pre style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginTop: "0.25rem", background: "var(--bg-card-hover)", borderRadius: "var(--radius-sm)", padding: "0.25rem 0.5rem", overflowX: "auto" }}>
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
