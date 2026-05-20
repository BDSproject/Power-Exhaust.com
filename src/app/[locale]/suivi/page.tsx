"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Search, Loader2, Package,
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Trophy, ArrowLeft, ExternalLink, RefreshCw,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PowerExhaustLogo } from "@/components/ui/Logo";

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
function formatDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatPrice(n: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(n);
}

function statutAccentColor(statut: string) {
  if (["REFUSE", "NON_PAYE"].includes(statut)) return "#ef4444";
  if (statut === "LITIGE") return "#eab308";
  if (statut === "PAYE" || statut === "COMPLETE") return "#22c55e";
  return "#E30613";
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function SuiviPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("suivi");
  const locale = params.locale ?? "fr";

  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuiviResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const r = p.get("ref");
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
      if (res.status === 404) { setError(t("error_not_found")); return; }
      if (!res.ok) { setError(t("error_generic")); return; }
      const data: SuiviResult = await res.json();
      setResult(data);
      window.history.replaceState({}, "", `/${locale}/suivi?ref=${encodeURIComponent(query)}`);
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
            <PowerExhaustLogo size="sm" href="/" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>{t("header_label")}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Hero ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-exhaust-orange bg-exhaust-orange/10 border border-exhaust-orange/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-exhaust-orange animate-pulse" />
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.8)" }}>
            {t("title")}
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">{t("desc")}</p>
        </div>

        {/* ── Formulaire ── */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-sm font-semibold text-gray-300 block">{t("label_ref")}</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={t("placeholder")}
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
                : <><Search className="w-4 h-4" /> {t("btn_search")}</>
              }
            </button>
          </div>
          <p className="text-xs text-gray-600">{t("hint")}</p>
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-400">{t("error_title")}</p>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
              <button
                onClick={() => { setError(null); setRef(""); inputRef.current?.focus(); }}
                className="text-xs text-red-400 hover:text-red-300 underline mt-2"
              >
                {t("btn_retry")}
              </button>
            </div>
          </div>
        )}

        {/* ── Résultat ── */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Carte résumé */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accent}30` }}>
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
                      className="px-3 py-1.5 rounded-full text-sm font-bold"
                      style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
                    >
                      {result.statutInfo.label}
                    </span>
                    <button onClick={refresh} disabled={refreshing} className="p-2 rounded-xl hover:bg-white/8 transition-all" title="Actualiser">
                      <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 px-4 py-3 rounded-xl text-sm text-gray-300" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {result.statutInfo.description}
                </div>

                {(result.prixAccepte || result.prixPropose) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {result.prixPropose && !result.prixAccepte && (
                      <div className="flex-1 min-w-40 px-4 py-3 rounded-xl" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                        <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide mb-1">{t("offer_proposed")}</p>
                        <p className="text-2xl font-black text-white">{formatPrice(result.prixPropose, locale)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t("offer_waiting")}</p>
                      </div>
                    )}
                    {result.prixAccepte && (
                      <div className="flex-1 min-w-40 px-4 py-3 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <p className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">{t("price_accepted")}</p>
                        <p className="text-2xl font-black text-white">{formatPrice(result.prixAccepte, locale)}</p>
                      </div>
                    )}
                  </div>
                )}

                {result.noteAdmin && (
                  <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1.5">{t("team_message")}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{result.noteAdmin}</p>
                  </div>
                )}

                {result.attestation && (
                  <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Attestation {result.attestation.numero}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {result.attestation.estComplete ? `✓ ${t("attestation_signed")}` : `⏳ ${t("attestation_pending")}`}
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

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                  <span>📅 {t("created_at")} {formatDate(result.createdAt, locale)}</span>
                  <span>🔄 {t("updated_at")} {formatDate(result.updatedAt, locale)}</span>
                </div>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="rounded-2xl p-6 space-y-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <span>🗓️</span> {t("progress_title")}
              </h3>

              {!result.isTerminal && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{t("progress_label")}</span>
                    <span className="font-semibold" style={{ color: accent }}>
                      {Math.round((result.timeline.filter((s) => s.done).length / result.timeline.length) * 100)}%
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

              <div className="space-y-0">
                {result.timeline.map((step, idx) => (
                  <div key={step.statut} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 z-10"
                        style={{
                          background: step.active ? accent : step.done ? `${accent}25` : "rgba(255,255,255,0.05)",
                          border: step.active ? `2px solid ${accent}` : step.done ? `1px solid ${accent}50` : "1px solid rgba(255,255,255,0.08)",
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
                          style={{ background: step.done && !step.active ? `linear-gradient(to bottom, ${accent}50, ${accent}20)` : "rgba(255,255,255,0.06)" }}
                        />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${idx === result.timeline.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold transition-all ${step.active ? "text-white" : step.done ? "text-gray-300" : "text-gray-600"}`}>
                          {step.label}
                        </p>
                        {step.active && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
                          >
                            {t("current_step")}
                          </span>
                        )}
                      </div>
                      {step.active && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

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
                <Package className="w-4 h-4" /> {t("btn_new_request")}
              </Link>
              <a
                href="mailto:contact@power-exhaust.com"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                ✉️ {t("btn_contact")}
              </a>
              <button
                onClick={() => { setResult(null); setRef(""); setError(null); window.history.replaceState({}, "", `/${locale}/suivi`); inputRef.current?.focus(); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> {t("btn_new_search")}
              </button>
            </div>

          </div>
        )}

        {/* ── État vide ── */}
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
              {t("empty_lost")}{" "}
              <a href="mailto:contact@power-exhaust.com" className="text-exhaust-orange hover:underline">
                {t("empty_contact")}
              </a>
            </p>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-white/6 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <span>{t("footer_copy")}</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> {t("footer_back")}
            </Link>
            <a href="mailto:contact@power-exhaust.com" className="hover:text-gray-400 transition-colors">{t("footer_contact")}</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
