"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  globalRank: number;
  rank: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: "1.25rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.25rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.25rem" }}>🥉</span>;
  return <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-muted)", display: "block", textAlign: "center" }}>{rank}</span>;
}

export default function GroupLeaderboardPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leaderboard?limit=100&groupId=${id}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.leaderboard ?? []))
      .catch((e) => console.error("Error fetching group leaderboard", e))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page-stack">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <Button variant="ghost" size="sm" onClick={() => router.push("/groups")} style={{ marginTop: "0.25rem", padding: "0.375rem" }}>
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Ranking del Grupo 🏆</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Clasificación exclusiva entre los miembros de este grupo</p>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} style={{ color: "var(--accent)" }} />
            Tabla de Posiciones
          </div>
        </div>

        <div className="card-content-p0">
          {loading ? (
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "3rem" }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              No hay suficientes datos del grupo
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
                    <RankIcon rank={entry.rank} />
                  </div>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                    {entry.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name ?? "Anónimo"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ranking global: #{entry.globalRank}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="font-display font-bold" style={{ fontSize: "1.1rem", color: "var(--accent)" }}>{entry.totalPoints}</p>
                    <p style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>pts grupo</p>
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
