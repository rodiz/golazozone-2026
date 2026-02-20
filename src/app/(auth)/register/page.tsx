"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "var(--radius-sm)",
  padding: "0.625rem 0.875rem",
  fontSize: "0.85rem",
  color: "var(--danger)",
};

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al registrar");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem 0" }}>
        <div style={{ fontSize: "3rem" }}>📧</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          ¡Revisa tu email!
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Te enviamos un link de verificación. Tienes 24 horas para confirmarlo.
        </p>
        <Link href="/login" style={{ marginTop: "0.5rem" }}>
          <Button variant="accent" size="lg" style={{ width: "100%" }}>
            Ir al login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Crear cuenta
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Únete y pronostica el Mundial 2026
        </p>
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register("name")}
        />
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
          placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          style={{ width: "100%" }}
          loading={loading}
        >
          Crear cuenta
        </Button>
      </form>

      {/* Footer link */}
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
