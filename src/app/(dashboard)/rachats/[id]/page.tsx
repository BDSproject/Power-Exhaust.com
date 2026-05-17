import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatPrice, getStatutLabel, getStatutColor, getEtatLabel } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, Alert } from "@/components/ui";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}

export default async function RachatDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const rachat = await prisma.rachat.findUnique({
    where: { id },
    include: {
      attestation: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!rachat) notFound();
  if (!isAdmin && rachat.userId !== session!.user.id) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Succès */}
      {success && (
        <Alert type="success">
          <p className="font-semibold">Demande envoyée avec succès ! 🎉</p>
          <p className="text-sm mt-1">
            Notre équipe va analyser votre demande et vous contactera sous 24h ouvrées à l&apos;adresse{" "}
            <strong>{rachat.emailVendeur}</strong>.
          </p>
        </Alert>
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/rachats" className="text-sm text-gray-400 hover:text-exhaust-orange mb-2 inline-flex items-center gap-1">
            ← Retour aux demandes
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {rachat.marque} {rachat.modele}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Réf. {rachat.reference.substring(0, 8).toUpperCase()} — Créée le {formatDate(rachat.createdAt)}
          </p>
        </div>
        <Badge className={getStatutColor(rachat.statut)}>
          {getStatutLabel(rachat.statut)}
        </Badge>
      </div>

      {/* Informations vendeur */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 text-exhaust-orange text-sm flex items-center justify-center">👤</span>
            Informations vendeur
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom</p>
              <p className="font-medium text-white">{rachat.prenomVendeur} {rachat.nomVendeur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="font-medium text-white">{rachat.emailVendeur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
              <p className="font-medium text-white">{rachat.telVendeur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adresse</p>
              <p className="font-medium text-white">
                {rachat.adresseVendeur}<br />
                {rachat.codePostalVendeur} {rachat.villeVendeur}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations véhicule */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 text-exhaust-orange text-sm flex items-center justify-center">🔧</span>
            Détails de l&apos;échappement
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Marque</p>
              <p className="font-medium text-white">{rachat.marque}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Modèle</p>
              <p className="font-medium text-white">{rachat.modele}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Année</p>
              <p className="font-medium text-white">{rachat.annee}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Immatriculation</p>
              <p className="font-medium text-white">{rachat.immatriculation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kilométrage</p>
              <p className="font-medium text-white">{rachat.kilometrage?.toLocaleString() ?? "—"} km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
              <p className="font-medium text-white">{rachat.typeEchappement}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">État</p>
              <p className="font-medium text-white">{getEtatLabel(rachat.etatEchappement)}</p>
            </div>
          </div>
          {rachat.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-gray-300 text-sm leading-relaxed">{rachat.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offre de rachat */}
      {rachat.prixAccepte && (
        <Card className="border-green-900/30">
          <CardContent className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-green-900/30 flex items-center justify-center text-2xl">💶</div>
            <div>
              <p className="text-sm text-gray-400">Offre acceptée</p>
              <p className="text-3xl font-bold text-green-400">{formatPrice(rachat.prixAccepte)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attestation */}
      {rachat.attestation ? (
        <Card className="border-white/10">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl">📄</div>
              <div>
                <p className="font-semibold text-white">Attestation N° {rachat.attestation.numero}</p>
                <p className="text-sm text-gray-400">
                  {rachat.attestation.estComplete ? "✓ Signée par les deux parties" : "⏳ En attente de signatures"}
                </p>
              </div>
            </div>
            <Link href={`/attestations/${rachat.attestation.id}`} className="bg-exhaust-orange text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
              Voir & Signer →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Alert type="info">
          <p className="font-semibold">Attestation en cours de préparation</p>
          <p className="text-sm mt-1">Une attestation de vente sera générée par notre équipe après acceptation de votre demande.</p>
        </Alert>
      )}

      {/* Note admin */}
      {rachat.noteAdmin && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white">Message de l&apos;équipe</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm leading-relaxed">{rachat.noteAdmin}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
