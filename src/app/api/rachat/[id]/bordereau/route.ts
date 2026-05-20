export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/rachat/[id]/bordereau
 *
 * Télécharge l'étiquette d'expédition associée à un rachat.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rachat = await prisma.rachat.findUnique({
      where: { id },
      select: {
        id: true,
        reference: true,
        boxtralOrderRef: true,
        nomVendeur: true,
        prenomVendeur: true,
      },
    });

    if (!rachat) {
      return NextResponse.json({ message: "Rachat introuvable" }, { status: 404 });
    }

    if (!rachat.boxtralOrderRef) {
      return NextResponse.json(
        {
          message:
            "Le bordereau n'est pas encore disponible pour ce rachat. " +
            "Il sera généré dès que votre demande sera traitée.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Service d'expédition non configuré." },
      { status: 503 }
    );
  } catch (error) {
    console.error("[BORDEREAU_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
