"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string; matchNumber: number; dateColombia: string; venue: string; status: string;
  homeTeam?: { name: string; flag: string } | null;
  awayTeam?: { name: string; flag: string } | null;
  home?: { name: string; flag: string } | null;
  away?: { name: string; flag: string } | null;
  homeSlotLabel?: string | null; awaySlotLabel?: string | null;
  result?: { homeScore: number; awayScore: number } | null;
}

interface ResultForm {
  homeScore: string; awayScore: string; topScorer: string; firstScorer: string;
  mvp: string; yellowCards: string; redCards: string; mostPasses: string;
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" };

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<ResultForm>({ homeScore: "", awayScore: "", topScorer: "", firstScorer: "", mvp: "", yellowCards: "0", redCards: "0", mostPasses: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches").then((r) => r.json()).then((d) => setMatches(d.matches ?? [])).finally(() => setLoading(false));
  }, []);

  const handleSubmitResult = async () => {
    if (!selectedMatch) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedMatch.id, homeScore: parseInt(form.homeScore), awayScore: parseInt(form.awayScore), topScorer: form.topScorer || null, firstScorer: form.firstScorer || null, mvp: form.mvp || null, yellowCards: parseInt(form.yellowCards) || 0, redCards: parseInt(form.redCards) || 0, mostPasses: form.mostPasses || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Resultado guardado. ${data.predictionsUpdated} pronósticos actualizados.`);
      setSelectedMatch(null);
      const updated = await fetch("/api/matches").then((r) => r.json());
      setMatches(updated.matches ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const scheduled = matches.filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
  const finished  = matches.filter((m) => m.status === "FINISHED");

  const matchLabel = (m: Match) => `${(m.homeTeam ?? m.home)?.flag ?? "⏳"} ${(m.homeTeam ?? m.home)?.name ?? m.homeSlotLabel} vs ${(m.awayTeam ?? m.away)?.flag ?? "⏳"} ${(m.awayTeam ?? m.away)?.name ?? m.awaySlotLabel}`;

  return (
    <div className="page-stack">
      <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Gestión de Partidos</h1>

      {success && <div className="alert-success"><CheckCircle size={16} /> {success}</div>}
      {error   && <div className="alert-error">{error}</div>}

      {/* Result form */}
      {selectedMatch && (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <div className="card-header">
            <div className="card-title">Cargar resultado — {matchLabel(selectedMatch)}</div>
          </div>
          <div className="card-content">
            <div className="page-stack-sm">
              <div style={grid2}>
                <Input label={`Goles ${(selectedMatch.homeTeam ?? selectedMatch.home)?.name ?? "Local"}`}
                  type="number" min={0} value={form.homeScore} onChange={(e) => setForm({ ...form, homeScore: e.target.value })} />
                <Input label={`Goles ${(selectedMatch.awayTeam ?? selectedMatch.away)?.name ?? "Visitante"}`}
                  type="number" min={0} value={form.awayScore} onChange={(e) => setForm({ ...form, awayScore: e.target.value })} />
              </div>
              <div style={grid2}>
                <Input label="Goleador del partido" placeholder="Nombre" value={form.topScorer}   onChange={(e) => setForm({ ...form, topScorer: e.target.value })} />
                <Input label="Primer goleador"       placeholder="Nombre" value={form.firstScorer} onChange={(e) => setForm({ ...form, firstScorer: e.target.value })} />
              </div>
              <div style={grid3}>
                <Input label="MVP"                placeholder="Nombre" value={form.mvp}         onChange={(e) => setForm({ ...form, mvp: e.target.value })} />
                <Input label="Tarjetas amarillas" type="number" min={0} value={form.yellowCards} onChange={(e) => setForm({ ...form, yellowCards: e.target.value })} />
                <Input label="Tarjetas rojas"     type="number" min={0} value={form.redCards}    onChange={(e) => setForm({ ...form, redCards: e.target.value })} />
              </div>
              <Input label="Jugador más pases" placeholder="Nombre" value={form.mostPasses} onChange={(e) => setForm({ ...form, mostPasses: e.target.value })} />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button variant="accent" onClick={handleSubmitResult} loading={submitting}>Guardar resultado</Button>
                <Button variant="ghost"  onClick={() => setSelectedMatch(null)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled matches */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Clock size={16} style={{ color: "var(--warning)" }} /> Partidos pendientes de resultado ({scheduled.length})</div>
        </div>
        <div className="card-content-p0">
          {loading ? (
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "3rem" }} />)}
            </div>
          ) : (
            <div className="rows-divided">
              {scheduled.slice(0, 20).map((m) => (
                <div key={m.id} className="row-item">
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: "2rem", fontFamily: "monospace" }}>#{m.matchNumber}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{matchLabel(m)}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.dateColombia} · {m.venue}</p>
                  </div>
                  <Badge variant={m.status === "LIVE" ? "live" : "pending"}>{m.status}</Badge>
                  <Button size="sm" variant="accent" onClick={() => { setSelectedMatch(m); setForm({ homeScore: "", awayScore: "", topScorer: "", firstScorer: "", mvp: "", yellowCards: "0", redCards: "0", mostPasses: "" }); setSuccess(null); }}>
                    Cargar resultado
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Finished matches */}
      {finished.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><CheckCircle size={16} style={{ color: "var(--success)" }} /> Partidos finalizados ({finished.length})</div>
          </div>
          <div className="card-content-p0">
            <div className="rows-divided">
              {finished.slice(0, 10).map((m) => (
                <div key={m.id} className="row-item">
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: "2rem", fontFamily: "monospace" }}>#{m.matchNumber}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(m.homeTeam ?? m.home)?.flag} {(m.homeTeam ?? m.home)?.name} {m.result?.homeScore} – {m.result?.awayScore} {(m.awayTeam ?? m.away)?.name} {(m.awayTeam ?? m.away)?.flag}
                    </p>
                  </div>
                  <Badge variant="finished">FINISHED</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
