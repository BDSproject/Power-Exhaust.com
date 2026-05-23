/**
 * API — Lister les attestations (admin)
 * GET /api/admin/attestations
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const attestations = await prisma.attestation.findMany({
      include: {
        rachat: {
          select: {
            id: true,
            reference: true,
            marque: true,
            modele: true,
            annee: true,
            etatEchappement: true,
            statut: true,
            nomVendeur: true,
            prenomVendeur: true,
            emailVendeur: true,
            telVendeur: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attestations);
  } catch (error) {
    console.error("[ADMIN_ATTESTATIONS_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
