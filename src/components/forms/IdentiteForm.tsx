"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type TypePiece = "CARTE_IDENTITE" | "PASSEPORT" | "TITRE_SEJOUR" | "PERMIS_CONDUIRE";

const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  CARTE_IDENTITE: "Carte nationale d'identité",
  PASSEPORT: "Passeport",
  TITRE_SEJOUR: "Titre de séjour",
  PERMIS_CONDUIRE: "Permis de conduire",
};

// Types avec recto + verso obligatoire
const TYPES_AVEC_VERSO: TypePiece[] = ["CARTE_IDENTITE", "TITRE_SEJOUR", "PERMIS_CONDUIRE"];

interface Props {
  rachatId: string;
  token: string;
}

interface FilePreview {
  file: File;
  preview: string;
}

export default function IdentiteForm({ rachatId, token }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [typePiece, setTypePiece] = useState<TypePiece>("CARTE_IDENTITE");
  const [numeroPiece, setNumeroPiece] = useState("");
  const [dateDelivrance, setDateDelivrance] = useState("");
  const [lieuDelivrance, setLieuDelivrance] = useState("");
  const [consentementTraitement, setConsentementTraitement] = useState(false);
  const [consentementConservation, setConsentementConservation] = useState(false);

  // Files
  const [recto, setRecto] = useState<FilePreview | null>(null);
  const [verso, setVerso] = useState<FilePreview | null>(null);
  const rectoRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);

  const versoRequis = TYPES_AVEC_VERSO.includes(typePiece);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, side: "recto" | "verso") => {
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
      const fp: FilePreview = { file, preview };
      if (side === "recto") setRecto(fp);
      else setVerso(fp);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recto) {
      setError("Le fichier recto est obligatoire.");
      return;
    }
    if (versoRequis && !verso) {
      setError(`Le verso est obligatoire pour une ${TYPE_PIECE_LABELS[typePiece].toLowerCase()}.`);
      return;
    }
    if (!consentementTraitement || !consentementConservation) {
      setError("Vous devez accepter les deux conditions RGPD.");
      return;
    }

    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("nom", nom.trim());
    fd.append("prenom", prenom.trim());
    fd.append("dateNaissance", dateNaissance);
    fd.append("adresse", adresse.trim());
    fd.append("typePiece", typePiece);
    fd.append("numeroPiece", numeroPiece.trim());
    fd.append("dateDelivrance", dateDelivrance);
    fd.append("lieuDelivrance", lieuDelivrance.trim());
    fd.append("consentementTraitement", String(consentementTraitement));
    fd.append("consentementConservation", String(consentementConservation));
    fd.append("recto", recto.file);
    if (verso) fd.append("verso", verso.file);

    try {
      const res = await fetch(`/api/identite/${rachatId}?token=${token}`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json() as { message?: string };
        throw new Error(data.message ?? "Erreur lors de l'envoi");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">Pièce d'identité envoyée</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Votre document a été reçu et chiffré de manière sécurisée.
            Il sera automatiquement supprimé après <strong className="text-white">30 jours</strong> conformément au RGPD.
          </p>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8 text-left">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
              Article R321-3 CSI
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Ces informations sont conservées conformément aux obligations légales
              applicables aux professionnels du rachat de biens d'occasion.
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            Notre équipe traitera votre dossier dans les plus brefs délais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            🪪 Vérification d'identité
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Envoyez votre pièce d'identité</h1>
          <p className="text-gray-400 text-sm">
            Obligatoire conformément à l'article R321-3 du Code de la Sécurité Intérieure
          </p>
        </div>

        {/* Notice RGPD */}
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-5 mb-8">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            🔒 Sécurité & RGPD
          </p>
          <ul className="text-gray-400 text-sm space-y-1.5 leading-relaxed">
            <li>• Vos fichiers sont <strong className="text-white">chiffrés AES-256</strong> avant stockage</li>
            <li>• Suppression automatique après <strong className="text-white">30 jours</strong></li>
            <li>• Accès restreint à notre équipe de validation uniquement</li>
            <li>• Droits RGPD : accès, rectification, suppression sur demande à{" "}
              <a href="mailto:contact@power-exhaust.com" className="text-orange-400 underline">
                contact@power-exhaust.com
              </a>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Type de pièce */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">Type de document</h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(TYPE_PIECE_LABELS) as TypePiece[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTypePiece(t); setVerso(null); }}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    typePiece === t
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {TYPE_PIECE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-bold">Informations personnelles</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nom <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                  placeholder="Nom de famille"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Prénom <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                  placeholder="Prénom"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Date de naissance <span className="text-orange-500">*</span>
              </label>
              <input
                required
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0]}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Adresse complète <span className="text-orange-500">*</span>
              </label>
              <input
                required
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                placeholder="N° rue, ville, code postal"
              />
            </div>
          </div>

          {/* Informations du document */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-bold">Informations du document</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Numéro du document <span className="text-orange-500">*</span>
              </label>
              <input
                required
                value={numeroPiece}
                onChange={(e) => setNumeroPiece(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm font-mono uppercase"
                placeholder="Numéro figurant sur le document"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Date de délivrance <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={dateDelivrance}
                  onChange={(e) => setDateDelivrance(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Lieu de délivrance <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  value={lieuDelivrance}
                  onChange={(e) => setLieuDelivrance(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                  placeholder="Ville ou préfecture"
                />
              </div>
            </div>
          </div>

          {/* Upload des fichiers */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-bold">
              Photos du document
              <span className="text-gray-500 text-xs font-normal ml-2">JPG, PNG ou PDF · Max 10 Mo</span>
            </h2>

            {/* Recto */}
            <FileUploadSlot
              label={`${TYPE_PIECE_LABELS[typePiece]} — Recto`}
              required
              preview={recto}
              onSelect={() => rectoRef.current?.click()}
              onRemove={() => { setRecto(null); if (rectoRef.current) rectoRef.current.value = ""; }}
            />
            <input
              ref={rectoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e, "recto")}
            />

            {/* Verso (conditionnel) */}
            {versoRequis && (
              <>
                <FileUploadSlot
                  label={`${TYPE_PIECE_LABELS[typePiece]} — Verso`}
                  required
                  preview={verso}
                  onSelect={() => versoRef.current?.click()}
                  onRemove={() => { setVerso(null); if (versoRef.current) versoRef.current.value = ""; }}
                />
                <input
                  ref={versoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e, "verso")}
                />
              </>
            )}

            {!versoRequis && (
              <p className="text-gray-600 text-xs">
                Le passeport ne nécessite qu'une seule photo (page avec votre photo).
              </p>
            )}
          </div>

          {/* Consentements RGPD */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-bold">Consentements requis</h2>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentementTraitement}
                onChange={(e) => setConsentementTraitement(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
              />
              <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                <strong className="text-white">J'autorise le traitement de mes données personnelles</strong>{" "}
                par Power Exhaust aux fins de vérification d'identité, conformément à l'article R321-3 CSI
                et au RGPD (base légale : obligation légale).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentementConservation}
                onChange={(e) => setConsentementConservation(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
              />
              <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                <strong className="text-white">J'accepte la conservation pendant 30 jours</strong>{" "}
                des fichiers fournis, après quoi ils seront automatiquement et définitivement supprimés.
                Les données légales (nom, type et numéro de pièce) seront conservées plus longtemps
                conformément aux obligations légales.
              </span>
            </label>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-base"
          >
            {isSubmitting ? "Envoi en cours…" : "Envoyer ma pièce d'identité →"}
          </button>

          <p className="text-center text-gray-600 text-xs">
            Vos fichiers sont chiffrés AES-256 avant tout stockage · HTTPS
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Composant slot d'upload ─────────────────────────────────────────────────

function FileUploadSlot({
  label,
  required,
  preview,
  onSelect,
  onRemove,
}: {
  label: string;
  required?: boolean;
  preview: { file: File; preview: string } | null;
  onSelect: () => void;
  onRemove: () => void;
}) {
  if (preview) {
    return (
      <div className="relative border border-green-500/30 bg-green-500/5 rounded-xl overflow-hidden">
        {preview.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.preview}
            alt={label}
            className="w-full max-h-48 object-cover"
          />
        ) : (
          <div className="flex items-center gap-3 p-4">
            <span className="text-3xl">📄</span>
            <div>
              <p className="text-white text-sm font-medium">{preview.file.name}</p>
              <p className="text-gray-500 text-xs">{(preview.file.size / 1024 / 1024).toFixed(2)} Mo</p>
            </div>
          </div>
        )}
        <div className="p-3 flex items-center justify-between">
          <span className="text-green-400 text-xs font-semibold">✓ {label}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-400 text-xs transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full border-2 border-dashed border-white/15 hover:border-orange-500/50 rounded-xl p-6 text-center transition-all group"
    >
      <div className="text-3xl mb-2 opacity-50 group-hover:opacity-75 transition-opacity">📷</div>
      <p className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </p>
      <p className="text-gray-600 text-xs mt-1">Cliquez pour choisir un fichier</p>
    </button>
  );
}
