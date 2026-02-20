"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Target, User, Star, Shield, MessageSquare, ChevronRight, ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { predictionSchema, type PredictionInput } from "@/lib/validations/prediction";
import type { MatchWithDetails } from "@/types";

interface PredictionFormProps {
  match: MatchWithDetails;
  existing?: Partial<PredictionInput>;
  onSubmit: (data: PredictionInput) => Promise<void>;
  onCancel?: () => void;
}

const STEPS = [
  { id: "score",   label: "Marcador",   icon: Target },
  { id: "scorers", label: "Goleadores", icon: User },
  { id: "extras",  label: "Extras",     icon: Star },
];

const POINTS_BREAKDOWN = [
  ["Resultado exacto", "5 pts"],
  ["Ganador correcto", "2 pts"],
  ["Goleador",         "3 pts"],
  ["Primer goleador",  "3 pts"],
  ["MVP",              "2 pts"],
  ["Tarjetas amarillas","1 pt"],
  ["Tarjetas rojas",   "2 pts"],
  ["Más pases",        "1 pt"],
  ["Bonus perfecto",   "5 pts"],
];

export function PredictionForm({ match, existing, onSubmit, onCancel }: PredictionFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PredictionInput>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      matchId:     match.id,
      homeScore:   existing?.homeScore   ?? 0,
      awayScore:   existing?.awayScore   ?? 0,
      topScorer:   existing?.topScorer   ?? "",
      firstScorer: existing?.firstScorer ?? "",
      mvp:         existing?.mvp         ?? "",
      yellowCards: existing?.yellowCards ?? 0,
      redCards:    existing?.redCards    ?? 0,
      mostPasses:  existing?.mostPasses  ?? "",
    },
  });

  const homeScore = watch("homeScore");
  const awayScore = watch("awayScore");

  const adjustScore = (field: "homeScore" | "awayScore", delta: number) => {
    const current = field === "homeScore" ? homeScore : awayScore;
    setValue(field, Math.max(0, Math.min(30, (current ?? 0) + delta)));
  };

  const doSubmit = async (data: PredictionInput) => {
    setLoading(true);
    try { await onSubmit(data); } finally { setLoading(false); }
  };

  const homeTeam = match.homeTeam ?? (match as any).home ?? null;
  const awayTeam = match.awayTeam ?? (match as any).away ?? null;
  const homeTeamName = homeTeam?.name ?? match.homeSlotLabel ?? "Local";
  const awayTeamName = awayTeam?.name ?? match.awaySlotLabel ?? "Visitante";
  const homeFlag = homeTeam?.flag ?? "⏳";
  const awayFlag = awayTeam?.flag ?? "⏳";

  const winnerStyle = (condition: boolean, color: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "0.375rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 600,
    background: condition ? `rgba(${color},0.2)` : undefined,
    color: condition ? `rgb(${color})` : undefined,
  });

  const isDraw = homeScore === awayScore;
  const homeWins = homeScore > awayScore;

  return (
    <form
      onSubmit={handleSubmit(doSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
    >
      {/* Match header */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", fontSize: "1.5rem" }}>
          <span>{homeFlag}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 700 }}>VS</span>
          <span>{awayFlag}</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{homeTeamName} vs {awayTeamName}</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CountdownTimer targetDate={match.lockAt} compact />
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={`tab-pill ${step === i ? "active" : "inactive"}`}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <s.icon size={12} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="score" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              ¿Cuál será el marcador final?
            </p>

            {/* Scorers */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
              {(["homeScore", "awayScore"] as const).map((field) => {
                const val = field === "homeScore" ? homeScore : awayScore;
                const name = field === "homeScore" ? homeTeamName : awayTeamName;
                return (
                  <div key={field} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>{name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button type="button" onClick={() => adjustScore(field, -1)} className="score-btn score-btn-minus">−</button>
                      <span className="font-display font-bold" style={{ fontSize: "2.5rem", width: "3rem", textAlign: "center", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                        {val}
                      </span>
                      <button type="button" onClick={() => adjustScore(field, 1)} className="score-btn score-btn-plus">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Winner indicator */}
            <div style={{ textAlign: "center" }}>
              <span style={{
                display: "inline-block", padding: "0.375rem 1rem", borderRadius: "9999px",
                fontSize: "0.875rem", fontWeight: 600,
                background: homeWins ? "rgba(34,197,94,0.2)" : !isDraw ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                color: homeWins ? "#4ade80" : !isDraw ? "#60a5fa" : "#fbbf24",
              }}>
                {homeWins ? `Gana ${homeTeamName}` : !isDraw ? `Gana ${awayTeamName}` : "Empate"}
              </span>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="scorers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input label="Goleador del partido"  placeholder="Nombre del jugador" icon={<Target size={16} />} {...register("topScorer")} />
            <Input label="Primer goleador"        placeholder="Nombre del jugador" icon={<User size={16} />}   {...register("firstScorer")} />
            <Input label="MVP / Jugador del partido" placeholder="Nombre del jugador" icon={<Star size={16} />}   {...register("mvp")} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="extras" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input label="Tarjetas amarillas" type="number" min={0} max={20} placeholder="0"
                icon={<Shield size={16} style={{ color: "#fbbf24" }} />}
                {...register("yellowCards", { valueAsNumber: true })} />
              <Input label="Tarjetas rojas" type="number" min={0} max={10} placeholder="0"
                icon={<Shield size={16} style={{ color: "#f87171" }} />}
                {...register("redCards", { valueAsNumber: true })} />
            </div>
            <Input label="Jugador con más pases" placeholder="Nombre del jugador"
              icon={<MessageSquare size={16} />} {...register("mostPasses")} />

            {/* Points preview */}
            <div style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.625rem" }}>Puntos posibles si aciertas todo:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem 0.5rem" }}>
                {POINTS_BREAKDOWN.map(([label, pts]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{pts}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.875rem" }}>
                <span>Máximo posible</span>
                <span style={{ color: "var(--accent)" }}>24 pts</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <Button type="button" variant="outline" size="sm" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>
          <ChevronLeft size={16} />
          {step === 0 ? "Cancelar" : "Anterior"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" variant="accent" size="sm" onClick={() => setStep(step + 1)}>
            Siguiente <ChevronRight size={16} />
          </Button>
        ) : (
          <Button type="submit" variant="accent" size="sm" loading={loading}>
            <Send size={16} /> Guardar pronóstico
          </Button>
        )}
      </div>
    </form>
  );
}
