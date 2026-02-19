"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchCard } from "@/components/fixture/match-card";
import { PredictionForm } from "@/components/predictions/prediction-form";
import type { MatchWithDetails } from "@/types";
import type { PredictionInput } from "@/lib/validations/prediction";

type Phase = "GROUP_STAGE" | "ROUND_OF_32" | "QUARTER_FINALS" | "SEMI_FINALS" | "THIRD_PLACE" | "FINAL";

const TABS: { phase: Phase; label: string }[] = [
  { phase: "GROUP_STAGE", label: "Grupos A-L" },
  { phase: "ROUND_OF_32", label: "16avos" },
  { phase: "QUARTER_FINALS", label: "Cuartos" },
  { phase: "SEMI_FINALS", label: "Semis" },
  { phase: "THIRD_PLACE", label: "3er Puesto" },
  { phase: "FINAL", label: "🏆 Final" },
];

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function FixturePage() {
  const [activePhase, setActivePhase] = useState<Phase>("GROUP_STAGE");
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictingMatch, setPredictingMatch] = useState<MatchWithDetails | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ phase: activePhase });
    if (activePhase === "GROUP_STAGE") params.set("group", activeGroup);

    fetch(`/api/matches?${params}`)
      .then((r) => r.json())
      .then((data) => { setMatches(data.matches ?? []); })
      .finally(() => setLoading(false));
  }, [activePhase, activeGroup]);

  const handlePredict = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) setPredictingMatch(match);
  };

  const handlePredictionSubmit = async (data: PredictionInput) => {
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      // Update match in list with new prediction
      setMatches((prev) =>
        prev.map((m) =>
          m.id === data.matchId
            ? { ...m, userPrediction: json.prediction }
            : m
        )
      );
      setPredictingMatch(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Fixture 2026</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">104 partidos · 12 Grupos · 6 Fases</p>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.phase}
            onClick={() => setActivePhase(tab.phase)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${activePhase === tab.phase
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Group filter (only for group stage) */}
      {activePhase === "GROUP_STAGE" && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`
                flex-shrink-0 w-10 h-10 rounded-[var(--radius-sm)] text-sm font-bold transition-all
                ${activeGroup === g
                  ? "bg-[var(--accent)] text-[#0F1117]"
                  : "bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}
              `}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Matches grid */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[var(--radius)] bg-[var(--bg-card)] animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePhase}-${activeGroup}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          >
            {matches.length === 0 ? (
              <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
                No hay partidos disponibles para esta fase
              </div>
            ) : (
              matches.map((match) => (
                <MatchCard key={match.id} match={match} onPredict={handlePredict} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Prediction modal */}
      <AnimatePresence>
        {predictingMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPredictingMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">
                Hacer pronóstico
              </h2>
              <PredictionForm
                match={predictingMatch}
                existing={predictingMatch.userPrediction ? {
                  matchId: predictingMatch.id,
                  homeScore: predictingMatch.userPrediction.homeScore,
                  awayScore: predictingMatch.userPrediction.awayScore,
                  topScorer: predictingMatch.userPrediction.topScorer ?? undefined,
                  firstScorer: predictingMatch.userPrediction.firstScorer ?? undefined,
                  mvp: predictingMatch.userPrediction.mvp ?? undefined,
                  yellowCards: predictingMatch.userPrediction.yellowCards ?? undefined,
                  redCards: predictingMatch.userPrediction.redCards ?? undefined,
                  mostPasses: predictingMatch.userPrediction.mostPasses ?? undefined,
                } : undefined}
                onSubmit={handlePredictionSubmit}
                onCancel={() => setPredictingMatch(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
