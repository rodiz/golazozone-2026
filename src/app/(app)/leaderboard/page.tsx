"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  globalRank: number;
  matchesPlayed: number;
  exactScores: number;
  accuracy: number;
  isCurrentUser: boolean;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-[var(--text-muted)] w-6 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=100")
      .then((r) => r.json())
      .then((data) => setEntries(data.leaderboard ?? []))
      .finally(() => setLoading(false));
  }, []);

  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
          Ranking Global 🏆
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Clasificación en tiempo real · se actualiza tras cada resultado
        </p>
      </div>

      {/* Current user stats */}
      {currentUser && (
        <div className="colombia-card rounded-[var(--radius-lg)] p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-[#0F1117] text-lg flex-shrink-0">
            {currentUser.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text-primary)]">{currentUser.name}</p>
            <p className="text-xs text-[var(--text-muted)]">Tu posición</p>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-2xl text-[var(--accent)]">#{currentUser.globalRank}</p>
            <p className="text-xs text-[var(--text-muted)]">{currentUser.totalPoints} pts</p>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent)]" />
            Clasificación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 bg-[var(--bg-card-hover)] rounded animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)]">
              Aún no hay participantes en el ranking
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`
                    flex items-center gap-4 px-5 py-3.5 transition-colors
                    ${entry.isCurrentUser ? "bg-[var(--primary)]/10" : "hover:bg-[var(--bg-card-hover)]"}
                  `}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    <RankIcon rank={i + 1} />
                  </div>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: "var(--primary)", color: "white" }}>
                    {entry.name?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${entry.isCurrentUser ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                      {entry.name ?? "Anónimo"} {entry.isCurrentUser && "(tú)"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {entry.matchesPlayed} partidos · {entry.exactScores} exactos · {entry.accuracy.toFixed(0)}% acc
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-lg text-[var(--accent)]">
                      {entry.totalPoints}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
