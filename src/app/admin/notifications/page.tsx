"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Send, Users, AlertCircle } from "lucide-react";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        setStatus("error");
      } else {
        setStatus("success");
        setSubject("");
        setMessage("");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
          Notificaciones 🔔
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Envía correos electrónicos masivos o alertas en la app a los usuarios
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.5rem" }}>
        {/* Send form */}
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <div className="card-header">
            <div className="card-title">
              <Send size={18} /> Nueva Notificación Masiva
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Este módulo actualmente es un prototipo local. Enviará un Broadcast a todos los usuarios cuando se integre con la API final.
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSendNotification} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Asunto de la notificación"
                placeholder="Ej: ¡Ya puedes pronosticar la Final!"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)" }}>Mensaje</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea"
                  style={{ height: "8rem" }}
                  placeholder="Escribe el cuerpo del mensaje que recibirán los participantes..."
                />
              </div>

              {status === "success" && (
                <div className="alert-success">
                  <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "var(--success)", color: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700 }}>✓</div>
                  ¡Notificación masiva enviada!
                </div>
              )}
              {status === "error" && (
                <div className="alert-error">Error al enviar la notificación. Inténtalo de nuevo.</div>
              )}

              <Button type="submit" variant="accent" loading={loading} style={{ width: "100%" }}>
                Confirmar y Enviar a Todos
              </Button>
            </form>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <AlertCircle size={16} /> Recomendaciones
            </div>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ padding: "0.5rem", background: "var(--bg-card-hover)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Acuerdo tácito</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    Evita enviar muchas notificaciones en horarios de la madrugada. Utiliza este módulo sólo para recordatorios importantes de pronósticos por expirar.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ padding: "0.5rem", background: "var(--bg-card-hover)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <Users size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Alcance</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    En este momento, la notificación llegará a todas las personas en la tabla de usuarios registrados incluyendo aquéllos sin pronósticos cargados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
