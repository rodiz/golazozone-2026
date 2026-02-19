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
import { cn } from "@/lib/utils";

interface PredictionFormProps {
  match: MatchWithDetails;
  existing?: Partial<PredictionInput>;
  onSubmit: (data: PredictionInput) => Promise<void>;
  onCancel?: () => void;
}

const STEPS = [
  { id: "score", label: "Marcador", icon: Target },
  { id: "scorers", label: "Goleadores", icon: User },
  { id: "extras", label: "Extras", icon: Star },
];

export function PredictionForm({ match, existing, onSubmit, onCancel }: PredictionFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PredictionInput>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      matchId: match.id,
      homeScore: existing?.homeScore ?? 0,
      awayScore: existing?.awayScore ?? 0,
      topScorer: existing?.topScorer ?? "",
      firstScorer: existing?.firstScorer ?? "",
      mvp: existing?.mvp ?? "",
      yellowCards: existing?.yellowCards ?? 0,
      redCards: existing?.redCards ?? 0,
      mostPasses: existing?.mostPasses ?? "",
    },
  });

  const homeScore = watch("homeScore");
  const awayScore = watch("awayScore");

  const adjustScore = (field: "homeScore" | "awayScore", delta: number) => {
    const current = field === "homeScore" ? homeScore : awayScore;
    const next = Math.max(0, Math.min(30, (current ?? 0) + delta));
    setValue(field, next);
  };

  const doSubmit = async (data: PredictionInput) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  const homeTeamName = match.homeTeam?.name ?? match.homeSlotLabel ?? "Local";
  const awayTeamName = match.awayTeam?.name ?? match.awaySlotLabel ?? "Visitante";
  const homeFlag = match.homeTeam?.flag ?? "⏳";
  const awayFlag = match.awayTeam?.flag ?? "⏳";

  return (
    <form onSubmit={handleSubmit(doSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-4 text-2xl">
          <span>{homeFlag}</span>
          <span className="text-[var(--text-muted)] text-base font-bold">VS</span>
          <span>{awayFlag}</span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          {homeTeamName} vs {awayTeamName}
        </p>
        <div className="flex justify-center">
          <CountdownTimer targetDate={match.lockAt} compact />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 justify-center">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              step === i
                ? "bg-[var(--accent)] text-[#0F1117]"
                : "bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="score"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-center text-sm font-semibold text-[var(--text-secondary)]">
              ¿Cuál será el marcador final?
            </p>
            <div className="flex items-center justify-center gap-6">
              {/* Home score */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{homeTeamName}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => adjustScore("homeScore", -1)}
                    className="w-8 h-8 rounded-full bg-[var(--border)] hover:bg-[var(--primary)] text-white font-bold transition-colors flex items-center justify-center">−</button>
                  <span className="text-4xl font-bold font-display w-12 text-center tabular-nums text-[var(--text-primary)]">
                    {homeScore}
                  </span>
                  <button type="button" onClick={() => adjustScore("homeScore", 1)}
                    className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#0F1117] font-bold transition-colors flex items-center justify-center hover:opacity-90">+</button>
                </div>
              </div>

              <span className="text-3xl font-bold text-[var(--text-muted)] mt-6">–</span>

              {/* Away score */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{awayTeamName}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => adjustScore("awayScore", -1)}
                    className="w-8 h-8 rounded-full bg-[var(--border)] hover:bg-[var(--primary)] text-white font-bold transition-colors flex items-center justify-center">−</button>
                  <span className="text-4xl font-bold font-display w-12 text-center tabular-nums text-[var(--text-primary)]">
                    {awayScore}
                  </span>
                  <button type="button" onClick={() => adjustScore("awayScore", 1)}
                    className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#0F1117] font-bold transition-colors flex items-center justify-center hover:opacity-90">+</button>
                </div>
              </div>
            </div>

            {/* Winner display */}
            <div className="text-center">
              <span className={cn(
                "inline-block px-4 py-1.5 rounded-full text-sm font-semibold",
                homeScore > awayScore ? "bg-green-500/20 text-green-400" :
                awayScore > homeScore ? "bg-blue-500/20 text-blue-400" :
                "bg-yellow-500/20 text-yellow-400"
              )}>
                {homeScore > awayScore ? `Gana ${homeTeamName}` :
                 awayScore > homeScore ? `Gana ${awayTeamName}` :
                 "Empate"}
              </span>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="scorers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Input
              label="Goleador del partido"
              placeholder="Nombre del jugador"
              icon={<Target className="w-4 h-4" />}
              {...register("topScorer")}
            />
            <Input
              label="Primer goleador"
              placeholder="Nombre del jugador"
              icon={<User className="w-4 h-4" />}
              {...register("firstScorer")}
            />
            <Input
              label="MVP / Jugador del partido"
              placeholder="Nombre del jugador"
              icon={<Star className="w-4 h-4" />}
              {...register("mvp")}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="extras"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tarjetas amarillas"
                type="number"
                min={0}
                max={20}
                placeholder="0"
                icon={<Shield className="w-4 h-4 text-yellow-400" />}
                {...register("yellowCards", { valueAsNumber: true })}
              />
              <Input
                label="Tarjetas rojas"
                type="number"
                min={0}
                max={10}
                placeholder="0"
                icon={<Shield className="w-4 h-4 text-red-400" />}
                {...register("redCards", { valueAsNumber: true })}
              />
            </div>
            <Input
              label="Jugador con más pases"
              placeholder="Nombre del jugador"
              icon={<MessageSquare className="w-4 h-4" />}
              {...register("mostPasses")}
            />

            {/* Points preview */}
            <div className="rounded-[var(--radius-sm)] bg-[var(--bg-card-hover)] border border-[var(--border)] p-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">Puntos posibles si aciertas todo:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  ["Resultado exacto", "5 pts"],
                  ["Ganador correcto", "2 pts"],
                  ["Goleador", "3 pts"],
                  ["Primer goleador", "3 pts"],
                  ["MVP", "2 pts"],
                  ["Tarjetas amarillas", "1 pt"],
                  ["Tarjetas rojas", "2 pts"],
                  ["Más pases", "1 pt"],
                  ["Bonus perfecto", "5 pts"],
                ].map(([label, pts]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="text-[var(--accent)] font-semibold">{pts}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm">
                <span>Máximo posible</span>
                <span className="text-[var(--accent)]">24 pts</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={step === 0 ? onCancel : () => setStep(step - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? "Cancelar" : "Anterior"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={() => setStep(step + 1)}
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" variant="accent" size="sm" loading={loading}>
            <Send className="w-4 h-4" /> Guardar pronóstico
          </Button>
        )}
      </div>
    </form>
  );
}
