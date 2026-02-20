"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { key: "pointsExactScore",   label: "Resultado exacto",         desc: "Marcador y ganador perfectos",     max: 10 },
  { key: "pointsWinner",       label: "Ganador correcto",         desc: "Solo el resultado 1X2",            max: 10 },
  { key: "pointsTopScorer",    label: "Goleador del partido",     desc: "Nombre del jugador correcto",      max: 10 },
  { key: "pointsFirstScorer",  label: "Primer goleador",          desc: "El que marca primero",             max: 10 },
  { key: "pointsMvp",          label: "MVP del partido",          desc: "Elegido por árbitros FIFA",        max: 10 },
  { key: "pointsYellowCards",  label: "Tarjetas amarillas exactas", desc: "Total del partido",              max: 5  },
  { key: "pointsRedCards",     label: "Tarjetas rojas exactas",   desc: "Total del partido",                max: 10 },
  { key: "pointsMostPasses",   label: "Jugador más pases",        desc: "Stat post-partido",                max: 5  },
  { key: "pointsPerfectBonus", label: "Bonus perfecto",           desc: "Todos los campos correctos",       max: 20 },
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
    <div className="page-stack" style={{ maxWidth: "40rem" }}>
      <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
        Configuración de Puntos
      </h1>

      {saved && (
        <div className="alert-success">
          <CheckCircle size={16} /> Configuración guardada correctamente
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Sistema de puntuación
            <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "0.5rem" }}>
              Máx. posible por partido:{" "}
              <strong style={{ color: "var(--accent)" }}>{maxTotal} pts</strong>
            </span>
          </div>
        </div>
        <div className="card-content">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "3.5rem" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{field.label}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{field.desc}</p>
                    </div>
                    <span className="font-display font-bold" style={{ fontSize: "1.25rem", color: "var(--accent)", width: "2.5rem", textAlign: "right" }}>
                      {config[field.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={field.max}
                    value={config[field.key]}
                    onChange={(e) => setConfig({ ...config, [field.key]: parseInt(e.target.value) })}
                    className="range-slider"
                    style={{
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(config[field.key] / field.max) * 100}%, var(--border) ${(config[field.key] / field.max) * 100}%, var(--border) 100%)`
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.625rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                    <span>0</span>
                    <span>{field.max}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button variant="accent" size="lg" onClick={save} loading={saving} style={{ width: "100%" }}>
        Guardar configuración
      </Button>

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
        ⚠️ Los cambios solo afectan a partidos futuros. Los pronósticos ya calculados no se recalculan automáticamente.
      </p>
    </div>
  );
}
