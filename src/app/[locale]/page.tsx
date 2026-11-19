import Link from "next/link";
import WhyUsInteractive from "@/components/home/WhyUsInteractive";
import ScrollReveal from "@/components/ScrollReveal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { PowerExhaustLogo } from "@/components/ui/Logo";
import { getTranslations } from "next-intl/server";
import {
  Tag, Search, CheckCircle2, Banknote, Package, Zap,
  Trophy, Mail, Phone, Clock,
  ArrowRight, ArrowUpRight, Shield, FileText, Lock, ShieldCheck, Eye, Trash2, Scale
} from "lucide-react";

const BRANDS_PREVIEW = [
  { name: "Akrapovic", code: "SI", origine: "Slovénie", highlight: true },
  { name: "Yoshimura", code: "JP", origine: "Japon", highlight: true },
  { name: "Arrow", code: "IT", origine: "Italie", highlight: false },
  { name: "Leovince", code: "IT", origine: "Italie", highlight: false },
  { name: "Termignoni", code: "IT", origine: "Italie", highlight: true },
  { name: "SC-Project", code: "IT", origine: "Italie", highlight: false },
  { name: "Mivv", code: "IT", origine: "Italie", highlight: false },
  { name: "Austin Racing", code: "GB", origine: "Royaume-Uni", highlight: false },
  { name: "Remus", code: "AT", origine: "Autriche", highlight: false },
  { name: "GPR", code: "IT", origine: "Italie", highlight: false },
  { name: "FMF Racing", code: "US", origine: "États-Unis", highlight: false },
  { name: "Vance & Hines", code: "US", origine: "États-Unis", highlight: false },
];

const COUNTRIES = [
  { code: "SI", pays: "Slovénie", ex: "Akrapovic" },
  { code: "JP", pays: "Japon", ex: "Yoshimura" },
  { code: "IT", pays: "Italie", ex: "Arrow · Leovince · Termignoni · SC-Project · Mivv · GPR" },
  { code: "GB", pays: "Royaume-Uni", ex: "Austin Racing" },
  { code: "AT", pays: "Autriche", ex: "Remus · Dominator" },
  { code: "US", pays: "États-Unis", ex: "FMF · Vance & Hines · Two Brothers" },
  { code: "DE", pays: "Allemagne", ex: "Ligne d'Origine OEM" },
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
      icon: <Tag className="w-6 h-6" />,
      title: t("steps.s1_title"),
      desc: t("steps.s1_desc"),
    },
    {
      n: "02",
      icon: <Search className="w-6 h-6" />,
      title: t("steps.s2_title"),
      desc: t("steps.s2_desc"),
    },
    {
      n: "03",
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: t("steps.s3_title"),
      desc: t("steps.s3_desc"),
    },
    {
      n: "04",
      icon: <Banknote className="w-6 h-6" />,
      title: t("steps.s4_title"),
      desc: t("steps.s4_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-exhaust-dark text-white">
      <ScrollReveal />

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-exhaust-dark/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/suivi"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              {t("nav.trackFile")}
            </Link>
            <Link
              href="/rachat"
              className="bg-exhaust-orange hover:bg-exhaust-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-md transition-colors"
            >
              {t("nav.sell")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-exhaust-dark">
        <div className="absolute inset-0">
          <img
            src="/banner-hero.png"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-right opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-exhaust-dark via-exhaust-dark/85 to-exhaust-dark/40" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-exhaust-dark to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-exhaust-orange" />
              <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="font-display font-extrabold uppercase leading-[0.9] tracking-tight text-5xl md:text-7xl lg:text-8xl text-white mb-8">
              {t("hero.title1")}{" "}
              <span className="text-exhaust-orange">{t("hero.title2")}</span>{" "}
              {t("hero.title3")}
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              {t("hero.desc")}
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-12">
              {[
                { icon: <Banknote className="w-4 h-4" />, text: t("hero.badge_price") },
                { icon: <Zap className="w-4 h-4" />, text: t("hero.badge_payment") },
                { icon: <FileText className="w-4 h-4" />, text: t("hero.badge_cert") },
                { icon: <Shield className="w-4 h-4" />, text: t("hero.badge_secure") },
              ].map((b) => (
                <span key={b.text} className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-exhaust-orange">{b.icon}</span>
                  {b.text}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/rachat"
                className="group bg-exhaust-orange hover:bg-exhaust-orange-dark text-white font-bold px-8 py-4 rounded-md transition-colors text-lg inline-flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" /> {t("hero.cta_estimate")}
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#comment-ca-marche"
                className="border border-white/20 text-gray-200 hover:text-white hover:border-white/40 font-semibold px-8 py-4 rounded-md transition-colors text-center"
              >
                {t("hero.cta_how")}
              </a>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
            {[
              { value: "+50", label: t("hero.stat_buybacks") },
              { value: "48h", label: t("hero.stat_payment") },
              { value: "56+", label: t("hero.stat_models") },
              { value: "16", label: t("hero.stat_brands") },
            ].map((stat) => (
              <div key={stat.label} className="py-6 pr-6 md:border-r md:border-white/10 md:last:border-r-0">
                <p className="font-display font-bold text-4xl md:text-5xl text-white">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ca-marche" className="py-24 bg-exhaust-dark border-t border-white/10 reveal-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-exhaust-orange" />
            <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
              {t("steps.badge")}
            </span>
          </div>
          <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-16">
            {t("steps.title")} <span className="text-exhaust-orange">{t("steps.title_paid")}</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-exhaust-dark p-8 group hover:bg-[#111] transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-exhaust-orange">{step.icon}</span>
                  <span className="font-display font-bold text-2xl text-white/20">{step.n}</span>
                </div>
                <h3 className="font-display font-bold uppercase tracking-tight text-xl text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/rachat"
              className="inline-flex items-center gap-2 text-exhaust-orange font-bold hover:gap-3 transition-all"
            >
              {t("steps.cta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUES ── */}
      <section id="marques" className="py-24 bg-exhaust-dark border-t border-white/10 reveal-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-exhaust-orange" />
            <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
              {t("brands.badge")}
            </span>
          </div>
          <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-6">
            {t("brands.title")}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mb-12">
            {t("brands.desc")}
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4 mb-16">
            {COUNTRIES.map(({ code, pays, ex }) => (
              <div key={pays} className="flex items-center gap-3">
                <span className="font-display font-bold text-lg text-exhaust-orange w-8">{code}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{pays}</p>
                  <p className="text-xs text-gray-500">{ex}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-white/10 border border-white/10">
            {BRANDS_PREVIEW.map((brand) => (
              <div key={brand.name} className="bg-exhaust-dark p-6 text-center hover:bg-[#111] transition-colors">
                <p className={`font-display font-bold text-sm uppercase tracking-wide ${brand.highlight ? "text-exhaust-orange" : "text-white/40"}`}>
                  {brand.code}
                </p>
                <p className="font-bold text-white text-sm mt-2">{brand.name}</p>
                <p className="text-xs text-gray-500 mt-1">{brand.origine}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/rachat"
              className="inline-flex items-center gap-2 text-exhaust-orange font-bold hover:gap-3 transition-all"
            >
              {t("brands.cta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PAIEMENT 48H ── */}
      <section className="py-24 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-exhaust-orange" />
                <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
                  {t("hero.badge_payment")}
                </span>
              </div>
              <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-6">
                {t("payment.title")} <span className="text-exhaust-orange">{t("payment.title_fast")}</span> {t("payment.title_after")}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {t("payment.desc")}
              </p>
            </div>

            <div className="divide-y divide-white/10 border border-white/10">
              {[
                { icon: <Package className="w-5 h-5" />, title: t("payment.step1_title"), desc: t("payment.step1_desc") },
                { icon: <Search className="w-5 h-5" />, title: t("payment.step2_title"), desc: t("payment.step2_desc") },
                { icon: <Banknote className="w-5 h-5" />, title: t("payment.step3_title"), desc: t("payment.step3_desc") },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-5 py-6 first:pt-0 last:pb-0">
                  <span className="text-exhaust-orange flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-bold">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS ── */}
      <section id="pourquoi-nous" className="py-24 bg-exhaust-dark border-t border-white/10 reveal-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-exhaust-orange" />
            <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
              {t("whyUs.badge")}
            </span>
          </div>
          <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-16">
            {t("whyUs.title")}
          </h2>
          <WhyUsInteractive />
        </div>
      </section>

      {/* ── SÉCURITÉ & RGPD ── */}
      <section className="py-24 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-exhaust-orange" />
            <span className="text-exhaust-orange text-xs font-bold uppercase tracking-[0.2em]">
              {t("security.badge")}
            </span>
          </div>
          <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl md:text-6xl text-white leading-none mb-6">
            {t("security.title")} <span className="text-exhaust-orange">{t("security.title_protected")}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mb-16">
            {t("security.desc")}
          </p>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {[
              { icon: <Lock className="w-6 h-6" />, title: t("security.g1_title"), desc: t("security.g1_desc"), badge: t("security.g1_badge") },
              { icon: <Trash2 className="w-6 h-6" />, title: t("security.g2_title"), desc: t("security.g2_desc"), badge: t("security.g2_badge") },
              { icon: <Eye className="w-6 h-6" />, title: t("security.g3_title"), desc: t("security.g3_desc"), badge: t("security.g3_badge") },
              { icon: <ShieldCheck className="w-6 h-6" />, title: t("security.g4_title"), desc: t("security.g4_desc"), badge: t("security.g4_badge") },
              { icon: <Scale className="w-6 h-6" />, title: t("security.g5_title"), desc: t("security.g5_desc"), badge: t("security.g5_badge") },
              { icon: <FileText className="w-6 h-6" />, title: t("security.g6_title"), desc: t("security.g6_desc"), badge: t("security.g6_badge") },
            ].map((item) => (
              <div key={item.title} className="bg-exhaust-dark p-8 hover:bg-[#111] transition-colors">
                <div className="text-exhaust-orange mb-5">{item.icon}</div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                  {item.badge}
                </span>
                <h3 className="font-display font-bold uppercase tracking-tight text-lg text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-gray-500">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-exhaust-orange" /><span>{t("security.cert1")}</span></span>
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-exhaust-orange" /><span>{t("security.cert2")}</span></span>
            <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-exhaust-orange" /><span>{t("security.cert3")}</span></span>
            <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-exhaust-orange" /><span>{t("security.cert4")}</span></span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-exhaust-orange" /><span>{t("security.cert5")}</span></span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-exhaust-dark border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display font-extrabold uppercase tracking-tight text-5xl md:text-7xl text-white leading-none mb-8">
            {t("cta.title")} <span className="text-exhaust-orange">{t("cta.title_exhaust")}</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 whitespace-pre-line">
            {t("cta.desc")}
          </p>
          <Link
            href="/rachat"
            className="inline-flex items-center gap-3 bg-exhaust-orange hover:bg-exhaust-orange-dark text-white font-bold px-10 py-5 rounded-md text-lg transition-colors"
          >
            <Trophy className="w-6 h-6" /> {t("cta.btn")}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-exhaust-dark border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="mb-6">
                <PowerExhaustLogo size="sm" href="/" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                {t("footer.tagline")}
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold uppercase tracking-wide text-sm text-gray-300 mb-5">{t("footer.nav_title")}</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li><Link href="/rachat" className="hover:text-white transition-colors">{t("footer.nav_sell")}</Link></li>
                <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">{t("footer.nav_how")}</a></li>
                <li><a href="#marques" className="hover:text-white transition-colors">{t("footer.nav_brands")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold uppercase tracking-wide text-sm text-gray-300 mb-5">{t("footer.contact_title")}</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 flex-shrink-0 text-exhaust-orange" /> contact@power-exhaust.com</li>
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0 text-exhaust-orange" /> +33 6 98 11 00 29</li>
                <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 flex-shrink-0 text-exhaust-orange" /> {t("footer.hours")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© 2026 Power Exhaust. {t("footer.rights")}</p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link href="/cgv" className="hover:text-white transition-colors">{t("footer.cgv")}</Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">{t("footer.legal")}</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
              <Link href="/login" className="flex items-center gap-1.5 text-gray-600 hover:text-white border border-white/10 hover:border-white/30 rounded px-3 py-1.5 transition-colors">
                {t("footer.backoffice")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
