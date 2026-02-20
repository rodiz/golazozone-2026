"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Trophy, Lock, Zap, CheckCircle, MinusCircle } from "lucide-react";
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

function TeamDisplay({ team, slotLabel }: {
  team: TeamInfo | null | undefined;
  slotLabel: string | null | undefined;
}) {
  const name = team ? (team.confirmed ? team.name : team.playoffSlotLabel ?? team.name) : slotLabel ?? "TBD";
  const flag = team?.flag ?? "⏳";
  const shortCode = team ? (team.confirmed ? team.shortCode : "TBD") : "TBD";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flex: 1 }}>
      <span style={{ fontSize: "1.875rem", lineHeight: 1 }}>{flag}</span>
      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", textAlign: "center", lineHeight: 1.3, maxWidth: "5.625rem", display: "block" }}>
        {name}
      </span>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{shortCode}</span>
    </div>
  );
}

export function MatchCard({ match, onPredict, className }: MatchCardProps) {
  const status = getMatchStatus(match);
  const pred = match.userPrediction;
  const result = match.result;
  const homeTeam = match.homeTeam ?? (match as any).home ?? null;
  const awayTeam = match.awayTeam ?? (match as any).away ?? null;

  const router = useRouter();

  const handlePredictClick = () => {
    if (onPredict) {
      onPredict(match.id);
    } else {
      router.push("/fixture");
    }
  };

  const statusBadge = {
    pending:   <Badge variant="pending">⏳ Pendiente</Badge>,
    predicted: <Badge variant="success"><CheckCircle size={12} /> Pronosticado</Badge>,
    locked:    <Badge variant="locked"><Lock size={12} /> Cerrado</Badge>,
    live:      <Badge variant="live"><Zap size={12} /> EN VIVO</Badge>,
    finished:  <Badge variant="finished"><Trophy size={12} /> Finalizado</Badge>,
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`card${match.isFeatured ? " colombia-card" : ""}${className ? ` ${className}` : ""}`}
    >
      {/* Header */}
      <div style={{ padding: "0.625rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--bg-card-hover)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            📅 {match.dateColombia.replace("T", " ").slice(0, 16)} (COL)
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            🏟 {match.venue}, {match.city}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
          {match.group && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Grupo {match.group.letter} · J{match.matchday}
            </span>
          )}
          {statusBadge}
        </div>
      </div>

      {/* Teams */}
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <TeamDisplay team={homeTeam} slotLabel={match.homeSlotLabel} />

          {/* Score / VS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", minWidth: "3.75rem" }}>
            {(status === "finished" || status === "live") && result ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: result.winner === "HOME" ? "var(--success)" : "var(--text-primary)" }}>
                  {result.homeScore}
                </span>
                <span style={{ color: "var(--text-muted)" }}>–</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: result.winner === "AWAY" ? "var(--success)" : "var(--text-primary)" }}>
                  {result.awayScore}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-muted)" }}>VS</span>
            )}
            <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>#{match.matchNumber}</span>
          </div>

          <TeamDisplay team={awayTeam} slotLabel={match.awaySlotLabel} />
        </div>
      </div>

      {/* Prediction summary */}
      {pred && (
        <div style={{ padding: "0.625rem 1rem", borderTop: "1px solid var(--border)", background: "var(--bg-card-hover)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>
              Tu pronóstico:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {pred.homeScore} – {pred.awayScore}
              </strong>
              {pred.mvp && ` · MVP: ${pred.mvp}`}
            </span>
            {pred.score && (
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                +{pred.score.totalPoints} pts
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: "0.5rem 1rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        {status === "pending" && match.predictable && (
          <>
            <CountdownTimer targetDate={match.lockAt} compact />
            <Button size="sm" variant="accent" onClick={handlePredictClick}>
              Pronosticar
            </Button>
          </>
        )}
        {status === "predicted" && match.predictable && (
          <>
            <CountdownTimer targetDate={match.lockAt} compact />
            <Button size="sm" variant="outline" onClick={handlePredictClick}>
              <Edit3 size={12} /> Editar
            </Button>
          </>
        )}
        {status === "locked" && (
          <span style={{ fontSize: "0.75rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Lock size={12} /> Pronósticos cerrados
          </span>
        )}
        {status === "finished" && !pred && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <MinusCircle size={12} /> No participaste
          </span>
        )}
        {match.isFeatured && (
          <span style={{ fontSize: "0.75rem", color: "var(--warning)", marginLeft: "auto" }}>🇨🇴 Colombia</span>
        )}
      </div>
    </motion.div>
  );
}
