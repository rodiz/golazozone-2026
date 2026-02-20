"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { MatchWithDetails } from "@/types";

interface StandingRow {
  id: string;
  name: string;
  flag: string;
  shortCode: string;
  mp: number; // matches played (with prediction)
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

function buildStandings(matches: MatchWithDetails[]): StandingRow[] {
  const teams = new Map<string, StandingRow>();

  // Register every team present in the group's matches
  for (const match of matches) {
    const home = match.homeTeam ?? match.home ?? null;
    const away = match.awayTeam ?? match.away ?? null;
    if (home?.id && !teams.has(home.id)) {
      teams.set(home.id, {
        id: home.id, name: home.name, flag: home.flag,
        shortCode: home.shortCode, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0,
      });
    }
    if (away?.id && !teams.has(away.id)) {
      teams.set(away.id, {
        id: away.id, name: away.name, flag: away.flag,
        shortCode: away.shortCode, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0,
      });
    }
  }

  // Accumulate stats only from matches the user has predicted
  for (const match of matches) {
    const pred = match.userPrediction;
    if (!pred) continue;

    const home = match.homeTeam ?? match.home ?? null;
    const away = match.awayTeam ?? match.away ?? null;
    if (!home?.id || !away?.id) continue;

    const hRow = teams.get(home.id);
    const aRow = teams.get(away.id);
    if (!hRow || !aRow) continue;

    const hs = pred.homeScore ?? 0;
    const as_ = pred.awayScore ?? 0;

    hRow.mp++; aRow.mp++;
    hRow.gf += hs; hRow.ga += as_;
    aRow.gf += as_; aRow.ga += hs;

    if (hs > as_) {
      hRow.w++; aRow.l++;
    } else if (hs === as_) {
      hRow.d++; aRow.d++;
    } else {
      hRow.l++; aRow.w++;
    }
  }

  // Sort: pts → GD → GF → name
  return Array.from(teams.values()).sort((a, b) => {
    const pA = a.w * 3 + a.d, pB = b.w * 3 + b.d;
    if (pB !== pA) return pB - pA;
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

export function GroupStandingsTable({ matches }: { matches: MatchWithDetails[] }) {
  const standings = useMemo(() => buildStandings(matches), [matches]);
  const predictedCount = matches.filter((m) => !!m.userPrediction).length;
  const totalMatches   = matches.length;

  if (standings.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
        No hay equipos disponibles para este grupo
      </div>
    );
  }

  return (
    <div className="card">
      {/* Info banner */}
      <div style={{
        padding: "0.75rem 1.25rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card-hover)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <span>📊</span>
          <span>Tabla proyectada según tus pronósticos</span>
        </div>
        <span style={{
          fontSize: "0.75rem", fontWeight: 600, padding: "0.125rem 0.625rem",
          borderRadius: "9999px",
          background: predictedCount === totalMatches ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
          color: predictedCount === totalMatches ? "var(--success)" : "var(--warning)",
        }}>
          {predictedCount}/{totalMatches} pronosticados
        </span>
      </div>

      {predictedCount === 0 && (
        <div style={{
          padding: "0.75rem 1.25rem",
          background: "rgba(245,158,11,0.06)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
          fontSize: "0.8rem", color: "var(--warning)",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          ⚡ Haz tus pronósticos en la vista &ldquo;Partidos&rdquo; para ver cómo quedaría la tabla
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              {[
                { label: "#",   color: "var(--text-muted)",    align: "center" as const, width: "2.5rem" },
                { label: "Equipo", color: "var(--text-muted)", align: "left"   as const, width: undefined },
                { label: "PJ",  color: "var(--text-muted)",    align: "center" as const, width: "3rem"  },
                { label: "PTS", color: "var(--accent)",         align: "center" as const, width: "3rem"  },
                { label: "W",   color: "var(--success)",        align: "center" as const, width: "3rem"  },
                { label: "E",   color: "var(--warning)",        align: "center" as const, width: "3rem"  },
                { label: "D",   color: "var(--danger)",         align: "center" as const, width: "3rem"  },
                { label: "GF",  color: "var(--text-muted)",    align: "center" as const, width: "3rem"  },
                { label: "GC",  color: "var(--text-muted)",    align: "center" as const, width: "3rem"  },
                { label: "DF",  color: "var(--text-muted)",    align: "center" as const, width: "3.5rem"},
              ].map((h) => (
                <th key={h.label} style={{
                  padding: "0.75rem 0.625rem",
                  textAlign: h.align,
                  fontSize: "0.675rem", fontWeight: 700,
                  color: h.color,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  width: h.width,
                  whiteSpace: "nowrap",
                }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const pts = row.w * 3 + row.d;
              const gd  = row.gf - row.ga;
              const qualifies = i < 2; // top 2 advance in FIFA 2026 group stage

              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    borderBottom: i < standings.length - 1 ? "1px solid var(--border)" : "none",
                    background: qualifies && row.mp > 0 ? "rgba(34,197,94,0.04)" : undefined,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = qualifies && row.mp > 0 ? "rgba(34,197,94,0.04)" : "")}
                >

                  {/* Position bubble */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "1.625rem", height: "1.625rem", borderRadius: "50%",
                      fontSize: "0.75rem", fontWeight: 700,
                      background: i === 0 ? "var(--accent)"
                        : i === 1 ? "rgba(201,168,76,0.25)"
                        : "transparent",
                      color: i === 0 ? "#0F1117" : "var(--text-muted)",
                    }}>
                      {i + 1}
                    </span>
                  </td>

                  {/* Team */}
                  <td style={{ padding: "0.75rem 0.625rem 0.75rem 0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      {/* Qualifying bar */}
                      <div style={{
                        width: "3px", alignSelf: "stretch", borderRadius: "9999px", flexShrink: 0,
                        background: qualifies ? "var(--success)" : "transparent",
                        opacity: row.mp > 0 ? 1 : 0.3,
                      }} />
                      <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>{row.flag}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.name}
                        </p>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "0.1rem" }}>
                          {row.shortCode}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* PJ */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    {row.mp}
                  </td>

                  {/* PTS */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center" }}>
                    <span className="font-display font-bold" style={{ fontSize: "1.05rem", color: "var(--accent)" }}>
                      {pts}
                    </span>
                  </td>

                  {/* W */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", fontWeight: row.w > 0 ? 700 : 400, color: row.w > 0 ? "var(--success)" : "var(--text-muted)" }}>
                    {row.w}
                  </td>

                  {/* E */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", fontWeight: row.d > 0 ? 700 : 400, color: row.d > 0 ? "var(--warning)" : "var(--text-muted)" }}>
                    {row.d}
                  </td>

                  {/* D */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", fontWeight: row.l > 0 ? 700 : 400, color: row.l > 0 ? "var(--danger)" : "var(--text-muted)" }}>
                    {row.l}
                  </td>

                  {/* GF */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    {row.gf}
                  </td>

                  {/* GC */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    {row.ga}
                  </td>

                  {/* DF */}
                  <td style={{ padding: "0.75rem 0.625rem", textAlign: "center" }}>
                    <span style={{
                      fontWeight: 700, fontSize: "0.875rem",
                      color: gd > 0 ? "var(--success)" : gd < 0 ? "var(--danger)" : "var(--text-muted)",
                    }}>
                      {gd > 0 ? `+${gd}` : gd}
                    </span>
                  </td>

                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        padding: "0.625rem 1.25rem", borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
          <div style={{ width: "3px", height: "0.875rem", borderRadius: "9999px", background: "var(--success)" }} />
          Clasifican a 16avos
        </div>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>·</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Proyección basada en tus pronósticos</span>
      </div>
    </div>
  );
}
