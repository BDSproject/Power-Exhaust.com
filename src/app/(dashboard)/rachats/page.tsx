import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { formatDate, formatPrice, getStatutLabel, getStatutColor } from "@/lib/utils";
import { Badge, Card } from "@/components/ui";

interface RachatRow {
  id: string;
  marque: string;
  modele: string;
  annee: number | null;
  typeEchappement: string | null;
  statut: string;
  prixPropose: number | null;
  prixAccepte: number | null;
  createdAt: Date;
  attestation: { id: string; estComplete: boolean } | null;
  immatriculation: string | null;
  user: { name: string | null; email: string } | null;
}

export default async function RachatsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const rachats: RachatRow[] = await prisma.rachat.findMany({
    where: isAdmin ? {} : { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      attestation: { select: { id: true, estComplete: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isAdmin ? "Toutes les demandes" : "Mes demandes de rachat"}
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-1">{rachats.length} demande{rachats.length > 1 ? "s" : ""}</p>
        </div>
        {!isAdmin && (
          <Link href="/rachats/nouveau" className="bg-bmw-blue hover:bg-bmw-blue-dark text-white font-semibold px-5 py-2.5 rounded-xl shadow-bmw transition-all text-sm">
            + Nouvelle demande
          </Link>
        )}
      </div>

      {rachats.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-5xl mb-4">🔧</p>
            <p className="font-semibold text-white text-lg">Aucune demande</p>
            <p className="text-gray-400 text-sm mt-2 mb-6">Soumettez votre première ligne d&apos;échappement</p>
            <Link href="/rachats/nouveau" className="bg-bmw-blue text-white font-semibold px-6 py-3 rounded-xl shadow-bmw">
              Commencer maintenant
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {rachats.map((rachat) => (
            <Link key={rachat.id} href={`/rachats/${rachat.id}`}>
              <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-12 h-12 rounded-xl bg-bmw-blue/15 flex items-center justify-center text-xl flex-shrink-0">
                    🔧
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-white truncate">
                        {rachat.marque} {rachat.modele} ({rachat.annee})
                      </p>
                      <Badge className={getStatutColor(rachat.statut)}>
                        {getStatutLabel(rachat.statut)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {rachat.typeEchappement} — {rachat.immatriculation}
                      {isAdmin && rachat.user?.name && ` — ${rachat.user.name}`}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 text-gray-400">{formatDate(rachat.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {rachat.prixAccepte ? (
                      <p className="font-bold text-green-400 text-lg">{formatPrice(rachat.prixAccepte)}</p>
                    ) : rachat.prixPropose ? (
                      <p className="font-bold text-bmw-blue text-lg">{formatPrice(rachat.prixPropose)}</p>
                    ) : null}
                    {rachat.attestation && (
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {rachat.attestation.estComplete ? "✓ Attestation signée" : "📄 Attestation en cours"}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
