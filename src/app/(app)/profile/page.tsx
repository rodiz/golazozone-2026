import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="page-stack" style={{ maxWidth: "32rem" }}>
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Mi Perfil</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Configuración de cuenta</p>
      </div>

      {/* Account card */}
      <div className="card">
        <div className="card-content" style={{ paddingTop: "1.25rem" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-black" style={{ fontSize: "1.5rem", color: "#0F1117" }}>
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{session.user.name}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{session.user.email}</p>
              <span style={{ display: "inline-block", marginTop: "0.25rem", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 700, background: "var(--primary)", color: "white" }}>
                {session.user.role}
              </span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "1rem" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-muted)" }}>Email</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{session.user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-muted)" }}>Email verificado</span>
              <span style={{ color: session.user.emailVerified ? "var(--success)" : "var(--danger)" }}>
                {session.user.emailVerified ? "✅ Sí" : "❌ No"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span style={{ color: "var(--text-muted)" }}>Rol</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{session.user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ fontSize: "1rem" }}>Zona de peligro</div>
        </div>
        <div className="card-content">
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Para cambiar tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en el login.
          </p>
        </div>
      </div>
    </div>
  );
}
