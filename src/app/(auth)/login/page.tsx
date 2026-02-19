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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Iniciar sesión</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Entra y pronostica todos los partidos</p>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link href="/reset-password" className="text-xs text-[var(--accent)] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" size="lg" variant="accent" className="w-full" loading={loading}>
          Iniciar sesión
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs text-[var(--text-muted)]">
          <span className="bg-[var(--bg-card)] px-3">o continúa con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={() => signIn("google", { callbackUrl })}>
          🌐 Google
        </Button>
        <Button type="button" variant="outline" onClick={() => signIn("discord", { callbackUrl })}>
          💬 Discord
        </Button>
      </div>

      <p className="text-center text-sm text-[var(--text-muted)]">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-[var(--accent)] font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-[var(--text-muted)]">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
