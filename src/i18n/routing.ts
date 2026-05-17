import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "de", "es", "it", "pt", "nl", "pl"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // /fr → /, /en → /en, etc.
});
