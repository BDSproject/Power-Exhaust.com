import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Packages serveur natifs à externaliser (Vercel)
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Permettre les images externes
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Configuration des limites de requête pour les photos en base64
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
  // Optimisations
  poweredByHeader: false,
  compress: true,
};

export default withNextIntl(nextConfig);
