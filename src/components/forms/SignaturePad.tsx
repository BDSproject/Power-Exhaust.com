"use client";

import { useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  existingSignature?: string | null;
  className?: string;
}

export function SignaturePad({
  label,
  onSave,
  existingSignature,
  className,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [saved, setSaved] = useState(!!existingSignature);
  const [isEmpty, setIsEmpty] = useState(true);
  const [preview, setPreview] = useState<string | null>(existingSignature ?? null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setIsEmpty(false);
    }
  }, []);

  const handleClear = () => {
    sigRef.current?.clear();
    setIsEmpty(true);
    setSaved(false);
    setPreview(null);
  };

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL("image/png");
      setPreview(dataUrl);
      setSaved(true);
      onSave(dataUrl);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {saved && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            ✓ Signature enregistrée
          </span>
        )}
      </div>

      {saved && preview ? (
        // Affichage de la signature sauvegardée
        <div className="relative border-2 border-green-200 rounded-xl overflow-hidden bg-gray-50">
          <img
            src={preview}
            alt="Signature"
            className="w-full h-40 object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Modifier la signature
            </Button>
          </div>
        </div>
      ) : (
        // Zone de signature
        <div className="space-y-2">
          <div
            className={cn(
              "border-2 rounded-xl overflow-hidden cursor-crosshair",
            "border-dashed border-white/20 hover:border-exhaust-orange/60 transition-colors",
              "bg-[#1a1a1a]"
            )}
          >
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{
                className: "w-full",
                style: { height: "160px", display: "block" },
              }}
              backgroundColor="rgba(255,255,255,0)"
              penColor="#ffffff"
              onEnd={handleEnd}
            />
          </div>

          {isEmpty && (
            <p className="text-center text-xs text-gray-400 -mt-1">
              ✏️ Signez ici avec votre souris ou doigt (sur mobile)
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-1"
              disabled={isEmpty}
            >
              Effacer
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="flex-1"
              disabled={isEmpty}
            >
              ✓ Valider la signature
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
