"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Eye,
  FileText,
  RefreshCw,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";

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
] as const;

type Statut = (typeof STATUTS)[number];

interface StatutCfg {
  label: string;
  colorClass: string;
  bgStyle: string;
  dotClass: string;
  icon: string;
}

const STATUT_CFG: Record<Statut, StatutCfg> = {
  EN_ATTENTE:    { label: "En attente",    colorClass: "text-amber-400",   bgStyle: "rgba(245,158,11,0.12)",  dotClass: "bg-amber-400",   icon: "⏳" },
  VALIDE:        { label: "Validé",        colorClass: "text-blue-400",    bgStyle: "rgba(59,130,246,0.12)",  dotClass: "bg-blue-400",    icon: "✔️" },
  EN_COURS:      { label: "En cours",      colorClass: "text-violet-400",  bgStyle: "rgba(139,92,246,0.12)",  dotClass: "bg-violet-400",  icon: "⚙️" },
  OFFRE_ENVOYEE: { label: "Offre envoyée", colorClass: "text-orange-400",  bgStyle: "rgba(249,115,22,0.12)",  dotClass: "bg-orange-400",  icon: "💶" },
  ACCEPTE:       { label: "Accepté",       colorClass: "text-sky-400",     bgStyle: "rgba(56,189,248,0.12)",  dotClass: "bg-sky-400",     icon: "🤝" },
  EN_EXPEDITION: { label: "En expédition", colorClass: "text-indigo-400",  bgStyle: "rgba(99,102,241,0.12)",  dotClass: "bg-indigo-400",  icon: "📦" },
  RECU:          { label: "Reçu",          colorClass: "text-cyan-400",    bgStyle: "rgba(34,211,238,0.12)",  dotClass: "bg-cyan-400",    icon: "📬" },
  PAYE:          { label: "Payé",          colorClass: "text-green-400",   bgStyle: "rgba(34,197,94,0.12)",   dotClass: "bg-green-400",   icon: "✅" },
  NON_PAYE:      { label: "Non payé",      colorClass: "text-rose-400",    bgStyle: "rgba(244,63,94,0.12)",   dotClass: "bg-rose-400",    icon: "⚠️" },
  LITIGE:        { label: "Litige",        colorClass: "text-yellow-300",  bgStyle: "rgba(253,224,71,0.10)",  dotClass: "bg-yellow-300",  icon: "⚖️" },
  REFUSE:        { label: "Refusé",        colorClass: "text-red-400",     bgStyle: "rgba(239,68,68,0.12)",   dotClass: "bg-red-400",     icon: "❌" },
  COMPLETE:      { label: "Complété",      colorClass: "text-gray-400",    bgStyle: "rgba(107,114,128,0.12)", dotClass: "bg-gray-400",    icon: "🏆" },
};

interface Rachat {
  id: string;
  marque: string;
  modele: string;
  typeEchappement: string | null;
  etat: string;
  annee: number;
  statut: Statut;
  prixPropose: number | null;
  createdAt: string;
  nomVendeur: string;
  prenomVendeur: string;
  emailVendeur: string;
  user: { name: string | null; email: string } | null;
  attestation: { id: string } | null;
}

export default function AdminRachatsPage() {
  const [rachats, setRachats] = useState<Rachat[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<Statut | "TOUS">("TOUS");
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchRachats = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/rachat");
    const data = await res.json();
    setRachats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRachats();
    const interval = setInterval(fetchRachats, 60000);
    return () => clearInterval(interval);
  }, [fetchRachats]);

  const updateStatut = async (id: string, statut: string) => {
    setUpdating(id);
    setOpenDropdown(null);
    await fetch(`/api/rachat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    await fetchRachats();
    setUpdating(null);
  };

  const creerAttestation = async (rachatId: string, prixFinal: number) => {
    const res = await fetch("/api/attestations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rachatId, prixFinal }),
    });
    if (res.ok) {
      const att = await res.json();
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = `/attestations/${att.id}`;
    }
  };

  const filtered = rachats.filter((r) => {
    const matchStatut = filterStatut === "TOUS" || r.statut === filterStatut;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.marque.toLowerCase().includes(q) ||
      r.modele.toLowerCase().includes(q) ||
      (r.user?.email.toLowerCase().includes(q) ?? false) ||
      (r.user?.name?.toLowerCase().includes(q) ?? false) ||
      r.emailVendeur.toLowerCase().includes(q) ||
      `${r.prenomVendeur} ${r.nomVendeur}`.toLowerCase().includes(q);
    return matchStatut && matchSearch;
  });

  const counts = STATUTS.reduce(
    (acc, s) => ({ ...acc, [s]: rachats.filter((r) => r.statut === s).length }),
    {} as Record<Statut, number>
  );

  const urgents = counts["EN_ATTENTE"] ?? 0;

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "#0A0A0A" }}
      onClick={() => setOpenDropdown(null)}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Gestion des rachats
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {rachats.length} dossier{rachats.length > 1 ? "s" : ""} au total
              {urgents > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {urgents} en attente de traitement
                </span>
              )}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); fetchRachats(); }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-gray-300 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Compteurs par statut cliquables */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
          {STATUTS.map((s) => {
            const cfg = STATUT_CFG[s];
            const active = filterStatut === s;
            return (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); setFilterStatut(active ? "TOUS" : s); }}
                className="flex flex-col items-start p-3 rounded-xl transition-all text-left"
                style={{
                  background: active ? cfg.bgStyle : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <div className={`text-sm mb-1 ${cfg.colorClass}`}>
                  <span className="mr-1">{cfg.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide hidden lg:inline">
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xl font-black text-white">{counts[s]}</p>
                <p className={`text-[10px] font-semibold mt-0.5 lg:hidden ${cfg.colorClass}`}>
                  {cfg.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Recherche + filtre actif */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-2 flex-1 min-w-48 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher marque, modèle, client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm placeholder-gray-500 outline-none flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filterStatut !== "TOUS" && (
            <button
              onClick={(e) => { e.stopPropagation(); setFilterStatut("TOUS"); }}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${STATUT_CFG[filterStatut].colorClass}`}
              style={{ background: STATUT_CFG[filterStatut].bgStyle, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Filter className="w-3.5 h-3.5" />
              {STATUT_CFG[filterStatut].label}
              <XCircle className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des dossiers */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 font-medium">Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const cfg = STATUT_CFG[r.statut] ?? STATUT_CFG["EN_ATTENTE"];
              const isUpdating = updating === r.id;
              const isOpen = openDropdown === r.id;

              return (
                <div
                  key={r.id}
                  className="relative rounded-2xl transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Bande couleur statut à gauche */}
                  <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${cfg.dotClass}`} />

                  <div className="pl-5 pr-5 py-4 flex flex-wrap items-start gap-4">
                    {/* Infos dossier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-black text-white text-sm">
                          {r.marque} {r.modele}
                        </p>
                        {r.typeEchappement && (
                          <span className="text-gray-500 text-xs">· {r.typeEchappement}</span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.colorClass}`}
                          style={{ background: cfg.bgStyle }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
                        <span>👤 {r.user?.name || r.user?.email || `${r.prenomVendeur} ${r.nomVendeur}`}</span>
                        <span>✉️ {r.emailVendeur}</span>
                        <span>📅 {formatDate(r.createdAt)}</span>
                        <span>🔧 État : {r.etat}</span>
                        {r.prixPropose && (
                          <span className="text-green-400 font-bold">
                            💶 Offre : {formatPrice(r.prixPropose)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>

                      {/* Dropdown changement de statut */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(isOpen ? null : r.id)}
                          disabled={isUpdating}
                          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${cfg.colorClass}`}
                          style={{ background: cfg.bgStyle, border: "1px solid rgba(255,255,255,0.1)", minWidth: "150px" }}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>{cfg.icon}</span>
                          )}
                          <span className="flex-1 text-left text-white">{cfg.label}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div
                            className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid rgba(255,255,255,0.12)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                              minWidth: "170px",
                            }}
                          >
                            {STATUTS.map((s) => {
                              const c = STATUT_CFG[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatut(r.id, s)}
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-white/5 ${c.colorClass} ${r.statut === s ? "bg-white/5" : ""}`}
                                >
                                  <span>{c.icon}</span>
                                  {c.label}
                                  {r.statut === s && (
                                    <span className="ml-auto text-[10px] opacity-50">actuel</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Créer attestation si accepté sans attestation */}
                      {r.statut === "ACCEPTE" && !r.attestation && r.prixPropose && (
                        <button
                          onClick={() => creerAttestation(r.id, r.prixPropose!)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
                          style={{ background: "linear-gradient(135deg, #E30613, #b8000f)" }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Créer attestation
                        </button>
                      )}

                      {/* Voir attestation existante */}
                      {r.attestation && (
                        <Link href={`/attestations/${r.attestation.id}`}>
                          <button
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-green-400 hover:text-white transition-colors"
                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Attestation
                          </button>
                        </Link>
                      )}

                      {/* Voir le dossier complet */}
                      <Link href={`/rachats/${r.id}`}>
                        <button
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Dossier
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
