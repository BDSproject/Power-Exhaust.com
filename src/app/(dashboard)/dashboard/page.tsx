import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { formatDate, formatPrice, getStatutLabel, getStatutColor } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";

interface RachatRow {
  id: string;
  marque: string;
  modele: string;
  annee: number | null;
  typeEchappement: string | null;
  statut: string;
  prixAccepte: number | null;
  createdAt: Date;
  attestation: { id: string; estComplete: boolean } | null;
}

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const rachats: RachatRow[] = await prisma.rachat.findMany({
    where: isAdmin ? {} : { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      attestation: { select: { id: true, estComplete: true } },
    },
  });

  const stats = {
    total: await prisma.rachat.count({ where: isAdmin ? {} : { userId: session!.user.id } }),
    enAttente: await prisma.rachat.count({ where: { ...(isAdmin ? {} : { userId: session!.user.id }), statut: "EN_ATTENTE" } }),
    accepte: await prisma.rachat.count({ where: { ...(isAdmin ? {} : { userId: session!.user.id }), statut: "ACCEPTE" } }),
    complete: await prisma.rachat.count({ where: { ...(isAdmin ? {} : { userId: session!.user.id }), statut: "COMPLETE" } }),
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bonjour, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            {isAdmin ? "Vue administrateur" : "Votre espace client Alchimiste BMW"}
          </p>
        </div>
        {!isAdmin && (
          <Link
            href="/rachats/nouveau"
            className="bg-bmw-blue hover:bg-bmw-blue-dark text-white font-semibold px-5 py-2.5 rounded-xl shadow-bmw transition-all text-sm flex items-center gap-2"
          >
            <span>+</span> Nouvelle demande
          </Link>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total demandes", value: stats.total, icon: "📋", color: "bg-bmw-blue text-white" },
          { label: "En attente", value: stats.enAttente, icon: "⏳", color: "bg-amber-500 text-white" },
          { label: "Acceptés", value: stats.accepte, icon: "✅", color: "bg-green-600 text-white" },
          { label: "Complétés", value: stats.complete, icon: "🏆", color: "bg-purple-600 text-white" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Raccourcis */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/rachats/nouveau" className="group bg-bmw-gradient rounded-2xl p-6 hover:shadow-bmw-lg transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl mb-4">🔧</div>
          <h3 className="text-white font-bold mb-1">Nouvelle demande</h3>
          <p className="text-blue-200 text-sm">Soumettre une ligne d&apos;échappement au rachat</p>
        </Link>
        <Link href="/rachats" className="group bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-exhaust-orange/40 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl mb-4">📋</div>
          <h3 className="text-white font-bold mb-1">Mes demandes</h3>
          <p className="text-gray-400 text-sm">Suivre l&apos;état de vos rachats</p>
        </Link>
        <Link href="/attestations" className="group bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-exhaust-orange/40 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl mb-4">📄</div>
          <h3 className="text-white font-bold mb-1">Mes attestations</h3>
          <p className="text-gray-400 text-sm">Consulter et signer vos attestations</p>
        </Link>
      </div>

      {/* Dernières demandes */}
      <Card>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-white">Dernières demandes</h2>
          <Link href="/rachats" className="text-sm text-bmw-blue hover:text-bmw-blue-dark font-medium">
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {rachats.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl mb-3">🔧</p>
              <p className="font-medium text-gray-300">Aucune demande pour l&apos;instant</p>
              <p className="text-sm text-gray-400 mt-1">Soumettez votre première ligne d&apos;échappement</p>
              <Link href="/rachats/nouveau" className="mt-4 inline-block bg-bmw-blue text-white text-sm font-semibold px-5 py-2 rounded-xl">
                Commencer
              </Link>
            </div>
          ) : (
            rachats.map((rachat) => (
              <Link key={rachat.id} href={`/rachats/${rachat.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-bmw-blue/15 flex items-center justify-center text-lg">
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {rachat.marque} {rachat.modele} — {rachat.typeEchappement}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{formatDate(rachat.createdAt)}</p>
                </div>
                {rachat.prixAccepte && (
                  <p className="text-bmw-blue font-bold text-sm whitespace-nowrap">
                    {formatPrice(rachat.prixAccepte)}
                  </p>
                )}
                <Badge className={getStatutColor(rachat.statut)}>
                  {getStatutLabel(rachat.statut)}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
