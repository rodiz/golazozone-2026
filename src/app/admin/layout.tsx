import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sliders,
  Trophy,
  BarChart2,
  Bell,
  ClipboardList,
  ChevronLeft,
} from "lucide-react";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Partidos y Resultados", icon: CalendarDays },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/scoring", label: "Configurar Puntos", icon: Sliders },
  { href: "/admin/leaderboard", label: "Ranking Global", icon: Trophy },
  { href: "/admin/stats", label: "Analytics", icon: BarChart2 },
  { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
  { href: "/admin/audit", label: "Auditoría", icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex flex-col w-60 bg-[var(--bg-card)] border-r border-[var(--border)] fixed left-0 top-0 h-screen z-40">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <p className="font-display font-bold text-base text-[var(--text-primary)]">⚽ GolazoZone</p>
          <p className="text-xs text-[var(--danger)] font-semibold tracking-wider mt-0.5">ADMIN PANEL</p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <Link href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Volver al app
          </Link>
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <p className="text-xs text-[var(--text-muted)]">{session.user.email}</p>
          <p className="text-[10px] text-[var(--accent)] font-semibold">{session.user.role}</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 bg-[var(--bg)] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
