import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-exhaust-dark flex flex-col items-center justify-center px-6 py-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <span className="font-black text-2xl tracking-tight leading-none">
          <span className="text-white">POWER-</span><span className="text-exhaust-orange">EXHAUST</span>
        </span>
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="bg-white/5 border border-white/10 rounded-2xl px-10 py-10">
          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1.5">
            Bon retour
          </h1>
          <p className="text-[13px] text-gray-400 mb-8">
            Connectez-vous à votre espace client
          </p>
          <LoginForm />
        </div>


      </div>

      <p className="mt-12 text-[11px] text-gray-600">
        © 2026 Power Exhaust. Tous droits réservés.
      </p>
    </div>
  );
}
