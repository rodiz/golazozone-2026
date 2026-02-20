"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "var(--radius-sm)",
  padding: "0.625rem 0.875rem",
  fontSize: "0.85rem",
  color: "var(--danger)",
};

const dividerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: "1px",
  background: "var(--border)",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos. Verifica que tu email esté confirmado.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Iniciar sesión
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Entra y pronostica todos los partidos
        </p>
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div style={{ textAlign: "right" }}>
          <Link
            href="/reset-password"
            style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          style={{ width: "100%" }}
          loading={loading}
        >
          Iniciar sesión
        </Button>
      </form>

      {/* Divider */}
      <div style={dividerStyle}>
        <div style={dividerLineStyle} />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          o continúa con
        </span>
        <div style={dividerLineStyle} />
      </div>

      {/* Social */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Button
          type="button"
          variant="outline"
          style={{ width: "100%" }}
          onClick={() => signIn("google", { callbackUrl })}
        >
          🌐 Google
        </Button>
        <Button
          type="button"
          variant="outline"
          style={{ width: "100%" }}
          onClick={() => signIn("discord", { callbackUrl })}
        >
          💬 Discord
        </Button>
      </div>

      {/* Footer link */}
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "16rem",
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
      <LoginForm />
    </Suspense>
  );
}
