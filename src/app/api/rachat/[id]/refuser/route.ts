export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendClientRejectionEmail } from "@/lib/email";
import type { RachatEmailData } from "@/lib/email";

/**
 * GET /api/rachat/[id]/refuser?token=xxx&motif=...
 *
 * Lien reçu par l'admin dans l'email de dossier.
 * Refuse la demande et notifie le client.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const motif = req.nextUrl.searchParams.get("motif") ?? undefined;

  if (!token) {
    return new NextResponse(htmlError("Token manquant."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const rachat = await prisma.rachat.findUnique({
      where: { id },
      select: {
        id: true, reference: true, adminToken: true, statut: true,
        prenomVendeur: true, nomVendeur: true, emailVendeur: true,
        telVendeur: true, adresseVendeur: true, villeVendeur: true,
        codePostalVendeur: true, typeEchappement: true, etatEchappement: true,
        description: true, marque: true, modele: true, annee: true,
        kilometrage: true, poidsKg: true, prixOfficiel: true,
        signatureVendeur: true, photos: true,
      },
    });

    if (!rachat || rachat.adminToken !== token) {
      return new NextResponse(htmlError("Lien invalide ou expiré."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (rachat.statut === "REFUSE") {
      return new NextResponse(htmlInfo("Ce dossier a déjà été refusé."), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (rachat.statut === "VALIDE") {
      return new NextResponse(htmlError("Ce dossier a déjà été validé."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    await prisma.rachat.update({
      where: { id },
      data: { statut: "REFUSE" },
    });

    const emailData: RachatEmailData = {
      ...rachat,
      adminToken: rachat.adminToken!,
      etatEchappement: rachat.etatEchappement as string,
    };

    await sendClientRejectionEmail(emailData, motif).catch((e) =>
      console.error("[REFUSER] Email error:", e)
    );

    return new NextResponse(
      htmlSuccess(
        "Dossier refusé",
        `${rachat.prenomVendeur} ${rachat.nomVendeur} — Réf. ${rachat.reference}<br/>Le client a été notifié par email.`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("[REFUSER]", err);
    return new NextResponse(htmlError("Erreur serveur. Veuillez réessayer."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function page(icon: string, title: string, content: string, color: string) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>${title}</title>
  <style>*{box-sizing:border-box}body{margin:0;background:#0d0d0d;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:48px;max-width:480px;text-align:center}
  h1{color:#fff;font-size:22px;font-weight:900;margin:0 0 12px}p{color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px}
  a{display:inline-block;background:${color};color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px}</style>
  </head><body><div class="card">
  <div style="font-size:48px;margin-bottom:16px">${icon}</div>
  <h1>${title}</h1><p>${content}</p>
  <a href="${process.env.NEXTAUTH_URL ?? ""}/rachats">Voir le dashboard</a>
  </div></body></html>`;
}

function htmlSuccess(title: string, content: string) {
  return page("✅", title, content, "#22c55e");
}
function htmlError(msg: string) {
  return page("❌", "Erreur", msg, "#ef4444");
}
function htmlInfo(msg: string) {
  return page("ℹ️", "Déjà traité", msg, "#6366f1");
}
