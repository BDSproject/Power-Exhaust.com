export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusChangeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const rachatId = searchParams.get("id");

  if (!token || !rachatId) {
    return new Response("Paramètres manquants", { status: 400 });
  }

  const rachat = await prisma.rachat.findUnique({
    where: { id: rachatId },
  });

  if (!rachat || rachat.adminToken !== token) {
    return new Response("Lien invalide ou expiré", { status: 403 });
  }

  // Mettre à jour le statut et effacer le token
  const updatedRachat = await prisma.rachat.update({
    where: { id: rachatId },
    data: {
      statut: "VALIDE",
      adminToken: null, // Le token est à usage unique
    },
  });

  // Envoyer un email de confirmation au client
  try {
    await sendStatusChangeEmail({
      emailVendeur:    updatedRachat.emailVendeur,
      prenomVendeur:   updatedRachat.prenomVendeur,
      reference:       updatedRachat.reference,
      statut:          "VALIDE",
      marque:          updatedRachat.marque,
      modele:          updatedRachat.modele,
      typeEchappement: updatedRachat.typeEchappement,
      prixPropose:     updatedRachat.prixPropose,
      prixAccepte:     updatedRachat.prixAccepte,
      noteAdmin:       updatedRachat.noteAdmin,
    });
  } catch (emailErr) {
    console.error("[/api/rachat/validate] Email status change failed:", emailErr);
  }

  // Rediriger vers une page de confirmation
  const url = new URL("/admin/validation-ok", req.url);
  return NextResponse.redirect(url);
}
