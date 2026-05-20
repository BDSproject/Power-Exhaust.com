"use client";

/**
 * LanguageSwitcherSimple
 * Fonctionne sans contexte next-intl (pages hors [locale] : /suivi, /login, dashboard)
 * Lit/écrit le cookie NEXT_LOCALE et redirige vers la page d'accueil dans la langue choisie.
 */

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

function getStoredLocale(): string {
  if (typeof document === "undefined") return "fr";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "fr";
}

export default function LanguageSwitcherSimple() {
  const [locale, setLocale] = useState("fr");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLocale = (code: string) => {
    setOpen(false);
    // Stocker le cookie (365 jours)
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setLocale(code);
    // Recharger la page pour que le middleware next-intl applique la nouvelle locale
    window.location.reload();
  };

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden py-1"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: "160px",
          }}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-white/5 ${
                l.code === locale ? "text-white font-semibold" : "text-gray-400"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-exhaust-orange" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
