"use client";

import { useState } from "react";
import { SignaturePad } from "@/components/forms/SignaturePad";
import { Button, Alert, Card, CardContent, CardHeader } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import type { AttestationType, RachatType } from "@/types";

interface SignatureBlockProps {
  attestation: AttestationType;
  rachat: RachatType;
  role: "vendeur" | "acheteur";
  onComplete?: () => void;
}

export function SignatureBlock({
  attestation,
  rachat,
  role,
  onComplete,
}: SignatureBlockProps) {
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const alreadySigned =
    role === "vendeur"
      ? !!attestation.signatureVendeur
      : !!attestation.signatureAcheteur;

  const handleSaveSignature = async () => {
    if (!signatureData) {
      setError("Veuillez signer avant de valider");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/attestations/${attestation.id}/signer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, signature: signatureData }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.message ?? "Erreur lors de l'enregistrement");
        return;
      }

      setDone(true);
      onComplete?.();
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  if (alreadySigned || done) {
    return (
      <Alert type="success">
        <p className="font-semibold">
          Signature {role === "vendeur" ? "du vendeur" : "de l'acheteur"} enregistrée
        </p>
        <p className="text-sm mt-1">
          Signée le{" "}
          {formatDate(
            role === "vendeur"
              ? attestation.signatureVendeurAt!
              : attestation.signatureAcheteurAt!
          )}
        </p>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-gray-900">
          {role === "vendeur"
            ? "✍️ Signature du vendeur"
            : "✍️ Signature de l'acheteur (Alchimiste BMW)"}
        </h3>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Résumé de l'attestation */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-1">
          <p>
            <span className="font-medium">N° Attestation :</span> {attestation.numero}
          </p>
          <p>
            <span className="font-medium">Date de vente :</span>{" "}
            {formatDate(attestation.dateVente)}
          </p>
          <p>
            <span className="font-medium">Prix de vente :</span>{" "}
            {formatPrice(attestation.prixFinal)}
          </p>
          <p>
            <span className="font-medium">Vendeur :</span>{" "}
            {rachat.prenomVendeur} {rachat.nomVendeur}
          </p>
          <p>
            <span className="font-medium">Véhicule :</span>{" "}
            {rachat.marque} {rachat.modele} — {rachat.immatriculation}
          </p>
        </div>

        {/* Clause légale */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-2">📋 Déclaration</p>
          {role === "vendeur" ? (
            <p>
              Je soussigné(e), {rachat.prenomVendeur} {rachat.nomVendeur}, déclare
              céder à titre onéreux la ligne d&apos;échappement décrite ci-dessus pour le
              montant de {formatPrice(attestation.prixFinal)}, et certifie être
              l&apos;unique propriétaire de cette pièce, libre de tout gage ou opposition.
            </p>
          ) : (
            <p>
              La société Alchimiste BMW déclare acquérir la pièce décrite ci-dessus
              au prix convenu de {formatPrice(attestation.prixFinal)}.
            </p>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <SignaturePad
          label={
            role === "vendeur"
              ? "Signature du vendeur"
              : "Signature Alchimiste BMW"
          }
          onSave={(data) => setSignatureData(data)}
        />

        <Button
          onClick={handleSaveSignature}
          isLoading={saving}
          className="w-full"
          size="lg"
          disabled={!signatureData}
        >
          ✓ Valider et enregistrer ma signature
        </Button>
      </CardContent>
    </Card>
  );
}
