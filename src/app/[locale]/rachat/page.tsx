import Link from "next/link";
import { RachatWizard } from "@/components/forms/RachatWizard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rachat" });
  return {
    title: t("title") + " — Power Exhaust",
    description: t("desc"),
  };
}

export default async function RachatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rachat" });

  return (
    <div className="min-h-screen bg-exhaust-dark">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={locale === "fr" ? "/" : `/${locale}`} className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight leading-none">
              <span className="text-white">POWER-</span><span className="text-exhaust-orange">EXHAUST</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/suivi"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Suivre mon dossier
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div className="bg-exhaust-dark py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 bg-exhaust-orange/10 border border-exhaust-orange/30 rounded-full px-4 py-1.5 text-exhaust-orange text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-exhaust-orange animate-pulse" />
              {t("badge")}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-gray-400 max-w-2xl">{t("desc")}</p>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-6 mt-6">
            {[
              { icon: "💶", text: t("trust_offer") },
              { icon: "⚡", text: t("trust_payment") },
              { icon: "📄", text: t("trust_cert") },
              { icon: "🔒", text: t("trust_secure") },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WIZARD ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 bg-exhaust-dark">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main wizard */}
          <div className="lg:col-span-2">
            <RachatWizard />
          </div>

          {/* Sidebar info */}
          <div className="hidden lg:block space-y-5">
            <div className="bg-exhaust-gray rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> {t("sidebar_title")}
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: "💶", title: t("sb1_title"), desc: t("sb1_desc") },
                  { icon: "⏱️", title: t("sb2_title"), desc: t("sb2_desc") },
                  { icon: "📄", title: t("sb3_title"), desc: t("sb3_desc") },
                  { icon: "🏆", title: t("sb4_title"), desc: t("sb4_desc") },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-exhaust-orange rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span>💬</span> {t("question_title")}
              </h3>
              <p className="text-white/80 text-sm mb-4">{t("question_desc")}</p>
              <a
                href="mailto:contact@power-exhaust.com"
                className="block text-center bg-white text-exhaust-orange font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors"
              >
                📧 contact@power-exhaust.com
              </a>
            </div>

            <div className="bg-exhaust-gray border border-green-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm font-bold text-green-400">{t("service_active")}</p>
              </div>
              <p className="text-xs text-green-400/80">{t("service_delay")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
