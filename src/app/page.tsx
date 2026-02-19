import Link from "next/link";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const WORLD_CUP_START = new Date("2026-06-11T18:00:00Z");

export default async function LandingPage() {
  const session = await auth();

  const top5 = await db.leaderboard.findMany({
    orderBy: { totalPoints: "desc" },
    take: 5,
    include: { user: { select: { name: true } } },
  });

  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 gap-8">
        <div className="space-y-4 max-w-3xl">
          <p className="text-[var(--accent)] font-semibold tracking-widest uppercase text-sm">
            🏆 FIFA World Cup 2026
          </p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-tight">
            Golazo<span className="gradient-text">Zone</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            La polla mundialista más completa. 104 partidos, 48 equipos, ranking en tiempo real.
          </p>
        </div>

        {/* Countdown */}
        <div className="glass rounded-[var(--radius-lg)] p-6 flex flex-col items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            El Mundial comienza en
          </p>
          <CountdownTimer targetDate={WORLD_CUP_START} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            11 Jun 2026 · Estadio Azteca, Ciudad de México
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button variant="accent" size="lg">Ir al Dashboard →</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button variant="accent" size="lg">Registrarse gratis</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Iniciar sesión</Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 max-w-lg w-full mt-4">
          {[
            { value: "104", label: "Partidos" },
            { value: "48", label: "Equipos" },
            { value: "24", label: "Pts máx/partido" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-black text-3xl gradient-text">{stat.value}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top 5 */}
      {top5.length > 0 && (
        <section className="px-4 pb-12 max-w-lg mx-auto w-full">
          <h2 className="text-center font-display font-bold text-xl mb-4" style={{ color: "var(--text-primary)" }}>
            🏅 Top Pronosticadores
          </h2>
          <div className="space-y-2">
            {top5.map((entry, i) => (
              <div key={entry.userId} className="glass rounded-[var(--radius)] px-4 py-3 flex items-center gap-3">
                <span className="text-lg font-bold w-6 text-center" style={{ color: "var(--accent)" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: "var(--primary)", color: "white" }}>
                  {entry.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                  {entry.user.name ?? "Anónimo"}
                </span>
                <span className="font-bold" style={{ color: "var(--accent)" }}>{entry.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-6 text-xs border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
        GolazoZone 2026 · Datos oficiales FIFA · USA / México / Canadá · 11 Jun – 19 Jul 2026
      </footer>
    </main>
  );
}
