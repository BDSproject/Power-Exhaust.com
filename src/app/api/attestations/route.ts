export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateNumeroAttestation } from "@/lib/utils";

// POST — Créer une attestation (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { rachatId, prixFinal, dateVente } = await req.json();

    if (!rachatId || !prixFinal) {
      return NextResponse.json(
        { message: "rachatId et prixFinal sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le rachat existe et est accepté
    const rachat = await prisma.rachat.findUnique({ where: { id: rachatId } });
    if (!rachat) {
      return NextResponse.json({ message: "Rachat introuvable" }, { status: 404 });
    }

    // Créer l'attestation
    const attestation = await prisma.attestation.create({
      data: {
        rachatId,
        numero: generateNumeroAttestation(),
        prixFinal,
        dateVente: dateVente ? new Date(dateVente) : new Date(),
        estComplete: false,
      },
    });

    // Mettre à jour le statut du rachat
    await prisma.rachat.update({
      where: { id: rachatId },
      data: { statut: "ACCEPTE", prixAccepte: prixFinal },
    });

    return NextResponse.json(attestation, { status: 201 });
  } catch (error) {
    console.error("[ATTESTATION_POST]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// GET — Lister les attestations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const attestations = await prisma.attestation.findMany({
      where:
        session.user.role === "ADMIN"
          ? {}
          : { rachat: { userId: session.user.id } },
      include: {
        rachat: {
          select: {
            marque: true,
            modele: true,
            annee: true,
            nomVendeur: true,
            prenomVendeur: true,
            immatriculation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attestations);
  } catch (error) {
    console.error("[ATTESTATION_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
