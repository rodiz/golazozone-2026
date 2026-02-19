"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Trophy, Lock, Zap, CheckCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import type { MatchWithDetails, TeamInfo } from "@/types";

interface MatchCardProps {
  match: MatchWithDetails;
  onPredict?: (matchId: string) => void;
  className?: string;
}

function getMatchStatus(match: MatchWithDetails) {
  const now = new Date();
  const lockDate = new Date(match.lockAt);
  const hasResult = !!match.result;
  const hasPrediction = !!match.userPrediction;

  if (match.status === "LIVE") return "live";
  if (hasResult) return "finished";
  if (now >= lockDate) return "locked";
  if (hasPrediction) return "predicted";
  return "pending";
}

function TeamDisplay({ team, slotLabel, align = "left" }: {
  team: TeamInfo | null | undefined;
  slotLabel: string | null | undefined;
  align?: "left" | "right";
}) {
  const name = team ? (team.confirmed ? team.name : team.playoffSlotLabel ?? team.name) : slotLabel ?? "TBD";
  const flag = team?.flag ?? "⏳";
  const shortCode = team ? (team.confirmed ? team.shortCode : "TBD") : "TBD";

  return (
    <div className={cn("flex flex-col items-center gap-1 flex-1", align === "right" && "")}>
      <span className="text-3xl leading-none">{flag}</span>
      <span className="font-bold text-sm text-[var(--text-primary)] text-center leading-tight max-w-[90px]">
        {name}
      </span>
      <span className="text-xs text-[var(--text-muted)] font-mono">{shortCode}</span>
    </div>
  );
}

export function MatchCard({ match, onPredict, className }: MatchCardProps) {
  const status = getMatchStatus(match);
  const pred = match.userPrediction;
  const result = match.result;
  // Support both homeTeam/awayTeam (API) and home/away (Prisma direct)
  const homeTeam = match.homeTeam ?? (match as any).home ?? null;
  const awayTeam = match.awayTeam ?? (match as any).away ?? null;

  const statusBadge = {
    pending: <Badge variant="pending" className="animate-pulse">⏳ Pendiente</Badge>,
    predicted: <Badge variant="success"><CheckCircle className="w-3 h-3" /> Pronosticado</Badge>,
    locked: <Badge variant="locked"><Lock className="w-3 h-3" /> Cerrado</Badge>,
    live: <Badge variant="live"><Zap className="w-3 h-3" /> EN VIVO</Badge>,
    finished: <Badge variant="finished"><Trophy className="w-3 h-3" /> Finalizado</Badge>,
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)]",
        "overflow-hidden shadow-sm hover:shadow-md transition-shadow",
        match.isFeatured && "colombia-card",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-card-hover)] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-muted)]">
            📅 {match.dateColombia.replace("T", " ").slice(0, 16)} (COL)
          </span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            🏟 {match.venue}, {match.city}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {match.group && (
            <span className="text-xs text-[var(--text-muted)]">
              Grupo {match.group.letter} · J{match.matchday}
            </span>
          )}
          {statusBadge}
        </div>
      </div>

      {/* Teams */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <TeamDisplay team={homeTeam} slotLabel={match.homeSlotLabel} />

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            {(status === "finished" || status === "live") && result ? (
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  result.winner === "HOME" ? "text-[var(--success)]" : "text-[var(--text-primary)]"
                )}>{result.homeScore}</span>
                <span className="text-[var(--text-muted)]">–</span>
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  result.winner === "AWAY" ? "text-[var(--success)]" : "text-[var(--text-primary)]"
                )}>{result.awayScore}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[var(--text-muted)]">VS</span>
            )}
            <span className="text-[10px] text-[var(--text-muted)]">#{match.matchNumber}</span>
          </div>

          <TeamDisplay team={awayTeam} slotLabel={match.awaySlotLabel} align="right" />
        </div>
      </div>

      {/* Prediction summary */}
      {pred && (
        <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg-card-hover)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Tu pronóstico:{" "}
              <strong className="text-[var(--text-primary)]">
                {pred.homeScore} – {pred.awayScore}
              </strong>
              {pred.mvp && ` · MVP: ${pred.mvp}`}
            </span>
            {pred.score && (
              <span className="font-bold text-[var(--accent)]">
                +{pred.score.totalPoints} pts
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-3 pt-2 flex items-center justify-between gap-2">
        {status === "pending" && match.predictable && (
          <>
            <CountdownTimer targetDate={match.lockAt} compact />
            <Button size="sm" variant="accent" onClick={() => onPredict?.(match.id)}>
              Pronosticar
            </Button>
          </>
        )}
        {status === "predicted" && match.predictable && (
          <>
            <CountdownTimer targetDate={match.lockAt} compact />
            <Button size="sm" variant="outline" onClick={() => onPredict?.(match.id)}>
              <Edit3 className="w-3 h-3" /> Editar
            </Button>
          </>
        )}
        {status === "locked" && (
          <span className="text-xs text-[var(--danger)] flex items-center gap-1">
            <Lock className="w-3 h-3" /> Pronósticos cerrados
          </span>
        )}
        {status === "finished" && !pred && (
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <MinusCircle className="w-3 h-3" /> No participaste
          </span>
        )}
        {match.isFeatured && (
          <span className="text-xs text-[var(--warning)] ml-auto">🇨🇴 Colombia</span>
        )}
      </div>
    </motion.div>
  );
}
