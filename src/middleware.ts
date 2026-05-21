import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Ce middleware gère uniquement la détection de locale et les redirections i18n.
// L'authentification est gérée côté serveur dans les layouts (dashboard/layout.tsx).
export default createMiddleware(routing);

export const config = {
  // Appliquer uniquement aux routes publiques i18n.
  // Exclure : API, _next, fichiers statiques, login, dashboard, rachats, attestations, admin, suivi, identite.
  matcher: [
    "/((?!api|_next|_vercel|login|dashboard|rachats|attestations|admin|suivi|identite|.*\\..*).*)",
  ],
};
