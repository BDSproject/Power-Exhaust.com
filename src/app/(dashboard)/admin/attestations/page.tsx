"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

interface AttestationDetail {
  id: string;
  numero: string;
  dateVente: string;
  prixFinal: number;
  estComplete: boolean;
  pdfUrl: string | null;
  signatureVendeur: string | null;
  signatureAcheteur: string | null;
  signatureVendeurAt: string | null;
  signatureAcheteurAt: string | null;
  createdAt: string;
  rachat: {
    id: string;
    reference: string;
    marque: string;
    modele: string;
    annee: number | null;
    etatEchappement: string;
    statut: string;
    nomVendeur: string;
    prenomVendeur: string;
    emailVendeur: string;
    telVendeur: string;
  };
}

export default function AdminAttestationsPage() {
  const [attestations, setAttestations] = useState<AttestationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStatut, setFilteredStatut] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const STATUTS = [
    "EN_ATTENTE",
    "VALIDE",
    "EN_COURS",
    "OFFRE_ENVOYEE",
    "ACCEPTE",
    "EN_EXPEDITION",
    "RECU",
    "PAYE",
    "NON_PAYE",
    "LITIGE",
    "REFUSE",
    "COMPLETE",
  ];

  useEffect(() => {
    fetchAttestations();
  }, []);

  const fetchAttestations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/attestations");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setAttestations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (attestationId: string, numero: string) => {
    try {
      setDownloadingId(attestationId);
      const res = await fetch(`/api/admin/attestations/${attestationId}/pdf`);
      if (!res.ok) throw new Error("Erreur téléchargement");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attestation_${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = attestations.filter((att) => {
    const matchesStatut = !filteredStatut || att.rachat.statut === filteredStatut;
    const matchesSearch =
      searchTerm === "" ||
      att.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.rachat.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.rachat.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.rachat.emailVendeur.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatut && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-exhaust-orange" />
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
      EN_EXPEDITION: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      PAYE: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[statut] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/admin/rachats" className="flex items-center gap-2 text-exhaust-orange hover:text-exhaust-orange-dark mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Attestations de vente</h1>
        <p className="text-gray-400">Gestion des attestations signées par les clients</p>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/3 border border-white/10 rounded-lg p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par n°, moto, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </div>

        <div className="bg-white/3 border border-white/10 rounded-lg p-3">
          <select
            value={filteredStatut || ""}
            onChange={(e) => setFilteredStatut(e.target.value || null)}
            className="w-full bg-transparent text-white outline-none text-sm"
          >
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-400 flex items-center justify-end">
          {filtered.length} attestation{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400">Erreur</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/3 border border-white/10 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-300 text-lg font-medium">Aucune attestation</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filteredStatut
              ? "Aucune attestation ne correspond à vos filtres"
              : "Aucune attestation trouvée"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((att) => (
            <div
              key={att.id}
              className="bg-white/3 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* En-tête de la carte */}
              <button
                onClick={() => setExpandedId(expandedId === att.id ? null : att.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-full bg-exhaust-orange/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-exhaust-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{att.numero}</p>
                    <p className="text-sm text-gray-400">
                      {att.rachat.marque} {att.rachat.modele}
                      {att.rachat.annee && <span> ({att.rachat.annee})</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mr-4">
                  <div className={`border rounded px-2 py-1 text-xs font-semibold ${getStatutColor(att.rachat.statut)}`}>
                    {att.rachat.statut.replace(/_/g, " ")}
                  </div>
                  <span className="text-sm font-bold text-exhaust-orange">{formatPrice(att.prixFinal)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {att.signatureVendeur && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-400">Signé</span>
                    </div>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === att.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Contenu détaillé */}
              {expandedId === att.id && (
                <div className="border-t border-white/10 bg-black/20 p-4 space-y-4">
                  {/* Infos client */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Client</p>
                      <p className="text-white font-medium">
                        {att.rachat.prenomVendeur} {att.rachat.nomVendeur}
                      </p>
                      <p className="text-sm text-gray-400 break-all">{att.rachat.emailVendeur}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Contact</p>
                      <p className="text-white">{att.rachat.telVendeur}</p>
                      <p className="text-sm text-gray-400">Réf. rachat: {att.rachat.reference}</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 bg-white/5 rounded p-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                        Signature vendeur
                      </p>
                      {att.signatureVendeur ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-400">Signé</span>
                          </div>
                          {att.signatureVendeurAt && (
                            <p className="text-xs text-gray-400">{formatDate(att.signatureVendeurAt)}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-sm text-amber-400">En attente</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                        Signature acheteur
                      </p>
                      {att.signatureAcheteur ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-400">Signé</span>
                          </div>
                          {att.signatureAcheteurAt && (
                            <p className="text-xs text-gray-400">{formatDate(att.signatureAcheteurAt)}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-sm text-amber-400">En attente</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bouton téléchargement */}
                  <button
                    onClick={() => downloadPdf(att.id, att.numero)}
                    disabled={downloadingId === att.id || !att.pdfUrl}
                    className="w-full flex items-center justify-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors"
                  >
                    {downloadingId === att.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {att.pdfUrl ? "Télécharger le PDF" : "PDF non disponible"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
