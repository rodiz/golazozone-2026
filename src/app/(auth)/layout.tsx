export default function AuthLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "1.5rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "26rem" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "0.75rem" }}>⚽</div>
          <h1
            className="font-display font-black gradient-text"
            style={{ fontSize: "2rem", lineHeight: 1 }}
          >
            GolazoZone
          </h1>
          <p
            style={{
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "0.375rem",
            }}
          >
            FIFA World Cup 2026
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem 1.75rem",
            boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
          }}
        >
          {children}
        </div>

      </div>
    </div>
  );
}
