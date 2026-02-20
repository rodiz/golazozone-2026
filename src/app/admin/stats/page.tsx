import { TrendingUp, Target, Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminStatsPage() {
  return (
    <div className="page-stack">
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
          Analytics & Estadísticas 📊
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Métricas detalladas sobre el comportamiento de los usuarios (En desarrollo)
        </p>
      </div>

      {/* Chart placeholder */}
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "18rem", opacity: 0.6, border: "2px dashed var(--border)" }}>
        <Activity size={40} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
        <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Próximamente: Gráfica de Usuarios</p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", maxWidth: "26rem", marginTop: "0.5rem" }}>
          Aquí se integrará una gráfica detallada de la adquisición de usuarios, pronósticos diarios y horas pico de actividad de la aplicación durante el Mundial.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Crecimiento de Usuarios</div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-display font-bold" style={{ fontSize: "1.875rem", color: "var(--text-primary)" }}>+0.0%</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Comparado con el mes anterior</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Tasa de Participación</div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                <Target size={20} />
              </div>
              <div>
                <p className="font-display font-bold" style={{ fontSize: "1.875rem", color: "var(--text-primary)" }}>~0%</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pronósticos realizados por partido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
