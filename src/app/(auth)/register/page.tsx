"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

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
      <div className="text-center space-y-4 py-4">
        <span className="text-5xl">📧</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">¡Revisa tu email!</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Te enviamos un link de verificación. Tienes 24 horas para confirmarlo.
        </p>
        <Link href="/login">
          <Button variant="accent" className="w-full mt-4">Ir al login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Crear cuenta</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Únete y pronostica el Mundial 2026</p>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" variant="accent" className="w-full" loading={loading}>
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
