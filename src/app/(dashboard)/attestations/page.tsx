import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatDate, getStatutColor } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";
import { FileText, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const metadata = { title: "Mes Attestations" };

interface AttestationRow {
  id: string;
  numero: string;
  prixFinal: number;
  estComplete: boolean;
  signatureVendeur: string | null;
  signatureAcheteur: string | null;
  createdAt: Date;
  rachat: {
    marque: string;
    modele: string;
    annee: number | null;
    statut: string;
    user: { name: string | null; email: string } | null;
  };
}

export default async function AttestationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const attestations: AttestationRow[] = await prisma.attestation.findMany({
    where: isAdmin ? {} : { rachat: { userId: session.user.id } },
    include: {
      rachat: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Attestations de vente</h1>
        <p className="text-gray-400 font-medium mt-1">
          {isAdmin ? "Toutes les attestations générées" : "Vos attestations de cession"}
        </p>
      </div>

      {attestations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-300 text-lg font-medium">Aucune attestation</p>
            <p className="text-gray-400 text-sm mt-1">
              Les attestations apparaissent ici une fois votre offre acceptée.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attestations.map((att) => (
            <Card key={att.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-exhaust-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{att.numero}</p>
                      <p className="text-sm text-gray-400">
                        {att.rachat.marque} {att.rachat.modele} — {att.rachat.annee}
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Client : {att.rachat.user?.name || att.rachat.user?.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white">
                        {att.prixFinal.toLocaleString("fr-FR")} €
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{formatDate(att.createdAt)}</p>
                    </div>

                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1">
                        {att.signatureVendeur ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span className="text-gray-400 font-medium">Vendeur</span>
                      </span>
                      <span className="flex items-center gap-1">
                        {att.signatureAcheteur ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span className="text-gray-400 font-medium">Acheteur</span>
                      </span>
                    </div>

                    <Badge
                      className={`${getStatutColor(att.rachat.statut)} text-white text-xs hidden md:inline-flex`}
                    >
                      {att.estComplete ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Complète
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> En attente
                        </span>
                      )}
                    </Badge>

                    <Link
                      href={`/attestations/${att.id}`}
                      className="flex items-center gap-1 text-exhaust-orange hover:text-red-400 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
