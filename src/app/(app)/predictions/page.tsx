import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MatchCard } from "@/components/fixture/match-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Pronósticos" };

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

  const pending = predictions.filter((p) => p.match.status === "SCHEDULED" && !p.lockedAt);
  const locked = predictions.filter((p) => p.match.status === "SCHEDULED" && p.lockedAt);
  const finished = predictions.filter((p) => p.match.status === "FINISHED");

  const totalPoints = finished.reduce((acc, p) => acc + (p.score?.totalPoints ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
            Mis Pronósticos
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {predictions.length} pronósticos · {totalPoints} puntos acumulados
          </p>
        </div>
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <span className="text-5xl block mb-4">📋</span>
          <p className="font-semibold text-[var(--text-primary)]">Aún no tienes pronósticos</p>
          <p className="text-sm mt-1">Ve al fixture y empieza a pronosticar</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse inline-block" />
            Pendientes ({pending.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pending.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--danger)] inline-block" />
            Cerrados ({locked.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {locked.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] inline-block" />
            Finalizados ({finished.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {finished.map((p) => (
              <MatchCard key={p.id} match={{ ...p.match, homeTeam: p.match.home, awayTeam: p.match.away, userPrediction: p }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
