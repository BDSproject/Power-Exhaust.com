import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import IdentiteForm from "@/components/forms/IdentiteForm";

interface Props {
  params: Promise<{ rachatId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Vérification d'identité — Power Exhaust",
  description: "Envoi sécurisé de votre pièce d'identité (R321-3 CSI)",
  robots: "noindex, nofollow",
};

export default async function IdentitePage({ params, searchParams }: Props) {
  const { rachatId } = await params;
  const { token } = await searchParams;

  // Vérifier que le rachat existe et que le token est valide
  const rachat = await prisma.rachat.findUnique({
    where: { id: rachatId },
    select: {
      id: true,
      reference: true,
      identiteToken: true,
      prenomVendeur: true,
      nomVendeur: true,
      identite: { select: { id: true, purgee: true } },
    },
  });

  // Token invalide ou rachat introuvable → 404
  if (!rachat || !token || rachat.identiteToken !== token) {
    notFound();
  }

  // Document déjà soumis
  if (rachat.identite) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">Document déjà reçu</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Votre pièce d'identité a déjà été soumise pour la demande{" "}
            <span className="text-orange-400 font-mono">{rachat.reference}</span>.
          </p>
          <p className="text-gray-500 text-xs">
            Notre équipe l'examinera prochainement. En cas de question :{" "}
            <a href="mailto:contact@power-exhaust.com" className="text-orange-400">
              contact@power-exhaust.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Bandeau de contextualisation */}
      <div className="bg-[#0d0d0d] border-b border-white/5 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-black text-sm">POWER EXHAUST</span>
          </div>
          <div className="text-gray-500 text-xs font-mono">
            Réf. {rachat.reference}
          </div>
        </div>
      </div>

      <IdentiteForm rachatId={rachat.id} token={token} />
    </div>
  );
}
