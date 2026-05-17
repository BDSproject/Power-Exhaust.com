"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CookieBanner() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("pe-cookie-consent");
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function save(choice: "all" | "essential") {
    localStorage.setItem("pe-cookie-consent", choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 md:p-5"
      role="dialog"
      aria-label="Gestion des cookies"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #111111 0%, #0e0e0e 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(227,6,19,0.15)",
          }}
        >
          {/* Ligne rouge decorative */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, #E30613 20%, #ff4d4d 50%, #E30613 80%, transparent)",
            }}
          />
          {/* Lueur coin */}
          <div
            className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle at top right, #E30613, transparent 70%)" }}
          />

          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">

              {/* Gauche */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-black text-[10px] tracking-tight leading-none"
                      style={{ background: "rgba(227,6,19,0.15)", border: "1px solid rgba(227,6,19,0.3)" }}
                    >
                      <span style={{ color: "#E30613" }}>PE</span>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm tracking-tight">
                        Power<span style={{ color: "#E30613" }}>-Exhaust</span>
                        {" · Cookies"}
                      </p>
                      <p className="text-gray-500 text-[11px]">{t("subtitle")}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">{t("desc")}</p>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-[11px] font-semibold mt-3 transition-colors"
                  style={{ color: "#E30613" }}
                >
                  {showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {showDetails ? t("hide_detail") : t("preferences")}
                </button>

                {showDetails && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {/* Essentiels */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-xs font-bold">🔒 {t("essential_title")}</p>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                        >
                          {t("always_active")}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{t("essential_desc")}</p>
                    </div>

                    {/* Analytiques */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-xs font-bold">📊 {t("analytics_title")}</p>
                        <button
                          onClick={() => setAnalytics(!analytics)}
                          className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                          style={{ background: analytics ? "#E30613" : "rgba(255,255,255,0.1)" }}
                          aria-checked={analytics}
                          role="switch"
                          aria-label="Activer les cookies analytiques"
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                            style={{ transform: analytics ? "translateX(16px)" : "translateX(0)" }}
                          />
                        </button>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{t("analytics_desc")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Droite — boutons */}
              <div className="flex flex-row md:flex-col gap-2 md:w-44 flex-shrink-0 md:pt-1">
                <button
                  onClick={() => save("all")}
                  className="flex-1 md:flex-none text-white text-xs font-black px-4 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #E30613, #b8000f)" }}
                >
                  {t("accept_all")}
                </button>

                {showDetails ? (
                  <button
                    onClick={() => save(analytics ? "all" : "essential")}
                    className="flex-1 md:flex-none text-white text-xs font-bold px-4 py-3 rounded-xl transition-all hover:opacity-80"
                    style={{
                      background: "rgba(227,6,19,0.15)",
                      border: "1px solid rgba(227,6,19,0.3)",
                    }}
                  >
                    {t("save")}
                  </button>
                ) : (
                  <button
                    onClick={() => save("essential")}
                    className="flex-1 md:flex-none text-gray-300 hover:text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    {t("essential_only")}
                  </button>
                )}

                <p className="text-[10px] text-gray-600 text-center hidden md:block mt-1 leading-relaxed">
                  Conforme RGPD
                  <br />
                  UE 2016/679
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
