export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendClientValidationEmail } from "@/lib/email";
import type { RachatEmailData } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=token_manquant", req.url));
  try {
    const rachat = await prisma.rachat.findUnique({
      where: { id },
      select: {
        id: true, reference: true, adminToken: true, statut: true,
        prenomVendeur: true, nomVendeur: true, emailVendeur: true,
        telVendeur: true, adresseVendeur: true, villeVendeur: true,
        codePostalVendeur: true, typeEchappement: true, etatEchappement: true,
        description: true, marque: true, modele: true, annee: true,
        kilometrage: true, poidsKg: true, longueurCm: true, largeurCm: true,
        hauteurCm: true, prixOfficiel: true, signatureVendeur: true, photos: true,
      },
    });
    if (!rachat || rachat.adminToken !== token)
      return new NextResponse(htmlError("Lien invalide ou expire."), { status: 400, headers: { "Content-Type": "text/html" } });
    if (rachat.statut === "VALIDE")
      return new NextResponse(htmlInfo("Ce dossier a deja ete valide."), { status: 200, headers: { "Content-Type": "text/html" } });
    if (rachat.statut === "REFUSE")
      return new NextResponse(htmlError("Ce dossier a deja ete refuse."), { status: 400, headers: { "Content-Type": "text/html" } });
    await prisma.rachat.update({ where: { id }, data: { statut: "VALIDE" } });
    const emailData: RachatEmailData = { ...rachat, adminToken: rachat.adminToken!, etatEchappement: rachat.etatEchappement as string };
    await sendClientValidationEmail(emailData).catch((e) => console.error("[VALIDER] Email error:", e));
    const msg = `${rachat.prenomVendeur} ${rachat.nomVendeur} — Ref. ${rachat.reference} — Email de confirmation envoye.`;
    return new NextResponse(htmlSuccess("Dossier valide !", msg), { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("[VALIDER]", err);
    return new NextResponse(htmlError("Erreur serveur."), { status: 500, headers: { "Content-Type": "text/html" } });
  }
}

function page(icon: string, title: string, body: string, color: string) {
  const url = (process.env.NEXTAUTH_URL ?? "") + "/rachats";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
  <style>body{margin:0;background:#0d0d0d;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#161616;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:48px;max-width:480px;text-align:center}
  h1{color:#fff;font-size:22px;margin:0 0 12px}p{color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px}
  a{display:inline-block;background:${color};color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none}</style>
  </head><body><div class="card"><h1>${title}</h1><p>${body}</p>
  <a href="${url}">Voir le dashboard</a></div></body></html>`;
}

function htmlSuccess(t: string, c: string) { return page("ok", t, c, "#22c55e"); }
function htmlError(m: string) { return page("err", "Erreur", m, "#ef4444"); }
function htmlInfo(m: string) { return page("info", "Deja traite", m, "#6366f1"); }
