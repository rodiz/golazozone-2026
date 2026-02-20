import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MatchCard } from "@/components/fixture/match-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Pronósticos" };

const matchGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  gap: "0.75rem",
};

export default async function PredictionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const predictions = await db.prediction.findMany({
    where: { userId: session.user.id },
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
    orderBy: { match: { dateUTC: "asc" } },
  });

  const pending  = predictions.filter((p) => p.match.status === "SCHEDULED" && !p.lockedAt);
  const locked   = predictions.filter((p) => p.match.status === "SCHEDULED" && p.lockedAt);
  const finished = predictions.filter((p) => p.match.status === "FINISHED");

  const totalPoints = finished.reduce((acc, p) => acc + (p.score?.totalPoints ?? 0), 0);

  return (
    <div className="page-stack">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
            Mis Pronósticos
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {predictions.length} pronósticos · {totalPoints} puntos acumulados
          </p>
        </div>
      </div>

      {predictions.length === 0 && (
        <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📋</span>
          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>Aún no tienes pronósticos</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Ve al fixture y empieza a pronosticar</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="page-stack-sm">
          <h2 style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
            Pendientes ({pending.length})
          </h2>
          <div style={matchGrid}>
            {pending.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="page-stack-sm">
          <h2 style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
            Cerrados ({locked.length})
          </h2>
          <div style={matchGrid}>
            {locked.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="page-stack-sm">
          <h2 style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }} />
            Finalizados ({finished.length})
          </h2>
          <div style={matchGrid}>
            {finished.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
