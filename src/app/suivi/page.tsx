"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Loader2, ChevronRight, Package,
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Trophy, ArrowLeft, ExternalLink, RefreshCw,
} from "lucide-react";
import LanguageSwitcherSimple from "@/components/LanguageSwitcherSimple";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface TimelineStep {
  statut: string;
  label: string;
  description: string;
  icon: string;
  done: boolean;
  active: boolean;
}

interface SuiviResult {
  reference: string;
  statut: string;
  statutInfo: { label: string; description: string; icon: string };
  isTerminal: boolean;
  marque: string;
  modele: string;
  annee: number;
  typeEchappement: string;
  prenomVendeur: string;
  createdAt: string;
  updatedAt: string;
  prixAccepte: number | null;
  prixPropose: number | null;
  noteAdmin: string | null;
  attestation: { id: string; numero: string; estComplete: boolean } | null;
  timeline: TimelineStep[];
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

/* ─── Couleur de la barre de progression ────────────────────────────────────── */
function statutAccentColor(statut: string) {
  if (["REFUSE", "NON_PAYE"].includes(statut)) return "#ef4444";
  if (statut === "LITIGE") return "#eab308";
  if (statut === "PAYE" || statut === "COMPLETE") return "#22c55e";
  return "#E30613"; // exhaust-orange
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function SuiviPage() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuiviResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lire le param URL au montage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("ref");
    if (r) { setRef(r.toUpperCase()); search(r.toUpperCase()); }
    else inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async (refOverride?: string) => {
    const query = (refOverride ?? ref).trim().toUpperCase();
    if (!query) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/suivi?ref=${encodeURIComponent(query)}`);
      if (res.status === 404) {
        setError("Aucune demande trouvée pour cette référence. Vérifiez le numéro et réessayez.");
        return;
      }
      if (!res.ok) {
        setError("Une erreur est survenue. Réessayez dans quelques instants.");
        return;
      }
      const data: SuiviResult = await res.json();
      setResult(data);
      // Mettre à jour l'URL sans recharger
      window.history.replaceState({}, "", `/suivi?ref=${encodeURIComponent(query)}`);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!result) return;
    setRefreshing(true);
    await search(result.reference);
    setRefreshing(false);
  };

  const accent = result ? statutAccentColor(result.statut) : "#E30613";

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* ── Header ── */}
      <header className="border-b border-white/8 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-exhaust-orange flex items-center justify-center text-white font-black text-sm">PE</div>
            <span className="font-bold text-white text-lg hidden sm:block">Power Exhaust</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>Suivi de rachat</span>
            </div>
            <LanguageSwitcherSimple />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Hero ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-exhaust-orange bg-exhaust-orange/10 border border-exhaust-orange/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-exhaust-orange animate-pulse" />
            Suivi en temps réel
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.8)" }}>
            Où en est ma reprise ?
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Entrez votre numéro de référence pour suivre l&apos;état de votre demande de rachat d&apos;échappement.
          </p>
        </div>

        {/* ── Formulaire de recherche ── */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-sm font-semibold text-gray-300 block">
            Numéro de référence
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Ex : A1B2C3D4"
                maxLength={20}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-gray-500 bg-[#1a1a1a] border focus:outline-none focus:ring-2 transition-all font-mono text-base tracking-widest"
                style={{
                  borderColor: ref ? "rgba(227,6,19,0.4)" : "rgba(255,255,255,0.1)",
                  // @ts-expect-error - CSS custom property
                  "--tw-ring-color": "#E30613",
                }}
              />
            </div>
            <button
              onClick={() => search()}
              disabled={!ref.trim() || loading}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center gap-2 flex-shrink-0"
              style={{ background: "#E30613" }}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Search className="w-4 h-4" /> Suivre</>
              }
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Votre référence se trouve dans l&apos;email de confirmation reçu après votre demande.
          </p>
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-400">Référence introuvable</p>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
              <button
                onClick={() => { setError(null); setRef(""); inputRef.current?.focus(); }}
                className="text-xs text-red-400 hover:text-red-300 underline mt-2"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* ── Résultat ── */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Carte résumé */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accent}30` }}>
              {/* Bande couleur statut */}
              <div className="h-1.5 w-full" style={{ background: accent }} />

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-500 tracking-widest">#{result.reference}</span>
                      <span className="text-lg">{result.statutInfo.icon}</span>
                    </div>
                    <h2 className="text-xl font-black text-white">
                      {result.marque} {result.modele} <span className="text-gray-500 font-normal">({result.annee})</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-0.5">{result.typeEchappement}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
                      style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
                    >
                      {result.statutInfo.label}
                    </span>
                    <button
                      onClick={refresh}
                      disabled={refreshing}
                      className="p-2 rounded-xl hover:bg-white/8 transition-all"
                      title="Actualiser"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Message statut */}
                <div className="mt-4 px-4 py-3 rounded-xl text-sm text-gray-300" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {result.statutInfo.description}
                </div>

                {/* Prix proposé / accepté */}
                {(result.prixAccepte || result.prixPropose) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {result.prixPropose && !result.prixAccepte && (
                      <div className="flex-1 min-w-40 px-4 py-3 rounded-xl" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                        <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide mb-1">Offre proposée</p>
                        <p className="text-2xl font-black text-white">{formatPrice(result.prixPropose)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">En attente de votre acceptation</p>
                      </div>
                    )}
                    {result.prixAccepte && (
                      <div className="flex-1 min-w-40 px-4 py-3 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <p className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">Prix de rachat accepté</p>
                        <p className="text-2xl font-black text-white">{formatPrice(result.prixAccepte)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Note de l'équipe */}
                {result.noteAdmin && (
                  <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1.5">Message de l&apos;équipe</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{result.noteAdmin}</p>
                  </div>
                )}

                {/* Attestation */}
                {result.attestation && (
                  <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Attestation {result.attestation.numero}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {result.attestation.estComplete ? "✓ Signée par les deux parties" : "⏳ En attente de signature"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/attestations/${result.attestation.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all"
                      style={{ background: accent }}
                    >
                      Voir <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                  <span>📅 Créée le {formatDate(result.createdAt)}</span>
                  <span>🔄 Mise à jour le {formatDate(result.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="rounded-2xl p-6 space-y-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <span>🗓️</span> Progression du dossier
              </h3>

              {/* Barre de progression globale */}
              {!result.isTerminal && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Avancement</span>
                    <span className="font-semibold" style={{ color: accent }}>
                      {Math.round(((result.timeline.filter((s) => s.done).length) / result.timeline.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(result.timeline.filter((s) => s.done).length / result.timeline.length) * 100}%`,
                        background: `linear-gradient(90deg, ${accent}99, ${accent})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Étapes */}
              <div className="space-y-0">
                {result.timeline.map((step, idx) => (
                  <div key={step.statut} className="flex gap-4">
                    {/* Connecteur vertical */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 z-10"
                        style={{
                          background: step.active
                            ? accent
                            : step.done
                              ? `${accent}25`
                              : "rgba(255,255,255,0.05)",
                          border: step.active
                            ? `2px solid ${accent}`
                            : step.done
                              ? `1px solid ${accent}50`
                              : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: step.active ? `0 0 16px ${accent}50` : "none",
                        }}
                      >
                        {step.active ? (
                          <span className="text-xs font-black text-white">{step.icon}</span>
                        ) : step.done ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: accent }} />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-gray-700" />
                        )}
                      </div>
                      {idx < result.timeline.length - 1 && (
                        <div
                          className="w-0.5 h-8 mt-0.5 transition-all duration-300"
                          style={{
                            background: step.done && !step.active
                              ? `linear-gradient(to bottom, ${accent}50, ${accent}20)`
                              : "rgba(255,255,255,0.06)",
                          }}
                        />
                      )}
                    </div>

                    {/* Contenu étape */}
                    <div className={`flex-1 pb-6 ${idx === result.timeline.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold transition-all ${
                            step.active ? "text-white" : step.done ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.active && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
                          >
                            Étape actuelle
                          </span>
                        )}
                      </div>
                      {step.active && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cas terminaux hors workflow (REFUSE, LITIGE, NON_PAYE) */}
              {result.isTerminal && !result.timeline.some((s) => s.active) && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
                  {result.statut === "REFUSE"
                    ? <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                    : result.statut === "COMPLETE"
                      ? <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                      : <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                  }
                  <p className="text-sm font-semibold" style={{ color: accent }}>
                    {result.statutInfo.label} — {result.statutInfo.description}
                  </p>
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rachats/nouveau"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "#E30613" }}
              >
                <Package className="w-4 h-4" /> Nouvelle demande
              </Link>
              <a
                href="mailto:contact@power-exhaust.com"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                ✉️ Contacter l&apos;équipe
              </a>
              <button
                onClick={() => { setResult(null); setRef(""); setError(null); window.history.replaceState({}, "", "/suivi"); inputRef.current?.focus(); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Nouvelle recherche
              </button>
            </div>

          </div>
        )}

        {/* ── État vide initial ── */}
        {!result && !error && !loading && (
          <div className="text-center py-8 space-y-6">
            <div
              className="inline-grid grid-cols-3 gap-3 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
                { icon: "📥", label: "Demande reçue" },
                { icon: "🔍", label: "Analyse" },
                { icon: "💶", label: "Offre" },
                { icon: "🤝", label: "Accepté" },
                { icon: "📦", label: "Expédition" },
                { icon: "💳", label: "Paiement" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[11px] text-gray-600 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              Vous avez perdu votre numéro de référence ?{" "}
              <a href="mailto:contact@power-exhaust.com" className="text-exhaust-orange hover:underline">
                Contactez-nous
              </a>
            </p>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-white/6 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <span>© 2026 Power Exhaust — Rachat de lignes d&apos;échappement moto</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Retour au site
            </Link>
            <a href="mailto:contact@power-exhaust.com" className="hover:text-gray-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
