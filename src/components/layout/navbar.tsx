"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  Trophy,
  Users,
  BarChart2,
  User,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fixture", label: "Fixture", icon: CalendarDays },
  { href: "/predictions", label: "Pronósticos", icon: ListOrdered },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/my-stats", label: "Mis Stats", icon: BarChart2 },
];

interface NavbarProps {
  session: Session;
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--bg-card)] border-r border-[var(--border)] min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <div>
              <p className="font-display font-bold text-lg text-[var(--text-primary)] leading-tight">
                GolazoZone
              </p>
              <p className="text-xs text-[var(--accent)] font-semibold tracking-wider">2026</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">
                  Admin
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all",
                  pathname.startsWith("/admin")
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                Panel Admin
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border)] p-4 space-y-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#0F1117] font-bold text-xs flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] truncate text-xs">
                {session.user.name ?? session.user.email}
              </p>
              <p className="text-[10px] text-[var(--accent)]">{session.user.role}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--danger)] hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {[
          { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
          { href: "/fixture", icon: CalendarDays, label: "Fixture" },
          { href: "/predictions", icon: ListOrdered, label: "Pronós." },
          { href: "/leaderboard", icon: Trophy, label: "Ranking" },
          { href: "/profile", icon: User, label: "Perfil" },
        ].map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-sm)] transition-all",
                active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
