/**
 * API — Détails rachat pour admin
 * GET /api/admin/rachats/[rachatId]
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rachatId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { rachatId } = await params;

    const rachat = await prisma.rachat.findUnique({
      where: { id: rachatId },
      include: {
        identite: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            dateNaissance: true,
            typePiece: true,
            numeroPiece: true,
            fichierRectoUuid: true,
            fichierVersoUuid: true,
            fichierRectoMime: true,
            fichierVersoMime: true,
            consentementTraitement: true,
            consentementConservation: true,
            consentementAt: true,
            createdAt: true,
          },
        },
        rib: {
          select: {
            id: true,
            fichierUuid: true,
            fichierMime: true,
            createdAt: true,
          },
        },
      },
    });

    if (!rachat) {
      return NextResponse.json({ message: "Rachat introuvable" }, { status: 404 });
    }

    return NextResponse.json(rachat);
  } catch (error) {
    console.error("[ADMIN_RACHAT_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
