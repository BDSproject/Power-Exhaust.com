import type { Metadata } from "next";
import CookieBanner from "@/components/CookieBanner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Power Exhaust — Rachat de Lignes d'Échappement Moto",
    template: "%s | Power Exhaust",
  },
  description:
    "Power Exhaust rachète vos lignes d'échappement moto — toutes marques. Réponse personnalisée sous 24h, paiement sous 48h après réception.",
  keywords: ["rachat échappement", "vente échappement moto", "Akrapovic", "Yoshimura", "Arrow", "ligne complète"],
  openGraph: {
    title: "Power Exhaust — Rachat de Lignes d'Échappement Moto",
    description: "Vendez votre échappement moto facilement. Réponse personnalisée sous 24h, paiement sous 48h.",
    type: "website",
    url: "https://power-exhaust.com",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en" | "de" | "es" | "it" | "pt" | "nl" | "pl")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <CookieBanner />
    </NextIntlClientProvider>
  );
}

