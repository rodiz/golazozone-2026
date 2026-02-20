"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordRequestSchema, resetPasswordSchema } from "@/lib/validations/auth";
import type { ResetPasswordRequestInput, ResetPasswordInput } from "@/lib/validations/auth";

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "var(--radius-sm)",
  padding: "0.625rem 0.875rem",
  fontSize: "0.85rem",
  color: "var(--danger)",
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reqForm = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? "" },
  });

  const onRequest = async (data: ResetPasswordRequestInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (data: ResetPasswordInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const successContent = (icon: string, title: string, desc: string, href: string, label: string) => (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem 0" }}>
      <div style={{ fontSize: "3rem" }}>{icon}</div>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{desc}</p>
      <Link href={href}>
        <Button variant="accent" size="lg" style={{ width: "100%" }}>{label}</Button>
      </Link>
    </div>
  );

  if (done && !token) {
    return successContent(
      "📧",
      "¡Revisa tu email!",
      "Si existe una cuenta con ese email, recibirás un link para restablecer tu contraseña.",
      "/login",
      "Ir al login"
    );
  }

  if (done && token) {
    return successContent("✅", "¡Contraseña actualizada!", "", "/login", "Iniciar sesión");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          {token ? "Nueva contraseña" : "Recuperar contraseña"}
        </h2>
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {!token ? (
        <form
          onSubmit={reqForm.handleSubmit(onRequest)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail size={16} />}
            error={reqForm.formState.errors.email?.message}
            {...reqForm.register("email")}
          />
          <Button type="submit" variant="accent" size="lg" style={{ width: "100%" }} loading={loading}>
            Enviar link de recuperación
          </Button>
        </form>
      ) : (
        <form
          onSubmit={resetForm.handleSubmit(onReset)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input type="hidden" {...resetForm.register("token")} />
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
            icon={<Lock size={16} />}
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register("password")}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register("confirmPassword")}
          />
          <Button type="submit" variant="accent" size="lg" style={{ width: "100%" }} loading={loading}>
            Establecer nueva contraseña
          </Button>
        </form>
      )}

      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Volver al login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "10rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          Cargando...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
