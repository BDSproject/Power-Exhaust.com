"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Input, Button, Alert } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Adresse email"
        type="email"
        placeholder="votre@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-end">
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm text-bmw-blue hover:text-bmw-blue-dark font-medium"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
        size="lg"
      >
        Se connecter
      </Button>
    </form>
  );
}
