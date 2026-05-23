"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Shield,
  Banknote,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

interface RachatDetail {
  id: string;
  reference: string;
  statut: string;
  marque: string;
  modele: string;
  annee?: number;
  etatEchappement: string;
  nomVendeur: string;
  prenomVendeur: string;
  emailVendeur: string;
  telVendeur: string;
  prixPropose?: number;
  prixAccepte?: number;
  noteAdmin?: string;
  createdAt: string;
  updatedAt: string;
  identite?: {
    id: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    typePiece: string;
    numeroPiece: string;
    fichierRectoUuid?: string;
    fichierVersoUuid?: string;
    fichierRectoMime?: string;
    fichierVersoMime?: string;
    consentementTraitement: boolean;
    consentementConservation: boolean;
    consentementAt?: string;
    createdAt: string;
  };
  rib?: {
    id: string;
    fichierUuid: string;
    fichierMime: string;
    createdAt: string;
  };
}

export default function AdminRachatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rachatId = params.id as string;

  const [rachat, setRachat] = useState<RachatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIdentitePreview, setShowIdentitePreview] = useState(false);
  const [showRibPreview, setShowRibPreview] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    fetchRachatDetail();
  }, [rachatId]);

  const fetchRachatDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/rachats/${rachatId}`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setRachat(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
      setRachat(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileType: "recto" | "verso" | "rib") => {
    if (!rachat) return;
    if (!rachat?.identite && fileType !== "rib") return;
    if (!rachat?.rib && fileType === "rib") return;

    try {
      setDownloadingFile(fileType);
      const url = `/api/identite/${rachatId}/fichier/${fileType}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      let filename = `rachat_${rachat.reference}_${fileType}`;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("jpeg")) filename += ".jpg";
      else if (contentType?.includes("png")) filename += ".png";
      else if (contentType?.includes("webp")) filename += ".webp";
      else if (contentType?.includes("pdf")) filename += ".pdf";

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Erreur téléchargement: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    } finally {
      setDownloadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-exhaust-orange" />
      </div>
    );
  }

  if (error || !rachat) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/admin/rachats" className="flex items-center gap-2 text-exhaust-orange hover:text-exhaust-orange-dark mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400">Erreur</p>
            <p className="text-red-300 text-sm mt-1">{error || "Rachat introuvable"}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      EN_ATTENTE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      VALIDE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      EN_COURS: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      ACCEPTE: "bg-green-500/20 text-green-400 border-green-500/30",
      REFUSE: "bg-red-500/20 text-red-400 border-red-500/30",
      COMPLETE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return colors[statut] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/admin/rachats" className="flex items-center gap-2 text-exhaust-orange hover:text-exhaust-orange-dark mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              {rachat.marque} {rachat.modele}
              {rachat.annee && <span className="text-gray-400 ml-2">({rachat.annee})</span>}
            </h1>
            <p className="text-gray-400">
              Référence: <span className="font-mono text-exhaust-orange">{rachat.reference}</span>
            </p>
          </div>
          <div className={`border rounded-lg px-4 py-2 ${getStatutColor(rachat.statut)}`}>
            <p className="font-semibold text-sm">{rachat.statut.replace(/_/g, " ")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche — Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <div className="bg-white/3 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-exhaust-orange" />
              Client
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Nom complet</p>
                <p className="text-white font-semibold">{rachat.prenomVendeur} {rachat.nomVendeur}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white break-all">{rachat.emailVendeur}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Téléphone</p>
                  <p className="text-white">{rachat.telVendeur}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">État de l'échappement</p>
                  <p className="text-white capitalize">{rachat.etatEchappement.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date de demande</p>
                  <p className="text-white">{formatDate(rachat.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          {(rachat.prixPropose || rachat.prixAccepte) && (
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Offre</h2>
              <div className="space-y-3">
                {rachat.prixPropose && (
                  <div>
                    <p className="text-gray-400 text-sm">Prix proposé</p>
                    <p className="text-2xl font-black text-exhaust-orange">{formatPrice(rachat.prixPropose)}</p>
                  </div>
                )}
                {rachat.prixAccepte && (
                  <div>
                    <p className="text-gray-400 text-sm">Prix accepté</p>
                    <p className="text-xl font-bold text-green-400">{formatPrice(rachat.prixAccepte)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes admin */}
          {rachat.noteAdmin && (
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-3">Notes admin</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{rachat.noteAdmin}</p>
            </div>
          )}
        </div>

        {/* Colonne droite — Documents */}
        <div className="space-y-6">
          {/* Pièce d'identité */}
          <div className="bg-white/3 border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-exhaust-orange" />
              Pièce d'identité
            </h2>

            {rachat.identite ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-300">Document reçu</p>
                    <p className="text-green-200 text-xs mt-1">{formatDate(rachat.identite.createdAt)}</p>
                  </div>
                </div>

                <div className="text-sm space-y-2 bg-white/5 rounded p-3">
                  <div>
                    <p className="text-gray-400 text-xs">Type</p>
                    <p className="text-white">{rachat.identite.typePiece}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Numéro</p>
                    <p className="text-white font-mono">{rachat.identite.numeroPiece}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {rachat.identite.fichierRectoUuid && (
                    <button
                      onClick={() => downloadFile("recto")}
                      disabled={downloadingFile === "recto"}
                      className="w-full flex items-center justify-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors text-sm"
                    >
                      {downloadingFile === "recto" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Télécharger Recto
                    </button>
                  )}

                  {rachat.identite.fichierVersoUuid && (
                    <button
                      onClick={() => downloadFile("verso")}
                      disabled={downloadingFile === "verso"}
                      className="w-full flex items-center justify-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors text-sm"
                    >
                      {downloadingFile === "verso" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Télécharger Verso
                    </button>
                  )}
                </div>

                {rachat.identite.consentementTraitement && (
                  <div className="text-xs text-green-400 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>RGPD accepté</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-300">En attente</p>
                  <p className="text-amber-200 text-xs mt-1">Pas encore reçu</p>
                </div>
              </div>
            )}
          </div>

          {/* RIB */}
          <div className="bg-white/3 border border-white/10 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-exhaust-orange" />
              RIB
            </h2>

            {rachat.rib ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-300">Document reçu</p>
                    <p className="text-green-200 text-xs mt-1">{formatDate(rachat.rib.createdAt)}</p>
                  </div>
                </div>

                <button
                  onClick={() => downloadFile("rib")}
                  disabled={downloadingFile === "rib"}
                  className="w-full flex items-center justify-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors text-sm"
                >
                  {downloadingFile === "rib" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Télécharger RIB
                </button>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-300">En attente</p>
                  <p className="text-amber-200 text-xs mt-1">Pas encore reçu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
