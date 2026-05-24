import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatPrice, getStatutLabel, getStatutColor, getEtatLabel } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, Alert } from "@/components/ui";
import { ChevronLeft, Calendar, MapPin, Phone, Mail, FileText, Check, Clock, XCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function RachatSuiviPage({ params }: Props) {
  const { id } = await params;

  const rachat = await prisma.rachat.findUnique({
    where: { id },
    include: {
      attestation: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!rachat) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <Link href="/" className="text-sm text-gray-400 hover:text-exhaust-orange mb-2 inline-flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      {/* En-tête */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-white">
          {rachat.marque} {rachat.modele}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-exhaust-orange/20 text-exhaust-orange border-exhaust-orange/30">
            Réf. {rachat.reference}
          </Badge>
          <Badge className={getStatutColor(rachat.statut)}>
            {getStatutLabel(rachat.statut)}
          </Badge>
          {rachat.etatEchappement && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              État : {getEtatLabel(rachat.etatEchappement)}
            </Badge>
          )}
        </div>
      </div>

      {/* Alertes de statut */}
      {rachat.statut === "ACCEPTE" && (
        <Alert type="success">
          <p className="font-semibold">✅ Votre demande a été acceptée !</p>
          <p className="text-sm mt-1">
            Notre équipe vous contactera pour finaliser l'arrangement de collecte.
          </p>
        </Alert>
      )}
      {rachat.statut === "REFUSE" && (
        <Alert type="error">
          <p className="font-semibold">❌ Votre demande a été refusée</p>
          <p className="text-sm mt-1">
            {rachat.noteAdmin || "Veuillez contacter notre équipe pour plus de détails."}
          </p>
        </Alert>
      )}
      {rachat.statut === "EN_ATTENTE" && (
        <Alert type="warning">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <p className="font-semibold">En attente d'examen</p>
          </div>
          <p className="text-sm mt-1">
            Notre équipe examine votre demande. Nous vous contacterons sous 24h ouvrées à l'adresse <strong>{rachat.emailVendeur}</strong>.
          </p>
        </Alert>
      )}

      {/* Sections principales */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Véhicule */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏍</span>
              <h2 className="font-bold text-white">Véhicule</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Marque</span>
                <span className="font-semibold text-white">{rachat.marque}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Modèle</span>
                <span className="font-semibold text-white">{rachat.modele}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Année</span>
                <span className="font-semibold text-white">{rachat.annee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Kilométrage</span>
                <span className="font-semibold text-white">{rachat.kilometrage ? rachat.kilometrage.toLocaleString() : "—"} km</span>
              </div>
              {rachat.poidsKg && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Poids</span>
                  <span className="font-semibold text-white">{rachat.poidsKg} kg</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Échappement */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <h2 className="font-bold text-white">Ligne d'échappement</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Marque</span>
                <span className="font-semibold text-white">{rachat.marqueEchappement || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Modèle</span>
                <span className="font-semibold text-white">{rachat.modeleEchappement || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">État</span>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {getEtatLabel(rachat.etatEchappement)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Type</span>
                <span className="font-semibold text-white">{rachat.typeEchappement || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-exhaust-orange" />
            Informations de contact
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Nom</p>
                <p className="text-white font-semibold mt-1">{rachat.prenomVendeur} {rachat.nomVendeur}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-white font-semibold mt-1">{rachat.emailVendeur}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Téléphone</p>
                <p className="text-white font-semibold mt-1">{rachat.telVendeur}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Adresse
                </p>
                <p className="text-white font-semibold mt-1">
                  {rachat.adresseVendeur}, {rachat.codePostalVendeur} {rachat.villeVendeur}
                </p>
              </div>
              {rachat.prixOfficiel && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Estimation</p>
                  <p className="text-exhaust-orange font-black text-lg mt-1">
                    {formatPrice(rachat.prixOfficiel)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expédition */}
      {(rachat.poidsKg || rachat.longueurCm || rachat.largeurCm || rachat.hauteurCm) && (
        <Card>
          <CardHeader>
            <h2 className="font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Expédition
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rachat.poidsKg && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Poids</span>
                  <span className="font-semibold text-white">{rachat.poidsKg} kg</span>
                </div>
              )}
              {(rachat.longueurCm || rachat.largeurCm || rachat.hauteurCm) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dimensions</span>
                  <span className="font-semibold text-white">
                    {rachat.hauteurCm || "—"} × {rachat.largeurCm || "—"} × {rachat.longueurCm || "—"} cm
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {rachat.description && (
        <Card>
          <CardHeader>
            <h2 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-exhaust-orange" />
              Notes additionnelles
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 whitespace-pre-wrap">{rachat.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Attestation */}
      {rachat.attestation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                Attestation
              </h2>
              <Badge className={rachat.attestation.estComplete ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}>
                {rachat.attestation.estComplete ? "✓ Signée" : "En attente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Numéro</span>
                <span className="font-semibold text-white">{rachat.attestation.numero}</span>
              </div>
              {rachat.attestation.signatureVendeurAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <span>✓ Vendeur</span>
                  </span>
                  <span className="text-green-400 text-sm">{formatDate(new Date(rachat.attestation.signatureVendeurAt))}</span>
                </div>
              )}
              {rachat.attestation.signatureAcheteurAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <span>✓ Acheteur</span>
                  </span>
                  <span className="text-green-400 text-sm">{formatDate(new Date(rachat.attestation.signatureAcheteurAt))}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-exhaust-orange" />
            Historique
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Demande créée</span>
              <span className="text-gray-300 text-sm">{formatDate(new Date(rachat.createdAt))}</span>
            </div>
            {rachat.signatureVendeurAt && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Signature</span>
                <span className="text-gray-300 text-sm">{formatDate(new Date(rachat.signatureVendeurAt))}</span>
              </div>
            )}
            {rachat.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Dernière mise à jour</span>
                <span className="text-gray-300 text-sm">{formatDate(new Date(rachat.updatedAt))}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aide */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-400 text-sm">
            Vous avez une question ? Contactez-nous à{" "}
            <a href="mailto:contact@power-exhaust.com" className="text-exhaust-orange hover:underline">
              contact@power-exhaust.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
