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

  if (done && !token) {
    return (
      <div className="text-center space-y-4 py-4">
        <span className="text-5xl">📧</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">¡Revisa tu email!</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Si existe una cuenta con ese email, recibirás un link para restablecer tu contraseña.
        </p>
        <Link href="/login"><Button variant="accent" className="w-full">Ir al login</Button></Link>
      </div>
    );
  }

  if (done && token) {
    return (
      <div className="text-center space-y-4 py-4">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">¡Contraseña actualizada!</h2>
        <Link href="/login"><Button variant="accent" className="w-full">Iniciar sesión</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          {token ? "Nueva contraseña" : "Recuperar contraseña"}
        </h2>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {!token ? (
        <form onSubmit={reqForm.handleSubmit(onRequest)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="w-4 h-4" />}
            error={reqForm.formState.errors.email?.message}
            {...reqForm.register("email")}
          />
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading}>
            Enviar link de recuperación
          </Button>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
          <input type="hidden" {...resetForm.register("token")} />
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
            icon={<Lock className="w-4 h-4" />}
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register("password")}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register("confirmPassword")}
          />
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={loading}>
            Establecer nueva contraseña
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--text-muted)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline">Volver al login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--text-muted)]">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
