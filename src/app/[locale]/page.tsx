import Link from "next/link";
import WhyUsInteractive from "@/components/home/WhyUsInteractive";
import ScrollReveal from "@/components/ScrollReveal";
import TrackingWidget from "@/components/home/TrackingWidget";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { PowerExhaustLogo } from "@/components/ui/Logo";
import { getTranslations } from "next-intl/server";
import {
  Tag, Search, CheckCircle2, Banknote, Package, Zap,
  ClipboardList, Trophy, Mail, Phone, Clock, Wrench,
  ArrowRight, Shield, FileText, Flame, Layers, Lock, ShieldCheck, Eye, Trash2, Scale
} from "lucide-react";

const BRANDS_PREVIEW = [
  { name: "Akrapovic", emoji: "🇸🇮", origine: "Slovénie", highlight: true },
  { name: "Yoshimura", emoji: "🇯🇵", origine: "Japon", highlight: true },
  { name: "Arrow", emoji: "🇮🇹", origine: "Italie", highlight: false },
  { name: "Leovince", emoji: "🇮🇹", origine: "Italie", highlight: false },
  { name: "Termignoni", emoji: "🇮🇹", origine: "Italie", highlight: true },
  { name: "SC-Project", emoji: "🇮🇹", origine: "Italie", highlight: false },
  { name: "Mivv", emoji: "🇮🇹", origine: "Italie", highlight: false },
  { name: "Austin Racing", emoji: "🇬🇧", origine: "Royaume-Uni", highlight: false },
  { name: "Remus", emoji: "🇦🇹", origine: "Autriche", highlight: false },
  { name: "GPR", emoji: "🇮🇹", origine: "Italie", highlight: false },
  { name: "FMF Racing", emoji: "🇺🇸", origine: "États-Unis", highlight: false },
  { name: "Vance & Hines", emoji: "🇺🇸", origine: "États-Unis", highlight: false },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title: "Power Exhaust — " + t("title1") + " " + t("title2"),
    description: t("desc"),
  };
}

export default function HomePage() {
  const t = useTranslations();

  const STEPS = [
    {
      n: "01",
      icon: <Tag className="w-7 h-7 text-white" />,
      title: t("steps.s1_title"),
      desc: t("steps.s1_desc"),
      color: "from-red-600 to-red-800",
    },
    {
      n: "02",
      icon: <Search className="w-7 h-7 text-white" />,
      title: t("steps.s2_title"),
      desc: t("steps.s2_desc"),
      color: "from-red-500 to-red-700",
    },
    {
      n: "03",
      icon: <CheckCircle2 className="w-7 h-7 text-white" />,
      title: t("steps.s3_title"),
      desc: t("steps.s3_desc"),
      color: "from-gray-600 to-gray-800",
    },
    {
      n: "04",
      icon: <Banknote className="w-7 h-7 text-white" />,
      title: t("steps.s4_title"),
      desc: t("steps.s4_desc"),
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-exhaust-dark">
      <ScrollReveal />

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <PowerExhaustLogo size="sm" href="/" />

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#comment-ca-marche" className="hover:text-white transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="#marques" className="hover:text-white transition-colors">
              {t("nav.brands")}
            </a>
            <a href="#pourquoi-nous" className="hover:text-white transition-colors">
              {t("nav.whyUs")}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/suivi"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              {t("nav.trackFile")}
            </Link>
            <Link
              href="/rachat"
              className="bg-exhaust-orange hover:bg-exhaust-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              {t("nav.sell")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-exhaust-dark">
        <div className="absolute inset-0">
          <img
            src="/banner-hero.png"
            alt="Power Exhaust banner"
            className="w-full h-full object-contain object-right"
            style={{ opacity: 0.55 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-exhaust-dark via-exhaust-dark/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-exhaust-dark to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-exhaust-orange/10 border border-exhaust-orange/30 rounded-full px-4 py-2 text-exhaust-orange text-xs font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-exhaust-orange animate-pulse" />
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-8 tracking-tight">
              {t("hero.title1")}<br />
              <span className="text-exhaust-orange">{t("hero.title2")}</span>
              <br />
              <span className="text-gray-300">{t("hero.title3")}</span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              {t("hero.desc")}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: <Banknote className="w-3.5 h-3.5" />, text: t("hero.badge_price") },
                { icon: <Zap className="w-3.5 h-3.5" />, text: t("hero.badge_payment") },
                { icon: <FileText className="w-3.5 h-3.5" />, text: t("hero.badge_cert") },
                { icon: <Shield className="w-3.5 h-3.5" />, text: t("hero.badge_secure") },
              ].map((b) => (
                <span
                  key={b.text}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-1.5"
                >
                  {b.icon}{b.text}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/rachat"
                className="bg-exhaust-orange hover:bg-exhaust-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-all text-center text-lg inline-flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" /> {t("hero.cta_estimate")}
              </Link>
              <a
                href="#comment-ca-marche"
                className="border border-white/15 text-gray-300 hover:text-white hover:border-white/30 font-semibold px-8 py-4 rounded-xl transition-all text-center"
              >
                {t("hero.cta_how")}
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { value: "+50", label: t("hero.stat_buybacks"), icon: <Wrench className="w-5 h-5 text-exhaust-orange" /> },
              { value: "48h", label: t("hero.stat_payment"), icon: <Zap className="w-5 h-5 text-exhaust-orange" /> },
              { value: "56+", label: t("hero.stat_models"), icon: <ClipboardList className="w-5 h-5 text-exhaust-orange" /> },
              { value: "16", label: t("hero.stat_brands"), icon: <Layers className="w-5 h-5 text-exhaust-orange" /> },
            ].map((stat) => (
              <div key={stat.label} className="glass-dark rounded-2xl p-5">
                <span className="mb-2 block">{stat.icon}</span>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ca-marche" className="py-24 bg-exhaust-dark reveal-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-exhaust-orange/20 text-exhaust-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {t("steps.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {t("steps.title")}<br />
              <span className="text-exhaust-orange">{t("steps.title_paid")}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.n} className="relative bg-exhaust-gray rounded-2xl p-6 border border-white/10 hover:border-exhaust-orange/40 hover:shadow-lg transition-all group">
                <div className="absolute top-4 right-4 text-6xl font-black text-white/8 select-none group-hover:text-exhaust-orange/20 transition-colors">
                  {step.n}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/rachat"
              className="inline-flex items-center gap-2 bg-exhaust-orange hover:bg-exhaust-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-all text-lg"
            >
              {t("steps.cta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUES ── */}
      <section id="marques" className="py-24 bg-exhaust-dark reveal-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-exhaust-orange/20 text-exhaust-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {t("brands.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              {t("brands.title")}
            </h2>
            <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
              {t("brands.desc")}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { flag: "🇸🇮", pays: "Slovénie", ex: "Akrapovic" },
                { flag: "🇯🇵", pays: "Japon", ex: "Yoshimura" },
                { flag: "🇮🇹", pays: "Italie", ex: "Arrow · Leovince · Termignoni · SC-Project · Mivv · GPR" },
                { flag: "🇬🇧", pays: "Royaume-Uni", ex: "Austin Racing" },
                { flag: "🇦🇹", pays: "Autriche", ex: "Remus · Dominator" },
                { flag: "🇺🇸", pays: "États-Unis", ex: "FMF · Vance & Hines · Two Brothers" },
                { flag: "🇩🇪", pays: "Allemagne", ex: "Ligne d'Origine OEM" },
              ].map(({ flag, pays, ex }) => (
                <div
                  key={pays}
                  className="group relative flex items-center gap-2 bg-exhaust-gray border border-white/10 rounded-xl px-4 py-2.5 shadow-sm hover:border-exhaust-orange/40 hover:shadow-md transition-all cursor-default"
                >
                  <span className="text-2xl">{flag}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">{pays}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-none">{ex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {BRANDS_PREVIEW.map((brand) => (
              <div
                key={brand.name}
                className={`rounded-2xl p-5 text-center border transition-all hover:scale-105 cursor-default ${
                  brand.highlight
                    ? "bg-exhaust-gray border-exhaust-orange/40 shadow-md shadow-black/40"
                    : "bg-exhaust-gray border-white/10"
                }`}
              >
                <div className="text-3xl mb-2">{brand.emoji}</div>
                <p className="font-bold text-white text-sm">{brand.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{brand.origine}</p>
                {brand.highlight && (
                  <span className="inline-block mt-2 text-[10px] font-bold bg-exhaust-orange/20 text-exhaust-orange px-2 py-0.5 rounded-full">
                    TOP
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">{t("brands.more")}</p>
            <Link
              href="/rachat"
              className="inline-flex items-center gap-2 mt-6 text-exhaust-orange font-bold hover:underline"
            >
              {t("brands.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── PAIEMENT 48H ── */}
      <section className="py-16 exhaust-gradient">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                {t("payment.title")}<br />
                <span className="text-exhaust-orange">{t("payment.title_fast")}</span> {t("payment.title_after")}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {t("payment.desc")}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <Package className="w-6 h-6 text-exhaust-orange" />, title: t("payment.step1_title"), desc: t("payment.step1_desc") },
                { icon: <Search className="w-6 h-6 text-exhaust-orange" />, title: t("payment.step2_title"), desc: t("payment.step2_desc") },
                { icon: <Banknote className="w-6 h-6 text-exhaust-orange" />, title: t("payment.step3_title"), desc: t("payment.step3_desc") },
              ].map((item) => (
                <div key={item.title} className="glass-dark rounded-xl p-4 flex items-center gap-4">
                  <span>{item.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS ── */}
      <section id="pourquoi-nous" className="py-24 bg-exhaust-dark reveal-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-0">
            <span className="inline-block bg-exhaust-orange/20 text-exhaust-orange text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {t("whyUs.badge")}
            </span>
            <h2 className="text-4xl font-black text-white">
              {t("whyUs.title")}
            </h2>
          </div>
          <WhyUsInteractive />
        </div>
      </section>

      {/* ── SÉCURITÉ & RGPD ── */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-500/15 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {t("security.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {t("security.title")}<br />
              <span className="text-green-400">{t("security.title_protected")}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {t("security.desc")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Lock className="w-6 h-6" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: t("security.g1_title"), desc: t("security.g1_desc"), badge: t("security.g1_badge") },
              { icon: <Trash2 className="w-6 h-6" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", title: t("security.g2_title"), desc: t("security.g2_desc"), badge: t("security.g2_badge") },
              { icon: <Eye className="w-6 h-6" />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", title: t("security.g3_title"), desc: t("security.g3_desc"), badge: t("security.g3_badge") },
              { icon: <ShieldCheck className="w-6 h-6" />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", title: t("security.g4_title"), desc: t("security.g4_desc"), badge: t("security.g4_badge") },
              { icon: <Scale className="w-6 h-6" />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", title: t("security.g5_title"), desc: t("security.g5_desc"), badge: t("security.g5_badge") },
              { icon: <FileText className="w-6 h-6" />, color: "text-gray-300", bg: "bg-white/5 border-white/10", title: t("security.g6_title"), desc: t("security.g6_desc"), badge: t("security.g6_badge") },
            ].map((item) => (
              <div key={item.title} className={`relative border rounded-2xl p-6 ${item.bg} hover:scale-[1.02] transition-transform`}>
                <div className={`${item.color} mb-4`}>{item.icon}</div>
                <span className={`inline-block text-[10px] font-black uppercase tracking-widest ${item.color} bg-black/30 px-2 py-0.5 rounded-full mb-3`}>
                  {item.badge}
                </span>
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#111] border border-white/8 rounded-2xl px-8 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-gray-500">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /><span>{t("security.cert1")}</span></span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-blue-400" /><span>{t("security.cert2")}</span></span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-orange-400" /><span>{t("security.cert3")}</span></span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-yellow-400" /><span>{t("security.cert4")}</span></span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /><span>{t("security.cert5")}</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-exhaust-dark">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t("cta.title")}<br />
            <span className="text-exhaust-orange">{t("cta.title_exhaust")}</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 whitespace-pre-line">
            {t("cta.desc")}
          </p>
          <Link
            href="/rachat"
            className="inline-flex items-center gap-3 bg-exhaust-orange hover:bg-exhaust-orange-dark text-white font-black px-10 py-5 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Trophy className="w-6 h-6" /> {t("cta.btn")}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-exhaust-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="mb-5">
                <PowerExhaustLogo size="sm" href="/" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {t("footer.tagline")}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-300">{t("footer.nav_title")}</h4>
              <ul className="space-y-2.5 text-gray-400 text-sm">
                <li><Link href="/rachat" className="hover:text-white transition-colors">{t("footer.nav_sell")}</Link></li>
                <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">{t("footer.nav_how")}</a></li>
                <li><a href="#marques" className="hover:text-white transition-colors">{t("footer.nav_brands")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-300">{t("footer.contact_title")}</h4>
              <ul className="space-y-2.5 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 flex-shrink-0" /> contact@power-exhaust.com</li>
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0" /> +33 1 .. .. .. ..</li>
                <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 flex-shrink-0" /> {t("footer.hours")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 Power Exhaust. {t("footer.rights")}</p>
            <p className="text-gray-600">
              Made with <span className="text-purple-500">♥</span> by{" "}
              <a href="https://beassistnow.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-exhaust-orange transition-colors">
                Beassist
              </a>
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link href="/cgv" className="hover:text-white transition-colors">{t("footer.cgv")}</Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">{t("footer.legal")}</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
              <Link href="/login" className="flex items-center gap-1.5 text-gray-600 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {t("footer.backoffice")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
