"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, CalendarDays, ListOrdered, Trophy,
  Users, BarChart2, User, LogOut, Settings, Menu, X, ChevronLeft,
} from "lucide-react";
import type { Session } from "next-auth";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/fixture",      label: "Fixture",      icon: CalendarDays },
  { href: "/predictions",  label: "Pronósticos",  icon: ListOrdered },
  { href: "/leaderboard",  label: "Ranking",      icon: Trophy },
  { href: "/groups",       label: "Grupos",       icon: Users },
  { href: "/my-stats",     label: "Mis Stats",    icon: BarChart2 },
];

export function ClientLayout({ children, session }: { children: React.ReactNode; session: Session }) {
  const pathname = usePathname();
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  const avatarLetter = session.user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="app-shell">

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span style={{ fontSize: "1.25rem" }}>⚽</span>
          <span className="font-display font-bold" style={{ color: "var(--text-primary)" }}>GolazoZone</span>
        </Link>
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
        <div style={{ height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem 0 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <Link href="/dashboard" className="sidebar-brand-text" onClick={close} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <span style={{ fontSize: "1.5rem" }}>⚽</span>
            <span className="font-display font-bold" style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>GolazoZone</span>
          </Link>
          {collapsed && (
            <Link href="/dashboard" onClick={close} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>⚽</span>
            </Link>
          )}
          {/* Mobile close */}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                title={collapsed ? item.label : undefined}
                className={`nav-item${pathname.startsWith(item.href) ? " active" : ""}`}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}

            {isAdmin && (
              <>
                <p className="nav-section-label" style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 600, padding: "1rem 0.75rem 0.5rem" }}>
                  Admin
                </p>
                <Link
                  href="/admin/dashboard"
                  onClick={close}
                  title={collapsed ? "Panel Admin" : undefined}
                  className={`nav-item${pathname.startsWith("/admin") ? " active" : ""}`}
                >
                  <Settings size={20} style={{ flexShrink: 0 }} />
                  <span className="nav-label">Panel Admin</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 0.75rem", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Link
            href="/profile"
            onClick={close}
            title={collapsed ? "Perfil" : undefined}
            className="nav-item"
          >
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--accent)", color: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
              {avatarLetter}
            </div>
            <div className="sidebar-footer-text" style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name ?? session.user.email}
              </p>
              <p style={{ fontSize: "0.65rem", color: "var(--accent)" }}>{session.user.role}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Cerrar sesión" : undefined}
            className="nav-item nav-danger"
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>

        {/* Desktop collapse toggle */}
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
