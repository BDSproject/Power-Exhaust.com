"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rachatPublicSchema, type RachatPublicFormData } from "@/lib/validations";
import { MOTO_MODELS } from "@/data/moto-models";
import { Input, Button, Alert } from "@/components/ui";
import { useTranslations } from "next-intl";
import {
  Check, ChevronLeft, ChevronRight, ChevronDown, Tag, User,
  CheckCircle2, Camera, X, MessageSquare, PenLine, AlertTriangle,
  Zap, Package, MapPin, Truck, Clock, Banknote, Lock, Shield,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ScanSearch, FileText,
} from "lucide-react";
import { SignaturePad } from "@/components/forms/SignaturePad";

interface ExhaustBrand {
  id: string;
  name: string;
}

interface ExhaustModel {
  id: string;
  name: string;
}

const MOTO_MARQUES = Object.keys(MOTO_MODELS);

// ─── PhotoSlot ────────────────────────────────────────────────────────────────
function PhotoSlot({
  index,
  preview,
  angle,
  onFile,
  onRemove,
}: {
  index: number;
  preview: string | null;
  angle: { label: string; icon: React.ElementType };
  onFile: (file: File, index: number) => void;
  onRemove: (index: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden aspect-square border-2 border-white/20 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={angle.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
            <p className="text-white text-[10px] font-medium truncate">{angle.label}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/15 hover:border-exhaust-orange/60 hover:bg-exhaust-orange/5 flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <angle.icon className="w-5 h-5 text-gray-500 group-hover:text-exhaust-orange transition-colors" />
          <Camera className="w-4 h-4 text-gray-600 group-hover:text-exhaust-orange transition-colors" />
          <p className="text-[10px] text-gray-600 group-hover:text-gray-300 text-center px-1 leading-tight">{angle.label}</p>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file, index);
        }}
      />
    </div>
  );
}

// ─── Compteur animé ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AnimatedPrice({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setVisible(true), 80);
    const duration = 1200;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [target]);

  return (
    <span className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {displayed.toLocaleString("fr-FR")}
    </span>
  );
}

// ─── Étape 3 — Informations colis ────────────────────────────────────────────
type StepColisProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  onBack: () => void;
  onContinue: () => Promise<void>;
};

function StepColis({ register, errors, watch, onBack, onContinue }: StepColisProps) {
  const t = useTranslations("wizard");
  return (
    <div>
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors">
        <ChevronLeft className="w-4 h-4" /> {t("back")}
      </button>

      <div className="flex items-center gap-3 p-4 bg-white/4 border border-white/10 rounded-2xl mb-8">
        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-300 truncate">
          <span className="font-semibold text-white">{watch("prenomVendeur")} {watch("nomVendeur")}</span>
          <span className="text-gray-500 mx-1.5">·</span>
          <span className="text-gray-400">{watch("emailVendeur")}</span>
        </p>
        <button type="button" onClick={onBack} className="ml-auto text-xs text-gray-500 hover:text-exhaust-orange transition-colors underline underline-offset-2 flex-shrink-0">
          {t("modify")}
        </button>
      </div>

      <div className="space-y-5">
        {/* Adresse */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-exhaust-orange" />
            <h3 className="font-bold text-white">{t("shipping_address")}</h3>
            <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{t("sender")}</span>
          </div>
          <div className="space-y-4">
            <Input
              label={t("address_label")}
              placeholder="12 rue de la Paix"
              error={errors.adresseVendeur?.message}
              required
              {...register("adresseVendeur")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("city_label")}
                placeholder="Paris"
                error={errors.villeVendeur?.message}
                required
                {...register("villeVendeur")}
              />
              <Input
                label={t("zip_label")}
                placeholder="75001"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                error={errors.codePostalVendeur?.message}
                required
                {...register("codePostalVendeur")}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-300">{t("relay_title")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("relay_desc")}</p>
            </div>
          </div>
        </div>

        {/* Colis */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-exhaust-orange" />
            <h3 className="font-bold text-white">{t("package_section")}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                {t("weight_label")} <span className="text-exhaust-orange">*</span>
                <span className="text-gray-600 font-normal ml-1">({t("weight_with_packaging")})</span>
              </label>
              <div className="relative max-w-[180px]">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  placeholder="2.5"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-white/15 bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all [appearance:textfield]"
                  {...register("poidsKg", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">kg</span>
              </div>
              {errors.poidsKg && <p className="text-red-400 text-xs mt-1">{errors.poidsKg.message}</p>}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5">
                {t("dimensions_label")} <span className="text-gray-600 font-normal">({t("dimensions_optional")})</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("length"), field: "longueurCm", placeholder: "30" },
                  { label: t("width"),  field: "largeurCm",  placeholder: "20" },
                  { label: t("height"), field: "hauteurCm",  placeholder: "15" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        placeholder={placeholder}
                        className="w-full px-2 py-2 pr-7 rounded-xl border border-white/15 bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all [appearance:textfield]"
                        {...register(field, { valueAsNumber: true })}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-[10px] pointer-events-none">cm</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-600 mt-2">{t("dimensions_default")}</p>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={onContinue}
        size="lg"
        className="w-full mt-6 bg-exhaust-orange hover:bg-exhaust-orange-dark font-black"
      >
        {t("btn_verify")} <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

// ─── Étape 6 — Récapitulatif ─────────────────────────────────────────────────
type Step3Props = {
  selectedEtat: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSubmit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  isSubmitting: boolean;
  setStep: (n: number) => void;
  previews: (string | null)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETATS: any[];
};

function Step3({ selectedEtat, register, handleSubmit, onSubmit, watch, isSubmitting, setStep, previews, ETATS }: Step3Props) {
  const t = useTranslations("wizard");
  const etatInfo = ETATS.find((e: { value: string }) => e.value === selectedEtat);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors">
        <ChevronLeft className="w-4 h-4" /> {t("modify")}
      </button>

      <div className="mb-8 rounded-3xl border border-exhaust-orange/25 bg-exhaust-orange/5 p-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/8 rounded-full px-4 py-1.5 text-sm mb-4">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${etatInfo?.dot ?? "bg-gray-400"}`} />
          <span className={`font-semibold ${etatInfo?.text ?? "text-gray-400"}`}>{etatInfo?.label}</span>
          {watch("typeEchappement") && <><span className="text-gray-500">·</span><span className="text-gray-300">{watch("typeEchappement")}</span></>}
        </div>
        <p className="text-white font-bold text-lg mb-1">{t("offer_title")}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{t("offer_desc")}</p>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-black text-white mb-1">{t("recap_title")}</h2>
        <p className="text-gray-500 text-sm">{t("recap_subtitle")}</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("recap_exhaust")}</p>
          {(watch("marqueEchappement") || watch("modeleEchappement")) && (
            <p className="font-bold text-white">
              {watch("marqueEchappement")}
              {watch("marqueEchappement") && watch("modeleEchappement") ? " — " : ""}
              {watch("modeleEchappement")}
            </p>
          )}
          {watch("typeEchappement") && (
            <p className={`text-sm mt-0.5 ${watch("marqueEchappement") || watch("modeleEchappement") ? "text-gray-400" : "font-bold text-white"}`}>{watch("typeEchappement")}</p>
          )}
          <span className={`text-sm font-semibold ${etatInfo?.text ?? "text-gray-400"}`}>{etatInfo?.label}</span>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("recap_vehicle")}</p>
          <p className="text-white font-semibold">{watch("marque")} {watch("modele")}</p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("recap_contact")}</p>
          <p className="text-white font-semibold">{watch("prenomVendeur")} {watch("nomVendeur")}</p>
          <p className="text-gray-400 text-sm mt-0.5">{watch("emailVendeur")}</p>
          {watch("telVendeur") && <p className="text-gray-400 text-sm">{watch("telVendeur")}</p>}
        </div>

        {previews.some(Boolean) && (
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t("recap_photos")} ({previews.filter(Boolean).length})
            </p>
            <div className="flex gap-2 flex-wrap">
              {previews.filter(Boolean).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src!} alt="" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
              ))}
            </div>
          </div>
        )}

        {watch("description") && (
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t("recap_description")}</p>
            <p className="text-gray-300 text-sm">{watch("description")}</p>
          </div>
        )}

        <div className="bg-exhaust-orange/8 border border-exhaust-orange/25 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-exhaust-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white text-sm">{t("payment_fast")}</p>
            <p className="text-gray-400 text-xs mt-0.5">{t("payment_desc")}</p>
          </div>
        </div>
      </div>

      <input type="hidden" {...register("etatEchappement")} value={(selectedEtat ?? "BON") as "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS"} />

      <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full bg-exhaust-orange hover:bg-exhaust-orange-dark font-black text-base">
        🔥 {t("btn_send")}
      </Button>
    </form>
  );
}

// ─── Aperçu HTML du contrat de cession ──────────────────────────────────────
function ContratPreview({ data, etat }: {
  data: Partial<RachatPublicFormData>;
  etat: string | null;
}) {
  const ETAT_LABELS: Record<string, string> = {
    EXCELLENT: "Excellent", BON: "Bon état", MOYEN: "État moyen", MAUVAIS: "Mauvais état",
  };
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <div className="bg-white rounded-xl text-gray-900 text-[11px] leading-relaxed overflow-hidden shadow-xl">
      {/* En-tête */}
      <div className="bg-[#1C69D4] px-6 py-4 flex items-start justify-between">
        <div>
          <p className="text-white font-black text-lg tracking-widest">POWER EXHAUST</p>
          <p className="text-blue-200 text-[9px] tracking-wider mt-0.5">RACHAT DE LIGNES D'ÉCHAPPEMENT — TOUS MODÈLES</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-base">ATTESTATION DE CESSION</p>
          <p className="text-blue-200 text-[9px] mt-1">Date : {today}</p>
        </div>
      </div>
      {/* Corps */}
      <div className="px-6 py-5 space-y-5">
        {/* Parties */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#1C69D4] border-b border-[#1C69D4] pb-1 mb-3">Parties</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Le Vendeur</p>
              <p className="font-bold">{data.prenomVendeur || "—"} {data.nomVendeur || ""}</p>
              <p className="text-gray-500 text-[9px] mt-0.5">{data.emailVendeur || ""}</p>
              <p className="text-gray-500 text-[9px]">{data.telVendeur || ""}</p>
              <p className="text-gray-500 text-[9px] mt-1">{data.adresseVendeur || ""}</p>
              <p className="text-gray-500 text-[9px]">{data.codePostalVendeur || ""} {data.villeVendeur || ""}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">{"L'Acheteur"}</p>
              <p className="font-bold">POWER EXHAUST</p>
              <p className="text-gray-500 text-[9px] mt-0.5">contact@power-exhaust.com</p>
              <p className="text-gray-500 text-[9px] mt-1">France</p>
            </div>
          </div>
        </div>
        {/* Désignation */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#1C69D4] border-b border-[#1C69D4] pb-1 mb-3">Désignation de la pièce cédée</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Marque du véhicule</p>
              <p className="font-bold">{data.marque || "—"}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Modèle</p>
              <p className="font-bold">{data.modele || "—"}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Marque échappement</p>
              <p className="font-bold">{data.marqueEchappement || "—"}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">État</p>
              <p className="font-bold">{etat ? (ETAT_LABELS[etat] ?? etat) : "—"}</p>
            </div>
          </div>
          {data.modeleEchappement && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mt-3">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Modèle échappement</p>
              <p className="font-bold">{data.modeleEchappement}</p>
            </div>
          )}
          {data.description && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mt-3">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Description complémentaire</p>
              <p className="text-gray-700">{data.description}</p>
            </div>
          )}
        </div>
        {/* Clause légale */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[8.5px] text-amber-800 leading-relaxed">
            Le vendeur déclare être l&apos;unique propriétaire de la pièce décrite ci-dessus, libre de tout gage, nantissement ou opposition, et certifie l&apos;exactitude des informations fournies. La présente attestation vaut contrat de cession entre les parties. Conformément au Code Civil, la propriété est transférée dès la signature des deux parties.
          </p>
        </div>
        {/* Zone signature */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#1C69D4] border-b border-[#1C69D4] pb-1 mb-3">Signatures des parties</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[80px] flex flex-col items-center justify-center">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider text-center mb-2">Signature du vendeur<br/>{data.prenomVendeur || ""} {data.nomVendeur || ""}</p>
              <p className="text-[8px] text-gray-400 italic">À signer ci-dessous</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 min-h-[80px] flex flex-col items-center justify-center bg-gray-50">
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider text-center mb-2">{"Signature de l'acheteur"}<br/>Power Exhaust</p>
              <p className="text-[8px] text-gray-400 italic">Signature à réception</p>
            </div>
          </div>
        </div>
      </div>
      {/* Pied de page */}
      <div className="border-t border-gray-200 px-6 py-2 flex justify-between items-center bg-gray-50">
        <p className="text-[7.5px] font-bold text-[#1C69D4]">POWER EXHAUST</p>
        <p className="text-[7.5px] text-gray-400">Document généré le {today} — power-exhaust.com</p>
      </div>
    </div>
  );
}

// ─── Liste statique de toutes les marques d'échappement (fallback) ───────────
const EXHAUST_BRANDS_FALLBACK: { id: string; name: string }[] = [
  { id: "akrapovic", name: "Akrapovic" },
  { id: "arrow", name: "Arrow" },
  { id: "austin-racing", name: "Austin Racing" },
  { id: "dominator", name: "Dominator" },
  { id: "fmf", name: "FMF Racing" },
  { id: "gpr", name: "GPR" },
  { id: "hgs", name: "HGS" },
  { id: "leovince", name: "Leovince" },
  { id: "mivv", name: "Mivv" },
  { id: "oem", name: "Ligne d'Origine (OEM)" },
  { id: "remus", name: "Remus" },
  { id: "sc-project", name: "SC-Project" },
  { id: "termignoni", name: "Termignoni" },
  { id: "two-brothers", name: "Two Brothers Racing" },
  { id: "vance-hines", name: "Vance & Hines" },
  { id: "yoshimura", name: "Yoshimura" },
  { id: "autre", name: "Autre" },
];

// ─── Wizard principal ─────────────────────────────────────────────────────────
export function RachatWizard() {
  const t = useTranslations("wizard");

  const ETATS = [
    {
      value: "EXCELLENT" as const,
      label: t("etat_excellent_label"),
      desc: t("etat_excellent_desc"),
      color: "border-emerald-500/40 bg-emerald-500/5",
      activeColor: "border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-500/30",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    },
    {
      value: "BON" as const,
      label: t("etat_bon_label"),
      desc: t("etat_bon_desc"),
      color: "border-blue-400/40 bg-blue-500/5",
      activeColor: "border-blue-400 bg-blue-500/15 ring-2 ring-blue-500/30",
      dot: "bg-blue-400",
      text: "text-blue-400",
    },
    {
      value: "MOYEN" as const,
      label: t("etat_moyen_label"),
      desc: t("etat_moyen_desc"),
      color: "border-amber-400/40 bg-amber-500/5",
      activeColor: "border-amber-400 bg-amber-500/15 ring-2 ring-amber-500/30",
      dot: "bg-amber-400",
      text: "text-amber-400",
    },
  ];

  const PHOTO_ANGLES = [
    { label: t("photo_front"),  icon: ArrowUp },
    { label: t("photo_back"),   icon: ArrowDown },
    { label: t("photo_left"),   icon: ArrowLeft },
    { label: t("photo_right"),  icon: ArrowRight },
    { label: t("photo_detail"), icon: ScanSearch },
  ];

  const STEPS = [
    { n: 1, label: t("step1_label"), icon: Tag },
    { n: 2, label: t("step2_label"), icon: User },
    { n: 3, label: t("step3_label"), icon: Package },
    { n: 4, label: t("step4_label"), icon: PenLine },
    { n: 5, label: t("step5_label"), icon: Banknote },
    { n: 6, label: t("step6_label"), icon: CheckCircle2 },
  ];

  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<ExhaustBrand[]>([]);
  const [exhaustBrandId, setExhaustBrandId] = useState<string>("");
  const [exhaustModels, setExhaustModels] = useState<ExhaustModel[]>([]);
  const [selectedEtat, setSelectedEtat] = useState<string | null>(null);
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [, setRachatId] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [ribFile, setRibFile] = useState<File | null>(null);
  const [ribPreview, setRibPreview] = useState<string | null>(null);
  const [ribDataUrl, setRibDataUrl] = useState<string | null>(null);
  const [ribMime, setRibMime] = useState<string | null>(null);
  const [ribError, setRibError] = useState<string | null>(null);
  const ribInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
    setValue,
  } = useForm<RachatPublicFormData>({
    resolver: zodResolver(rachatPublicSchema),
    defaultValues: {},
  });

  useEffect(() => {
    fetch("/api/catalogue/marques")
      .then((r) => r.json())
      .then((data) => { setBrands(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!exhaustBrandId) { setExhaustModels([]); return; }
    fetch(`/api/catalogue/modeles?marqueId=${exhaustBrandId}`)
      .then((r) => r.json())
      .then((data: ExhaustModel[]) => setExhaustModels(data))
      .catch(() => setExhaustModels([]));
  }, [exhaustBrandId]);

  const handlePhotoFile = (file: File, index: number) => {
    const url = URL.createObjectURL(file);
    setPhotos((prev) => { const n = [...prev]; n[index] = file; return n; });
    setPreviews((prev) => { const n = [...prev]; n[index] = url; return n; });
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => { const n = [...prev]; n[index] = null; return n; });
    setPreviews((prev) => { const n = [...prev]; n[index] = null; return n; });
  };

  const goToStep2 = () => {
    if (!selectedEtat) { setError(t("error_select_state")); return; }
    setError(null);
    setStep(2);
  };

  const goToStep3 = async () => {
    const ok = await trigger(["nomVendeur", "prenomVendeur", "emailVendeur", "marque", "modele", "marqueEchappement"]);
    if (!ok) return;
    setError(null);
    setStep(3);
  };

  const goToStep4 = async () => {
    const ok = await trigger(["adresseVendeur", "villeVendeur", "codePostalVendeur", "poidsKg"]);
    if (!ok) return;
    setError(null);
    setStep(4);
  };

  const goToStep5 = () => {
    if (!signature) { setSignatureError(t("error_sign")); return; }
    setSignatureError(null);
    setError(null);
    setStep(5);
  };

  const handleRibFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { setRibError(t("error_rib_format")); return; }
    if (file.size > 10 * 1024 * 1024) { setRibError(t("error_rib_size")); return; }
    setRibError(null);
    setRibFile(file);
    setRibMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setRibDataUrl(url);
      setRibPreview(file.type.startsWith("image/") ? url : null);
    };
    reader.readAsDataURL(file);
  };

  const goToStep6 = () => {
    if (!ribFile) { setRibError(t("error_add_rib")); return; }
    setRibError(null);
    setError(null);
    setStep(6);
  };

  const onSubmit = async (data: RachatPublicFormData) => {
    if (!signature) { setError(t("error_sign_required")); return; }
    setError(null);
    try {
      const photoBase64s: string[] = [];
      for (const file of photos) {
        if (!file) continue;
        const b64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        photoBase64s.push(b64);
      }

      const payload = {
        ...data,
        exhaustModelId: undefined,
        prixOfficiel: undefined,
        etatEchappement: selectedEtat as "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS",
        photos: photoBase64s.length > 0 ? JSON.stringify(photoBase64s) : undefined,
        telVendeur: data.telVendeur || "",
        adresseVendeur: data.adresseVendeur || "",
        villeVendeur: data.villeVendeur || "",
        codePostalVendeur: data.codePostalVendeur || "",
        signatureVendeur: signature,
      };

      const res = await fetch("/api/rachat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.message ?? t("error_submission")); return; }

      if (ribDataUrl && ribMime && json.id) {
        await fetch(`/api/rib/${json.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: ribDataUrl, mime: ribMime }),
        }).catch((e) => console.error("[RIB_UPLOAD]", e));
      }

      setReferenceId(json.reference);
      setRachatId(json.id ?? null);
      setSubmitted(true);
    } catch {
      setError(t("error_network"));
    }
  };

  // ── Page de confirmation ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">{t("submitted_title")}</h2>
        <p className="text-gray-400 mb-2">
          {t("submitted_ref")}{" "}
          <span className="font-bold text-exhaust-orange font-mono">{referenceId}</span>
        </p>
        <p className="text-gray-500 text-sm mb-8">{t("submitted_keep")}</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-400">{t("pending_title")}</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("pending_desc") }}
          />
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl px-6 py-4 mb-8 text-left">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("disclaimer_text") }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">{t("next_steps_title")}</h3>
          {[
            { n: "1", color: "bg-amber-500",     text: t("next_step_1") },
            { n: "2", color: "bg-exhaust-orange", text: t("next_step_2") },
            { n: "3", color: "bg-green-500",      text: t("next_step_3") },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full ${s.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{s.n}</span>
              <p className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: s.text }} />
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-8">
          {t("question")}{" "}
          <a href="mailto:contact@power-exhaust.com" className="text-exhaust-orange hover:underline">contact@power-exhaust.com</a>
        </p>
      </div>
    );
  }

  // ── Barre de progression ──────────────────────────────────────────────────
  const ProgressBar = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute inset-x-12 top-5 h-0.5 bg-white/10" />
        <div
          className="absolute top-5 h-0.5 bg-exhaust-orange transition-all duration-500"
          style={{ left: "3rem", width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 6rem)` }}
        />
        {STEPS.map((s) => (
          <div key={s.n} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              step > s.n ? "bg-green-500" : step === s.n ? "bg-exhaust-orange shadow-lg shadow-exhaust-orange/30" : "bg-[#1e1e1e] border border-white/15"
            }`}>
              {step > s.n ? <Check className="w-4 h-4 text-white" /> : <s.icon className={`w-4 h-4 ${step === s.n ? "text-white" : "text-gray-500"}`} />}
            </div>
            <p className={`text-[11px] mt-2 font-semibold hidden sm:block ${step >= s.n ? "text-white" : "text-gray-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressBar />

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {/* ── ÉTAPE 1 — État ── */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-exhaust-orange" />
              <h2 className="text-xl font-black text-white">{t("step1_title")}</h2>
            </div>
            <p className="text-gray-500 text-sm ml-6">{t("step1_desc")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {ETATS.map((etat) => (
              <button
                key={etat.value}
                type="button"
                onClick={() => { setSelectedEtat(etat.value); setError(null); }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedEtat === etat.value ? etat.activeColor : etat.color + " hover:border-white/25"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${etat.dot}`} />
                  <p className={`font-black text-base ${selectedEtat === etat.value ? etat.text : "text-white"}`}>{etat.label}</p>
                  {selectedEtat === etat.value && <Check className={`w-4 h-4 ml-auto ${etat.text}`} />}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{etat.desc}</p>
              </button>
            ))}
          </div>

          <Button type="button" onClick={goToStep2} size="lg" className="w-full bg-exhaust-orange hover:bg-exhaust-orange-dark font-black">
            {t("btn_continue")} <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── ÉTAPE 2 — Informations ── */}
      {step === 2 && (
        <div>
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t("back")}
          </button>

          <div className="flex items-center gap-3 p-4 bg-white/4 border border-white/10 rounded-2xl mb-8">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${ETATS.find(e => e.value === selectedEtat)?.dot ?? "bg-gray-400"}`} />
            <p className={`font-bold text-sm ${ETATS.find(e => e.value === selectedEtat)?.text ?? "text-gray-400"}`}>
              {ETATS.find(e => e.value === selectedEtat)?.label}
            </p>
            <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-gray-500 hover:text-exhaust-orange transition-colors underline underline-offset-2">
              {t("modify")}
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); goToStep3(); }} className="space-y-5">
            {/* Ligne d'échappement */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-exhaust-orange flex-shrink-0">
                  <path d="M3 12h4l2-4h6l2 4h4" />
                  <path d="M17 12c0 2.5 2 3 2 5" />
                  <circle cx="19" cy="18" r="1" />
                  <path d="M3 12c0 0 0-3 3-3h2" />
                </svg>
                <h3 className="font-bold text-white">Ligne d&apos;échappement</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                    Marque <span className="text-exhaust-orange">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all ${errors.marqueEchappement ? "border-red-500" : "border-white/15"}`}
                    value={watch("marqueEchappement") ?? ""}
                    onChange={(e) => {
                      const selected = brands.find((b) => b.name === e.target.value);
                      setExhaustBrandId(selected?.id ?? "");
                      setValue("marqueEchappement", e.target.value, { shouldValidate: true });
                      setValue("modeleEchappement", "");
                    }}
                  >
                    <option value="">Choisir une marque</option>
                    {(brands.length > 0 ? brands : EXHAUST_BRANDS_FALLBACK).map((b) => (
                      <option key={b.id ?? b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  {errors.marqueEchappement && (
                    <p className="text-red-400 text-xs mt-1">{errors.marqueEchappement.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Modèle</label>
                  {exhaustModels.length > 0 ? (
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all"
                      value={watch("modeleEchappement") ?? ""}
                      onChange={(e) => setValue("modeleEchappement", e.target.value)}
                    >
                      <option value="">Choisir un modèle</option>
                      {exhaustModels.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="ex: S-Y10SO22"
                      className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/6 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all"
                      {...register("modeleEchappement")}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Véhicule */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-exhaust-orange text-base leading-none">🏍</span>
                <h3 className="font-bold text-white">{t("vehicle_section")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                    {t("brand_label")} <span className="text-exhaust-orange">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all"
                    {...register("marque")}
                  >
                    <option value="">{t("choose")}</option>
                    {MOTO_MARQUES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.marque && <p className="text-red-400 text-xs mt-1">{errors.marque.message}</p>}
                </div>
                {(() => {
                  const marqueVal = watch("marque");
                  const models = marqueVal ? (MOTO_MODELS[marqueVal] ?? []) : [];
                  return models.length > 0 ? (
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                        {t("model_label")} <span className="text-exhaust-orange">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-exhaust-orange transition-all"
                        {...register("modele")}
                      >
                        <option value="">{t("choose_model")}</option>
                        {models.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      {errors.modele && <p className="text-red-400 text-xs mt-1">{errors.modele.message}</p>}
                    </div>
                  ) : (
                    <Input label={t("model_label")} placeholder={t("model_placeholder")} error={errors.modele?.message} required {...register("modele")} />
                  );
                })()}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-exhaust-orange" />
                <h3 className="font-bold text-white">{t("info_section")}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t("first_name")} placeholder="Jean" error={errors.prenomVendeur?.message} required {...register("prenomVendeur")} />
                  <Input label={t("last_name")} placeholder="Dupont" error={errors.nomVendeur?.message} required {...register("nomVendeur")} />
                </div>
                <Input label={t("email")} type="email" placeholder="jean@exemple.fr" error={errors.emailVendeur?.message} required {...register("emailVendeur")} />
                <Input label={t("phone")} type="tel" placeholder="06 12 34 56 78" error={errors.telVendeur?.message} {...register("telVendeur")} />
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-exhaust-orange" />
                <h3 className="font-bold text-white">{t("photos_section")}</h3>
                <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{t("photos_max")}</span>
              </div>
              <p className="text-xs text-gray-500 mb-5">{t("photos_hint")}</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {PHOTO_ANGLES.map((angle, i) => (
                  <PhotoSlot key={i} index={i} preview={previews[i]} angle={angle} onFile={handlePhotoFile} onRemove={handlePhotoRemove} />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-exhaust-orange" />
                <h3 className="font-bold text-white">{t("details_section")}</h3>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">{t("description_label")}</label>
                <textarea
                  placeholder={t("description_placeholder")}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/6 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-exhaust-orange resize-none transition-all"
                  {...register("description")}
                />
              </div>
            </div>

            <input type="hidden" {...register("etatEchappement")} value={(selectedEtat ?? "BON") as "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS"} />

            <Button type="submit" size="lg" className="w-full bg-exhaust-orange hover:bg-exhaust-orange-dark font-black">
              {t("btn_verify")} <ChevronRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}

      {/* ── ÉTAPE 3 — Colis ── */}
      {step === 3 && (
        <StepColis
          register={register}
          errors={errors}
          watch={watch}
          onBack={() => setStep(2)}
          onContinue={goToStep4}
        />
      )}

      {/* ── ÉTAPE 4 — Signature ── */}
      {step === 4 && (
        <div>
          <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t("back")}
          </button>

          <div className="flex items-center gap-2 mb-1">
            <PenLine className="w-4 h-4 text-exhaust-orange" />
            <h2 className="text-xl font-black text-white">{t("signature_title")}</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6 ml-6">{t("signature_desc")}</p>

          {/* Aperçu du document */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowDoc((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-white/15 bg-white/4 hover:bg-white/7 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-exhaust-orange" />
                <span className="text-sm font-semibold text-white">Lire le document à signer</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDoc ? "rotate-180" : ""}`} />
            </button>
            {showDoc && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                <ContratPreview data={watch()} etat={selectedEtat} />
              </div>
            )}
          </div>

          <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 text-sm mb-1">{t("warning_title")}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{t("warning_desc")}</p>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t("warning_cancel") }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-6">
            <SignaturePad
              label={t("signature_pad_label")}
              onSave={(dataUrl) => { setSignature(dataUrl); setSignatureError(null); }}
            />
            {signatureError && (
              <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {signatureError}
              </p>
            )}
          </div>

          <div className="bg-white/3 border border-white/10 rounded-2xl p-5 mb-6 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              {t("legal_clause_title")}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">{t("legal_clause_1")}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{t("legal_clause_2")}</p>
            <p className="text-xs text-gray-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("legal_clause_3") }}
            />
          </div>

          <Button
            type="button"
            onClick={goToStep5}
            size="lg"
            className="w-full bg-exhaust-orange hover:bg-exhaust-orange-dark font-black"
          >
            {t("btn_confirm_signature")} <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── ÉTAPE 5 — RIB ── */}
      {step === 5 && (
        <div>
          <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t("back")}
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-exhaust-orange" />
            <h2 className="text-xl font-black text-white">{t("rib_title")}</h2>
          </div>
          <p className="text-gray-500 text-sm mb-8 ml-6">{t("rib_desc")}</p>

          <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-300 text-sm mb-1">{t("rib_security_title")}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{t("rib_security_desc")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {t("rib_upload_label")} <span className="text-exhaust-orange">*</span>
            </p>

            {ribFile ? (
              <div className="relative border border-green-500/30 bg-green-500/5 rounded-xl overflow-hidden">
                {ribPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ribPreview} alt="RIB" className="w-full max-h-56 object-contain bg-black/30" />
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-3xl">📄</span>
                    <div>
                      <p className="text-white text-sm font-medium">{ribFile.name}</p>
                      <p className="text-gray-500 text-xs">{(ribFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                    </div>
                  </div>
                )}
                <div className="p-3 flex items-center justify-between">
                  <span className="text-green-400 text-xs font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> {t("rib_added")}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setRibFile(null); setRibPreview(null); setRibDataUrl(null); setRibMime(null); if (ribInputRef.current) ribInputRef.current.value = ""; }}
                    className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                  >
                    {t("rib_delete")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => ribInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 hover:border-exhaust-orange/60 hover:bg-exhaust-orange/5 rounded-xl p-8 text-center transition-all group"
              >
                <Banknote className="w-8 h-8 text-gray-600 group-hover:text-exhaust-orange mx-auto mb-3 transition-colors" />
                <p className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">{t("rib_click")}</p>
                <p className="text-gray-600 text-xs mt-1">{t("rib_formats")}</p>
              </button>
            )}
            <input
              ref={ribInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRibFile(f); }}
            />
          </div>

          {ribError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              ⚠️ {ribError}
            </div>
          )}

          <div className="bg-white/3 border border-white/10 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("rib_hint") }}
            />
          </div>

          <Button
            type="button"
            onClick={goToStep6}
            size="lg"
            className="w-full bg-exhaust-orange hover:bg-exhaust-orange-dark font-black"
          >
            {t("btn_continue")} <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── ÉTAPE 6 — Récapitulatif ── */}
      {step === 6 && (
        <Step3
          selectedEtat={selectedEtat}
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          watch={watch}
          isSubmitting={isSubmitting}
          setStep={setStep}
          previews={previews}
          ETATS={ETATS}
        />
      )}
    </div>
  );
}
