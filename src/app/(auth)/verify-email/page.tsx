import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verificar Email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <span className="text-4xl">❌</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Token inválido</h2>
        <p className="text-sm text-[var(--text-muted)]">El link de verificación es inválido o expiró.</p>
        <Link href="/login"><Button variant="accent" className="w-full">Ir al login</Button></Link>
      </div>
    );
  }

  const verifyToken = await db.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verifyToken || verifyToken.type !== "EMAIL_VERIFICATION" || new Date() > verifyToken.expires) {
    return (
      <div className="text-center space-y-4 py-4">
        <span className="text-4xl">⏰</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Link expirado</h2>
        <p className="text-sm text-[var(--text-muted)]">El link de verificación expiró. Regístrate de nuevo.</p>
        <Link href="/register"><Button variant="accent" className="w-full">Registrarse</Button></Link>
      </div>
    );
  }

  // Mark email as verified
  await db.user.update({
    where: { email: verifyToken.email },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await db.verificationToken.delete({ where: { token } });

  return (
    <div className="text-center space-y-4 py-4">
      <span className="text-5xl">🎉</span>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">¡Email verificado!</h2>
      <p className="text-sm text-[var(--text-muted)]">
        Tu cuenta está lista. Inicia sesión y empieza a pronosticar el Mundial 2026.
      </p>
      <Link href="/login"><Button variant="accent" className="w-full">Iniciar sesión</Button></Link>
    </div>
  );
}
