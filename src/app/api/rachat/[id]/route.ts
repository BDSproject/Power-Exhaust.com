export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusChangeEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut, prixPropose, noteAdmin } = body;

  // Récupérer l'état actuel avant modification
  const before = await prisma.rachat.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (statut) data.statut = statut;
  if (prixPropose !== undefined) data.prixPropose = prixPropose;
  if (noteAdmin !== undefined) data.noteAdmin = noteAdmin;

  const rachat = await prisma.rachat.update({
    where: { id },
    data,
  });

  // Envoyer email au client si le statut a changé
  if (statut && statut !== before.statut) {
    try {
      await sendStatusChangeEmail({
        emailVendeur:    rachat.emailVendeur,
        prenomVendeur:   rachat.prenomVendeur,
        reference:       rachat.reference,
        statut:          rachat.statut,
        marque:          rachat.marque,
        modele:          rachat.modele,
        typeEchappement: rachat.typeEchappement,
        prixPropose:     rachat.prixPropose ?? null,
        prixAccepte:     rachat.prixAccepte ?? null,
        noteAdmin:       rachat.noteAdmin ?? null,
      });
    } catch (emailErr) {
      // Ne pas bloquer la réponse si l'email échoue — on log l'erreur
      console.error("[PATCH /api/rachat] Email status change failed:", emailErr);
    }
  }

  return NextResponse.json(rachat);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const rachat = await prisma.rachat.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, address: true } },
      attestation: { select: { id: true, numero: true, estComplete: true } },
    },
  });

  if (!rachat) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  // Only admin or owner
  if (session.user.role !== "ADMIN" && rachat.userId !== session.user.id) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  return NextResponse.json(rachat);
}
