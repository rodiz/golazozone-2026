import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Mi Perfil</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Configuración de cuenta</p>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center font-display font-black text-2xl text-[#0F1117]">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">{session.user.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{session.user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)] text-white">
                {session.user.role}
              </span>
            </div>
          </div>

          <hr className="border-[var(--border)]" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Email</span>
              <span className="text-[var(--text-primary)] font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Email verificado</span>
              <span className={session.user.emailVerified ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                {session.user.emailVerified ? "✅ Sí" : "❌ No"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Rol</span>
              <span className="text-[var(--accent)] font-semibold">{session.user.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            Para cambiar tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en el login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
