"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

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
    router.push(pathname, { locale: code });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="font-display font-bold uppercase text-xs leading-none">{current.code.toUpperCase()}</span>
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
              <span className="font-display font-bold uppercase text-xs w-6">{l.code}</span>
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
