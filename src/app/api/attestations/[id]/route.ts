export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: {
        rachat: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!attestation) {
      return NextResponse.json({ message: "Attestation introuvable" }, { status: 404 });
    }

    // Vérifier les droits
    if (
      session.user.role !== "ADMIN" &&
      attestation.rachat.userId !== session.user.id
    ) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const { rachat, ...attestationData } = attestation;

    return NextResponse.json({
      attestation: attestationData,
      rachat,
    });
  } catch (error) {
    console.error("[ATTESTATION_GET_BY_ID]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
