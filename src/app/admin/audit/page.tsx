import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Auditoría" };

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

  const actionColors: Record<string, string> = {
    RESULT_CREATED: "text-[var(--success)]",
    SCORING_UPDATED: "text-[var(--warning)]",
    USER_BLOCKED: "text-[var(--danger)]",
    USER_ROLE_CHANGED: "text-[var(--primary)]",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
        Log de Auditoría
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Últimas 100 acciones admin</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="p-6 text-center text-[var(--text-muted)]">Sin registros de auditoría</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex-shrink-0 w-32 text-right">
                    <p className="text-xs text-[var(--text-muted)]">
                      {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold ${actionColors[log.action] ?? "text-[var(--text-primary)]"}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] ml-2">
                      en {log.entity}{log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ""}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      por {log.user.name ?? log.user.email}
                      {log.ip && ` · ${log.ip}`}
                    </p>
                    {log.metadata && (
                      <pre className="text-[10px] text-[var(--text-muted)] mt-1 bg-[var(--bg-card-hover)] rounded p-1 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
