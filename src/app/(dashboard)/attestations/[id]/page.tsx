"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AttestationPDF } from "@/components/pdf/AttestationPDF";
import { SignatureBlock } from "@/components/forms/SignatureBlock";
import { formatDate, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, Badge, Alert } from "@/components/ui";
import type { AttestationType, RachatType } from "@/types";
import { useSession } from "next-auth/react";

export default function AttestationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [attestation, setAttestation] = useState<AttestationType | null>(null);
  const [rachat, setRachat] = useState<RachatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = rachat?.userId === session?.user?.id;

  useEffect(() => {
    fetch(`/api/attestations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAttestation(data.attestation);
        setRachat(data.rachat);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-bmw-blue border-t-transparent" />
      </div>
    );
  }

  if (!attestation || !rachat) {
    return (
      <Alert type="error">
        <p className="font-semibold">Attestation introuvable</p>
        <p className="text-sm mt-1">Cette attestation n&apos;existe pas ou vous n&apos;avez pas les droits pour y accéder.</p>
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/attestations" className="text-sm text-gray-400 hover:text-exhaust-orange mb-2 inline-flex items-center gap-1">
            ← Retour aux attestations
          </Link>
          <h1 className="text-2xl font-bold text-white">Attestation N° {attestation.numero}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {rachat.marque} {rachat.modele} — {rachat.immatriculation}
          </p>
        </div>
        <Badge variant={attestation.estComplete ? "success" : "warning"}>
          {attestation.estComplete ? "✓ Complète" : "⏳ En cours"}
        </Badge>
      </div>

      {/* Résumé */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white">📋 Résumé de la transaction</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date de vente</p>
              <p className="font-semibold text-white">{formatDate(attestation.dateVente)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix de vente</p>
              <p className="font-bold text-2xl text-green-400">{formatPrice(attestation.prixFinal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendeur</p>
              <p className="font-semibold text-white">{rachat.prenomVendeur} {rachat.nomVendeur}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Véhicule</p>
              <p className="font-semibold text-white">{rachat.marque} {rachat.modele} ({rachat.annee})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État des signatures */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-white">✍️ Signatures</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${attestation.signatureVendeur ? "bg-green-900/50 text-green-400" : "bg-white/10 text-gray-500"}`}>
              {attestation.signatureVendeur ? "✓" : "–"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Vendeur — {rachat.prenomVendeur} {rachat.nomVendeur}</p>
              {attestation.signatureVendeurAt && (
                <p className="text-xs text-gray-400">Signé le {formatDate(attestation.signatureVendeurAt)}</p>
              )}
            </div>
            {attestation.signatureVendeur && (
              <img src={attestation.signatureVendeur} alt="Signature vendeur" className="h-10 object-contain" />
            )}
          </div>
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${attestation.signatureAcheteur ? "bg-green-900/50 text-green-400" : "bg-white/10 text-gray-500"}`}>
              {attestation.signatureAcheteur ? "✓" : "–"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Acheteur — Power Exhaust</p>
              {attestation.signatureAcheteurAt && (
                <p className="text-xs text-gray-400">Signé le {formatDate(attestation.signatureAcheteurAt)}</p>
              )}
            </div>
            {attestation.signatureAcheteur && (
              <img src={attestation.signatureAcheteur} alt="Signature acheteur" className="h-10 object-contain" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zone de signature */}
      {!attestation.estComplete && (
        <div className="space-y-4">
          {(isOwner || isAdmin) && !attestation.signatureVendeur && (
            <SignatureBlock
              attestation={attestation}
              rachat={rachat}
              role="vendeur"
              onComplete={() => setRefreshKey((k) => k + 1)}
            />
          )}
          {isAdmin && !attestation.signatureAcheteur && (
            <SignatureBlock
              attestation={attestation}
              rachat={rachat}
              role="acheteur"
              onComplete={() => setRefreshKey((k) => k + 1)}
            />
          )}
        </div>
      )}

      {/* Téléchargement PDF */}
      {attestation.estComplete && (
        <Card className="border-green-900/30 bg-green-950/20">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-900/30 flex items-center justify-center text-xl">📄</div>
              <div>
                <p className="font-semibold text-white">Attestation complète &amp; signée</p>
                <p className="text-sm text-gray-400">Téléchargez votre attestation en PDF</p>
              </div>
            </div>
            <PDFDownloadLink
              document={<AttestationPDF attestation={attestation} rachat={rachat} />}
              fileName={`Attestation_${attestation.numero}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button className="bg-exhaust-orange text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all text-sm">
                  {pdfLoading ? "Génération..." : "⬇ Télécharger PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
