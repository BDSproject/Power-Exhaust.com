import Link from "next/link";
import { RachatWizard } from "@/components/forms/RachatWizard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PowerExhaustLogo } from "@/components/ui/Logo";
import { getTranslations } from "next-intl/server";
import {
  Banknote, Zap, FileText, Shield, Trophy, Clock, Mail, MessageCircle
} from "lucide-react";

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
    <div className="min-h-screen bg-exhaust-dark text-white">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-exhaust-dark/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <PowerExhaustLogo size="sm" href={locale === "fr" ? "/" : `/${locale}`} />
          <div className="flex items-center gap-4">
            <Link
              href="/suivi"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Suivre mon dossier
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div className="bg-exhaust-dark border-b border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-exhaust-orange" />
            <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
              {t("badge")}
            </span>
          </div>
          <h1 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-400 max-w-2xl">{t("desc")}</p>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
            {[
              { icon: <Banknote className="w-4 h-4" />, text: t("trust_offer") },
              { icon: <Zap className="w-4 h-4" />, text: t("trust_payment") },
              { icon: <FileText className="w-4 h-4" />, text: t("trust_cert") },
              { icon: <Shield className="w-4 h-4" />, text: t("trust_secure") },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-exhaust-orange">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WIZARD ── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main wizard */}
          <div className="lg:col-span-2">
            <RachatWizard />
          </div>

          {/* Sidebar info */}
          <div className="hidden lg:block space-y-5">
            <div className="bg-[#111] border border-white/10 p-6">
              <h3 className="font-display font-bold uppercase tracking-wide text-lg text-white mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-exhaust-orange" /> {t("sidebar_title")}
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: <Banknote className="w-4 h-4" />, title: t("sb1_title"), desc: t("sb1_desc") },
                  { icon: <Clock className="w-4 h-4" />, title: t("sb2_title"), desc: t("sb2_desc") },
                  { icon: <FileText className="w-4 h-4" />, title: t("sb3_title"), desc: t("sb3_desc") },
                  { icon: <Trophy className="w-4 h-4" />, title: t("sb4_title"), desc: t("sb4_desc") },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="text-exhaust-orange flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-exhaust-orange p-6 text-white">
              <h3 className="font-display font-bold uppercase tracking-wide text-lg mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> {t("question_title")}
              </h3>
              <p className="text-white/80 text-sm mb-4">{t("question_desc")}</p>
              <a
                href="mailto:contact@power-exhaust.com"
                className="flex items-center justify-center gap-2 text-center bg-white text-exhaust-orange font-bold px-4 py-2.5 rounded text-sm hover:bg-red-50 transition-colors"
              >
                <Mail className="w-4 h-4" /> contact@power-exhaust.com
              </a>
            </div>

            <div className="bg-[#111] border border-green-500/30 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
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
