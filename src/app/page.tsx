import Link from "next/link";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const WORLD_CUP_START = new Date("2026-06-11T18:00:00Z");

const FEATURES = [
  {
    icon: "⚽",
    title: "Pronostica cada partido",
    desc: "104 partidos, desde la fase de grupos hasta la gran final. Predice marcador exacto, goleadores y más.",
  },
  {
    icon: "🏆",
    title: "Ranking en tiempo real",
    desc: "Sube posiciones con cada acierto. El sistema premia tanto el resultado como los detalles.",
  },
  {
    icon: "👥",
    title: "Grupos privados",
    desc: "Crea tu propia liga con amigos, familia o compañeros y compite en tu propio ranking.",
  },
  {
    icon: "🎯",
    title: "Hasta 24 pts por partido",
    desc: "Marcador exacto, primer goleador, MVP, tarjetas... Cada detalle cuenta.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  const top5 = await db.leaderboard.findMany({
    orderBy: { totalPoints: "desc" },
    take: 5,
    include: { user: { select: { name: true } } },
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── Nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,17,23,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
      }}>
        <div style={{
          maxWidth: "72rem", margin: "0 auto",
          padding: "0 1.25rem", height: "4rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span className="font-display font-black text-xl text-white">
            Golazo<span className="gradient-text">Zone</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {session ? (
              <Link href="/dashboard"><Button variant="accent" size="sm">Dashboard →</Button></Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
                <Link href="/register"><Button variant="accent" size="sm">Registrarse</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-gradient" style={{ padding: "5rem 1.25rem", textAlign: "center" }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.375rem 1rem", borderRadius: "9999px", marginBottom: "1.5rem",
            background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)",
            color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            🏆 FIFA World Cup 2026
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-white" style={{
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
            lineHeight: 1, letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
          }}>
            Golazo<span className="gradient-text">Zone</span>
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "var(--text-secondary)", lineHeight: 1.6,
            maxWidth: "38rem", margin: "0 auto 1.5rem",
          }}>
            La polla mundialista más completa. Pronostica, compite y vive el Mundial como nunca antes.
          </p>

          {/* Host countries */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.75rem", marginBottom: "2rem",
            color: "var(--text-muted)", fontSize: "0.875rem",
          }}>
            <span>🇺🇸 USA</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>🇲🇽 México</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>🇨🇦 Canadá</span>
          </div>

          {/* CTA */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "center",
            gap: "0.75rem", marginBottom: "3rem",
          }}>
            {session ? (
              <Link href="/dashboard"><Button variant="accent" size="xl">Ir al Dashboard →</Button></Link>
            ) : (
              <>
                <Link href="/register"><Button variant="accent" size="xl">Registrarse gratis</Button></Link>
                <Link href="/login"><Button variant="outline" size="lg">Iniciar sesión</Button></Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "2rem", paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            {[
              { value: "104", label: "Partidos" },
              { value: "48", label: "Equipos" },
              { value: "24", label: "Pts máx/partido" },
              { value: "3", label: "Países sede" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", minWidth: "5rem" }}>
                <p className="font-display font-black gradient-text" style={{ fontSize: "2.5rem", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Countdown ── */}
      <section style={{ padding: "3rem 1.25rem", background: "var(--bg)" }}>
        <div className="glass" style={{
          maxWidth: "22rem", margin: "0 auto",
          borderRadius: "var(--radius-lg)",
          padding: "2rem", textAlign: "center",
        }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.1em",
            color: "var(--text-muted)", marginBottom: "0.75rem",
          }}>
            El Mundial comienza en
          </p>
          <CountdownTimer targetDate={WORLD_CUP_START} />
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
            11 Jun 2026 · Estadio Azteca · Ciudad de México
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "4rem 1.25rem", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 className="font-display font-black" style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--text-primary)", marginBottom: "0.5rem",
            }}>
              ¿Cómo funciona?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Todo lo que necesitas para vivir el Mundial al máximo
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
            gap: "1rem",
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                <h3 style={{
                  fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.3,
                  color: "var(--text-primary)", marginBottom: "0.5rem",
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top 5 ── */}
      {top5.length > 0 && (
        <section style={{ padding: "4rem 1.25rem", background: "var(--bg)" }}>
          <div style={{ maxWidth: "32rem", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 className="font-display font-bold" style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: "var(--text-primary)", marginBottom: "0.25rem",
              }}>
                🏅 Top Pronosticadores
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Los mejores del ranking global
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {top5.map((entry, i) => (
                <div key={entry.userId} className="glass" style={{
                  borderRadius: "var(--radius)",
                  padding: "0.875rem 1.25rem",
                  display: "flex", alignItems: "center", gap: "0.875rem",
                }}>
                  <span style={{ fontSize: "1.25rem", width: "1.75rem", textAlign: "center", flexShrink: 0 }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</span>
                    )}
                  </span>
                  <div style={{
                    width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                    background: "var(--primary)", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.8rem", flexShrink: 0,
                  }}>
                    {entry.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span style={{
                    flex: 1, fontWeight: 500, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                    color: "var(--text-primary)",
                  }}>
                    {entry.user.name ?? "Anónimo"}
                  </span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--accent)" }}>
                    {entry.totalPoints} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      {!session && (
        <section className="hero-gradient" style={{ padding: "5rem 1.25rem", textAlign: "center" }}>
          <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
            <h2 className="font-display font-black text-white" style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "1rem",
            }}>
              ¿Listo para ganar?
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
              Únete gratis antes de que empiece el Mundial y no te pierdas ningún pronóstico.
            </p>
            <Link href="/register">
              <Button variant="accent" size="xl">Crear cuenta gratis</Button>
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={{
        textAlign: "center", padding: "1.5rem 1rem",
        fontSize: "0.75rem", color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-card)",
        marginTop: "auto",
      }}>
        GolazoZone 2026 · Datos oficiales FIFA · USA / México / Canadá · 11 Jun – 19 Jul 2026
      </footer>

    </div>
  );
}
