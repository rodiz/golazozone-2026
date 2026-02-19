"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoringConfig {
  pointsWinner: number;
  pointsExactScore: number;
  pointsTopScorer: number;
  pointsFirstScorer: number;
  pointsMvp: number;
  pointsYellowCards: number;
  pointsRedCards: number;
  pointsMostPasses: number;
  pointsPerfectBonus: number;
}

const FIELDS: { key: keyof ScoringConfig; label: string; desc: string; max: number }[] = [
  { key: "pointsExactScore", label: "Resultado exacto", desc: "Marcador y ganador perfectos", max: 10 },
  { key: "pointsWinner", label: "Ganador correcto", desc: "Solo el resultado 1X2", max: 10 },
  { key: "pointsTopScorer", label: "Goleador del partido", desc: "Nombre del jugador correcto", max: 10 },
  { key: "pointsFirstScorer", label: "Primer goleador", desc: "El que marca primero", max: 10 },
  { key: "pointsMvp", label: "MVP del partido", desc: "Elegido por árbitros FIFA", max: 10 },
  { key: "pointsYellowCards", label: "Tarjetas amarillas exactas", desc: "Total del partido", max: 5 },
  { key: "pointsRedCards", label: "Tarjetas rojas exactas", desc: "Total del partido", max: 10 },
  { key: "pointsMostPasses", label: "Jugador más pases", desc: "Stat post-partido", max: 5 },
  { key: "pointsPerfectBonus", label: "Bonus perfecto", desc: "Todos los campos correctos", max: 20 },
];

export default function AdminScoringPage() {
  const [config, setConfig] = useState<ScoringConfig>({
    pointsWinner: 2, pointsExactScore: 5, pointsTopScorer: 3, pointsFirstScorer: 3,
    pointsMvp: 2, pointsYellowCards: 1, pointsRedCards: 2, pointsMostPasses: 1, pointsPerfectBonus: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/scoring")
      .then((r) => r.json())
      .then((d) => { if (d.config) setConfig(d.config); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/scoring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const maxTotal = FIELDS.reduce((acc, f) => acc + Math.max(config[f.key] ?? 0, 0), 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
        Configuración de Puntos
      </h1>

      {saved && (
        <div className="rounded-[var(--radius-sm)] bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-[var(--success)] flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Configuración guardada correctamente
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Sistema de puntuación
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
              Máx. posible por partido: <strong className="text-[var(--accent)]">{maxTotal} pts</strong>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-14 bg-[var(--bg-card-hover)] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{field.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{field.desc}</p>
                  </div>
                  <span className="font-display font-bold text-xl text-[var(--accent)] w-10 text-right">
                    {config[field.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={field.max}
                  value={config[field.key]}
                  onChange={(e) => setConfig({ ...config, [field.key]: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-full bg-[var(--border)] appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(config[field.key] / field.max) * 100}%, var(--border) ${(config[field.key] / field.max) * 100}%, var(--border) 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>0</span>
                  <span>{field.max}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button variant="accent" size="lg" onClick={save} loading={saving} className="w-full">
        Guardar configuración
      </Button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        ⚠️ Los cambios solo afectan a partidos futuros. Los pronósticos ya calculados no se recalculan automáticamente.
      </p>
    </div>
  );
}
