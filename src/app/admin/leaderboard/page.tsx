"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  totalPoints: number;
  globalRank: number;
  matchesPlayed: number;
  exactScores: number;
  accuracy: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: "1.25rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.25rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.25rem" }}>🥉</span>;
  return <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-muted)", display: "block", textAlign: "center" }}>{rank}</span>;
}

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=100")
      .then((r) => r.json())
      .then((data) => setEntries(data.leaderboard ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-stack">
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
          Ranking Global 🏆
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Vista de administrador · Historial de clasificación de los usuarios
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Trophy size={20} style={{ color: "var(--accent)" }} />
            Clasificación (Top 100)
          </div>
        </div>
        <div className="card-content-p0">
          {loading ? (
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "3rem" }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              Aún no hay participantes en el ranking
            </div>
          ) : (
            <div className="rows-divided">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="row-item"
                >
                  <div style={{ width: "2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <RankIcon rank={i + 1} />
                  </div>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                    {entry.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name ?? "Anónimo"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {entry.matchesPlayed} partidos · {entry.exactScores} exactos · {entry.accuracy.toFixed(0)}% acc
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="font-display font-bold" style={{ fontSize: "1.125rem", color: "var(--accent)" }}>
                      {entry.totalPoints}
                    </p>
                    <p style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
