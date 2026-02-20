"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchCard } from "@/components/fixture/match-card";
import { PredictionForm } from "@/components/predictions/prediction-form";
import type { MatchWithDetails } from "@/types";
import type { PredictionInput } from "@/lib/validations/prediction";

type Phase = "GROUP_STAGE" | "ROUND_OF_32" | "QUARTER_FINALS" | "SEMI_FINALS" | "THIRD_PLACE" | "FINAL";

const TABS: { phase: Phase; label: string }[] = [
  { phase: "GROUP_STAGE",    label: "Grupos A-L" },
  { phase: "ROUND_OF_32",   label: "16avos" },
  { phase: "QUARTER_FINALS",label: "Cuartos" },
  { phase: "SEMI_FINALS",   label: "Semis" },
  { phase: "THIRD_PLACE",   label: "3er Puesto" },
  { phase: "FINAL",         label: "🏆 Final" },
];

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

const skeletonGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  gap: "0.75rem",
};

export default function FixturePage() {
  const [activePhase, setActivePhase] = useState<Phase>("GROUP_STAGE");
  const [activeGroup, setActiveGroup] = useState("A");
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictingMatch, setPredictingMatch] = useState<MatchWithDetails | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ phase: activePhase });
    if (activePhase === "GROUP_STAGE") params.set("group", activeGroup);
    fetch(`/api/matches?${params}`)
      .then((r) => r.json())
      .then((data) => setMatches(data.matches ?? []))
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
      setMatches((prev) => prev.map((m) => m.id === data.matchId ? { ...m, userPrediction: json.prediction } : m));
      setPredictingMatch(null);
    }
  };

  return (
    <div className="page-stack">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Fixture 2026</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>104 partidos · 12 Grupos · 6 Fases</p>
      </div>

      {/* Phase tabs */}
      <div className="tabs-scroll">
        {TABS.map((tab) => (
          <button
            key={tab.phase}
            onClick={() => setActivePhase(tab.phase)}
            className={`tab-pill ${activePhase === tab.phase ? "active" : "inactive"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Group filter */}
      {activePhase === "GROUP_STAGE" && (
        <div className="tabs-scroll">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`tab-square ${activeGroup === g ? "active" : "inactive"}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Matches grid */}
      {loading ? (
        <div style={skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "10rem" }} />
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
            style={skeletonGrid}
          >
            {matches.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
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
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: "100%", maxWidth: "28rem", maxHeight: "90vh", overflowY: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "0 24px 48px rgba(0,0,0,0.4)", position: "relative" }}
            >
              <button
                onClick={() => setPredictingMatch(null)}
                style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", borderRadius: "var(--radius-sm)", lineHeight: 1 }}
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <h2 className="font-display font-bold" style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
                Hacer pronóstico
              </h2>
              <PredictionForm
                match={predictingMatch}
                existing={predictingMatch.userPrediction ? {
                  matchId: predictingMatch.id,
                  homeScore: predictingMatch.userPrediction.homeScore,
                  awayScore: predictingMatch.userPrediction.awayScore,
                  topScorer:   predictingMatch.userPrediction.topScorer   ?? undefined,
                  firstScorer: predictingMatch.userPrediction.firstScorer ?? undefined,
                  mvp:         predictingMatch.userPrediction.mvp         ?? undefined,
                  yellowCards: predictingMatch.userPrediction.yellowCards ?? undefined,
                  redCards:    predictingMatch.userPrediction.redCards    ?? undefined,
                  mostPasses:  predictingMatch.userPrediction.mostPasses  ?? undefined,
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
