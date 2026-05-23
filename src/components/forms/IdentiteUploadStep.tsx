"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, AlertTriangle, FileText } from "lucide-react";
import { Button, Alert } from "@/components/ui";

type TypePiece = "CARTE_IDENTITE" | "PASSEPORT";

const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  CARTE_IDENTITE: "Carte nationale d'identité",
  PASSEPORT: "Passeport européen",
};

const TYPES_AVEC_VERSO: TypePiece[] = ["CARTE_IDENTITE"];

interface FilePreview {
  file: File;
  preview: string;
  name: string;
}

interface Props {
  onBack: () => void;
  onContinue: () => void;
  t: (key: string) => string;
}

export function IdentiteUploadStep({ onBack, onContinue, t }: Props) {
  const [typePiece, setTypePiece] = useState<TypePiece>("CARTE_IDENTITE");
  const [recto, setRecto] = useState<FilePreview | null>(null);
  const [verso, setVerso] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentement, setConsentement] = useState(false);

  const rectoRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);

  const versoRequis = TYPES_AVEC_VERSO.includes(typePiece);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, side: "recto" | "verso") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Format non autorisé. Utilisez JPG, PNG, WEBP ou PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 10 Mo).");
      return;
    }

    setError(null);
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    const fp: FilePreview = { file, preview, name: file.name };
    if (side === "recto") setRecto(fp);
    else setVerso(fp);
  };

  const isComplete = recto && (versoRequis ? verso : true) && consentement;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-7 text-sm font-medium transition-colors"
      >
        <X className="w-4 h-4" /> {t("back")}
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Pièce d'identité</h2>
        <p className="text-gray-400 text-sm">
          Veuillez fournir une copie numérique de votre pièce d'identité. Cette étape est obligatoire pour finaliser votre demande.
        </p>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      <div className="space-y-6 mb-8">
        {/* Type de pièce */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <label className="text-sm font-semibold text-white block mb-4">
            Type de pièce d'identité <span className="text-exhaust-orange">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["CARTE_IDENTITE", "PASSEPORT"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypePiece(type)}
                className={`p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                  typePiece === type
                    ? "border-exhaust-orange bg-exhaust-orange/10 text-white"
                    : "border-white/15 bg-white/3 text-gray-400 hover:border-exhaust-orange/50"
                }`}
              >
                {TYPE_PIECE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Recto */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <label className="text-sm font-semibold text-white block mb-4">
            Recto (face avant) <span className="text-exhaust-orange">*</span>
          </label>
          {recto ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-white/20">
                {recto.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recto.preview} alt="Recto" className="w-full h-auto object-cover max-h-48" />
                ) : (
                  <div className="bg-white/5 h-32 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setRecto(null)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500">{recto.name}</p>
              <button
                type="button"
                onClick={() => rectoRef.current?.click()}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-exhaust-orange transition-colors"
              >
                Changer le fichier
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => rectoRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center hover:border-exhaust-orange/60 hover:bg-exhaust-orange/5 transition-all group"
            >
              <Upload className="w-8 h-8 text-gray-500 group-hover:text-exhaust-orange mb-2" />
              <p className="text-sm font-medium text-gray-300 group-hover:text-white">Cliquez pour télécharger</p>
              <p className="text-xs text-gray-600 group-hover:text-gray-500 mt-1">JPG, PNG, WEBP ou PDF (max 10 Mo)</p>
            </button>
          )}
          <input
            ref={rectoRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e, "recto")}
          />
        </div>

        {/* Upload Verso (si nécessaire) */}
        {versoRequis && (
          <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
            <label className="text-sm font-semibold text-white block mb-4">
              Verso (face arrière) <span className="text-exhaust-orange">*</span>
            </label>
            {verso ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-white/20">
                  {verso.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={verso.preview} alt="Verso" className="w-full h-auto object-cover max-h-48" />
                  ) : (
                    <div className="bg-white/5 h-32 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setVerso(null)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">{verso.name}</p>
                <button
                  type="button"
                  onClick={() => versoRef.current?.click()}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-exhaust-orange transition-colors"
                >
                  Changer le fichier
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => versoRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center hover:border-exhaust-orange/60 hover:bg-exhaust-orange/5 transition-all group"
              >
                <Upload className="w-8 h-8 text-gray-500 group-hover:text-exhaust-orange mb-2" />
                <p className="text-sm font-medium text-gray-300 group-hover:text-white">Cliquez pour télécharger</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-500 mt-1">JPG, PNG, WEBP ou PDF (max 10 Mo)</p>
              </button>
            )}
            <input
              ref={versoRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e, "verso")}
            />
          </div>
        )}

        {/* Consentement RGPD */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-200 text-sm mb-2">Politique de confidentialité</p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentement}
                  onChange={(e) => setConsentement(e.target.checked)}
                  className="mt-1 accent-exhaust-orange"
                />
                <span className="text-xs text-gray-300">
                  Je confirme avoir lu la politique de confidentialité et j'accepte que Power Exhaust traite ma pièce d'identité conformément à la loi RGPD (R321-3 du Code du Sport). Mes données seront conservées de manière sécurisée et supprimées après la finalisation de la transaction.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={!isComplete}
          size="lg"
          className="flex-1 bg-exhaust-orange hover:bg-exhaust-orange-dark disabled:opacity-50 disabled:cursor-not-allowed font-black"
        >
          <Check className="w-5 h-5" />
          Continuer
        </Button>
      </div>
    </div>
  );
}
