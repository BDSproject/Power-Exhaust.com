"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  FileText,
  Shield,
  Banknote,
  Images,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Eye,
} from "lucide-react";

type DocumentType = "identite" | "rib" | "photo" | "all";

interface Document {
  id: string;
  type: "identite" | "rib" | "photo";
  rachatId: string;
  rachatRef: string;
  rachatStatut: string;
  clientName: string;
  clientEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  recto?: boolean;
  verso?: boolean;
  typePiece?: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocumentType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/documents");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (doc: Document) => {
    try {
      setDownloadingId(doc.id);
      let url = `/api/admin/documents/${doc.id}/download`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur téléchargement");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesFilter = filter === "all" || doc.type === filter;
    const matchesSearch =
      searchTerm === "" ||
      doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.rachatRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDocIcon = (type: string, recto?: boolean, verso?: boolean) => {
    if (type === "identite") {
      if (recto && verso) return "🪪";
      return "📄";
    }
    if (type === "rib") return "🏦";
    return "📸";
  };

  const getDocLabel = (type: string, recto?: boolean, verso?: boolean) => {
    if (type === "identite") {
      if (recto && verso) return "ID (recto+verso)";
      if (verso) return "ID verso";
      return "ID recto";
    }
    if (type === "rib") return "RIB";
    return "Photo";
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-exhaust-orange" />
      </div>
    );
  }

  const stats = {
    total: documents.length,
    identite: documents.filter((d) => d.type === "identite").length,
    rib: documents.filter((d) => d.type === "rib").length,
    photo: documents.filter((d) => d.type === "photo").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/admin/rachats" className="flex items-center gap-2 text-exhaust-orange hover:text-exhaust-orange-dark mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Documents des clients</h1>
        <p className="text-gray-400">Tous les fichiers uploadés par les clients (identité, RIB, photos)</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white/3 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
            <Shield className="w-4 h-4" /> Identités
          </p>
          <p className="text-2xl font-bold text-blue-400">{stats.identite}</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
            <Banknote className="w-4 h-4" /> RIB
          </p>
          <p className="text-2xl font-bold text-green-400">{stats.rib}</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
            <Images className="w-4 h-4" /> Photos
          </p>
          <p className="text-2xl font-bold text-purple-400">{stats.photo}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/3 border border-white/10 rounded-lg p-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par client, email, moto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </div>

        <div className="bg-white/3 border border-white/10 rounded-lg p-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DocumentType)}
            className="flex-1 bg-transparent text-white outline-none text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="identite">Identités</option>
            <option value="rib">RIB</option>
            <option value="photo">Photos</option>
          </select>
        </div>

        <div className="text-sm text-gray-400 flex items-center justify-end">
          {filtered.length} document{filtered.length > 1 ? "s" : ""}
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

      {/* Liste des documents */}
      {filtered.length === 0 ? (
        <div className="bg-white/3 border border-white/10 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-300 text-lg font-medium">Aucun document</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filter !== "all"
              ? "Aucun document ne correspond à vos filtres"
              : "Aucun document trouvé"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Client</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Véhicule</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Rachat</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Statut</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Taille</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getDocIcon(doc.type, doc.recto, doc.verso)}</span>
                      <span className="text-gray-300">{getDocLabel(doc.type, doc.recto, doc.verso)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{doc.clientName}</p>
                      <p className="text-gray-400 text-xs">{doc.clientEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{doc.vehicleBrand} {doc.vehicleModel}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/rachats/${doc.rachatId}`}
                      className="text-exhaust-orange hover:text-exhaust-orange-dark font-mono text-xs underline"
                    >
                      {doc.rachatRef}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`border rounded px-2 py-1 text-xs font-semibold inline-block ${getStatutColor(doc.rachatStatut)}`}>
                      {doc.rachatStatut.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{formatFileSize(doc.size)}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(doc.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => downloadFile(doc)}
                      disabled={downloadingId === doc.id}
                      className="flex items-center justify-center gap-1 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded transition-colors text-xs"
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
