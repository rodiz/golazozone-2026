import type React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verificar Email" };

const cardStyle: React.CSSProperties = {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1rem 0",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div style={cardStyle}>
        <div style={{ fontSize: "2.5rem" }}>❌</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Token inválido
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          El link de verificación es inválido o expiró.
        </p>
        <Link href="/login">
          <Button variant="accent" size="lg" style={{ width: "100%" }}>
            Ir al login
          </Button>
        </Link>
      </div>
    );
  }

  const verifyToken = await db.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (
    !verifyToken ||
    verifyToken.type !== "EMAIL_VERIFICATION" ||
    new Date() > verifyToken.expires
  ) {
    return (
      <div style={cardStyle}>
        <div style={{ fontSize: "2.5rem" }}>⏰</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Link expirado
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          El link de verificación expiró. Regístrate de nuevo.
        </p>
        <Link href="/register">
          <Button variant="accent" size="lg" style={{ width: "100%" }}>
            Registrarse
          </Button>
        </Link>
      </div>
    );
  }

  await db.user.update({
    where: { email: verifyToken.email },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({ where: { token } });

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "2.5rem" }}>🎉</div>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
        ¡Email verificado!
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Tu cuenta está lista. Inicia sesión y empieza a pronosticar el Mundial 2026.
      </p>
      <Link href="/login">
        <Button variant="accent" size="lg" style={{ width: "100%" }}>
          Iniciar sesión
        </Button>
      </Link>
    </div>
  );
}
