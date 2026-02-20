"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, CalendarDays, Users, Users2, Sliders, Trophy,
  BarChart2, Bell, ClipboardList, Menu, X, ChevronLeft, LogOut,
} from "lucide-react";
import type { Session } from "next-auth";

const adminNav = [
  { href: "/admin/dashboard",      label: "Dashboard",            icon: LayoutDashboard },
  { href: "/admin/matches",        label: "Partidos y Resultados", icon: CalendarDays },
  { href: "/admin/users",          label: "Usuarios",             icon: Users },
  { href: "/admin/groups",         label: "Grupos",               icon: Users2 },
  { href: "/admin/scoring",        label: "Configurar Puntos",    icon: Sliders },
  { href: "/admin/leaderboard",    label: "Ranking Global",       icon: Trophy },
  { href: "/admin/stats",          label: "Analytics",            icon: BarChart2 },
  { href: "/admin/notifications",  label: "Notificaciones",       icon: Bell },
  { href: "/admin/audit",          label: "Auditoría",            icon: ClipboardList },
];

export function AdminClientLayout({ children, session }: { children: React.ReactNode; session: Session }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <div className="app-shell">

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <span className="font-display font-bold" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>⚽ GolazoZone</span>
          <span style={{ fontSize: "0.6rem", color: "var(--danger)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ padding: "0.5rem", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)" }}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay${mobileOpen ? " visible" : ""}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}${mobileOpen ? " sidebar-open" : ""}`}>

        {/* Header */}
        <div style={{ height: "4.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem 0 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div className="sidebar-brand-text" style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <span className="font-display font-bold" style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>⚽ GolazoZone</span>
            <span style={{ fontSize: "0.6rem", color: "var(--danger)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Panel</span>
          </div>
          {collapsed && (
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>⚽</span>
            </div>
          )}
          <button
            onClick={close}
            style={{ padding: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
            className="sidebar-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                title={collapsed ? item.label : undefined}
                className={`nav-item${pathname.startsWith(item.href) ? " active" : ""}`}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 0.75rem", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div className="sidebar-footer-text" style={{ display: "flex", flexDirection: "column", gap: "0.125rem", padding: "0 0.5rem 0.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.email}</p>
            <p style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600 }}>{session.user.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Cerrar sesión" : undefined}
            className="nav-item nav-danger"
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle-btn"
          aria-label="Colapsar sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="main-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
