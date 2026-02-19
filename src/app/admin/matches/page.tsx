"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  matchNumber: number;
  dateColombia: string;
  venue: string;
  status: string;
  homeTeam?: { name: string; flag: string } | null;
  awayTeam?: { name: string; flag: string } | null;
  homeSlotLabel?: string | null;
  awaySlotLabel?: string | null;
  result?: {
    homeScore: number;
    awayScore: number;
  } | null;
}

interface ResultForm {
  homeScore: string;
  awayScore: string;
  topScorer: string;
  firstScorer: string;
  mvp: string;
  yellowCards: string;
  redCards: string;
  mostPasses: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<ResultForm>({
    homeScore: "", awayScore: "", topScorer: "", firstScorer: "",
    mvp: "", yellowCards: "0", redCards: "0", mostPasses: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitResult = async () => {
    if (!selectedMatch) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeScore: parseInt(form.homeScore),
          awayScore: parseInt(form.awayScore),
          topScorer: form.topScorer || null,
          firstScorer: form.firstScorer || null,
          mvp: form.mvp || null,
          yellowCards: parseInt(form.yellowCards) || 0,
          redCards: parseInt(form.redCards) || 0,
          mostPasses: form.mostPasses || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Resultado guardado. ${data.predictionsUpdated} pronósticos actualizados.`);
      setSelectedMatch(null);
      // Refresh matches
      const updated = await fetch("/api/matches").then((r) => r.json());
      setMatches(updated.matches ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const scheduledMatches = matches.filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
        Gestión de Partidos
      </h1>

      {success && (
        <div className="rounded-[var(--radius-sm)] bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-[var(--success)] flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Result form */}
      {selectedMatch && (
        <Card className="border-[var(--accent)]">
          <CardHeader>
            <CardTitle>
              Cargar resultado — {selectedMatch.homeTeam?.flag ?? "⏳"} {selectedMatch.homeTeam?.name ?? selectedMatch.homeSlotLabel} vs{" "}
              {selectedMatch.awayTeam?.flag ?? "⏳"} {selectedMatch.awayTeam?.name ?? selectedMatch.awaySlotLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label={`Goles ${selectedMatch.homeTeam?.name ?? "Local"}`}
                type="number" min={0} value={form.homeScore}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value })} />
              <Input label={`Goles ${selectedMatch.awayTeam?.name ?? "Visitante"}`}
                type="number" min={0} value={form.awayScore}
                onChange={(e) => setForm({ ...form, awayScore: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Goleador del partido" placeholder="Nombre"
                value={form.topScorer} onChange={(e) => setForm({ ...form, topScorer: e.target.value })} />
              <Input label="Primer goleador" placeholder="Nombre"
                value={form.firstScorer} onChange={(e) => setForm({ ...form, firstScorer: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="MVP" placeholder="Nombre"
                value={form.mvp} onChange={(e) => setForm({ ...form, mvp: e.target.value })} />
              <Input label="Tarjetas amarillas" type="number" min={0}
                value={form.yellowCards} onChange={(e) => setForm({ ...form, yellowCards: e.target.value })} />
              <Input label="Tarjetas rojas" type="number" min={0}
                value={form.redCards} onChange={(e) => setForm({ ...form, redCards: e.target.value })} />
            </div>
            <Input label="Jugador más pases" placeholder="Nombre"
              value={form.mostPasses} onChange={(e) => setForm({ ...form, mostPasses: e.target.value })} />
            <div className="flex gap-3">
              <Button variant="accent" onClick={handleSubmitResult} loading={submitting}>
                Guardar resultado
              </Button>
              <Button variant="ghost" onClick={() => setSelectedMatch(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--warning)]" />
            Partidos pendientes de resultado ({scheduledMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-[var(--bg-card-hover)] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {scheduledMatches.slice(0, 20).map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <span className="text-xs text-[var(--text-muted)] w-8 font-mono">#{m.matchNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {m.homeTeam?.flag ?? "⏳"} {m.homeTeam?.name ?? m.homeSlotLabel} vs{" "}
                      {m.awayTeam?.flag ?? "⏳"} {m.awayTeam?.name ?? m.awaySlotLabel}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{m.dateColombia} · {m.venue}</p>
                  </div>
                  <Badge variant={m.status === "LIVE" ? "live" : "pending"} className="flex-shrink-0 text-[10px]">
                    {m.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      setSelectedMatch(m);
                      setForm({ homeScore: "", awayScore: "", topScorer: "", firstScorer: "", mvp: "", yellowCards: "0", redCards: "0", mostPasses: "" });
                      setSuccess(null);
                    }}
                  >
                    Cargar resultado
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finished matches */}
      {finishedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Partidos finalizados ({finishedMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {finishedMatches.slice(0, 10).map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs text-[var(--text-muted)] w-8 font-mono">#{m.matchNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {m.homeTeam?.flag} {m.homeTeam?.name} {m.result?.homeScore} – {m.result?.awayScore} {m.awayTeam?.name} {m.awayTeam?.flag}
                    </p>
                  </div>
                  <Badge variant="finished" className="text-[10px]">FINISHED</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
