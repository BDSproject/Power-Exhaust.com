export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { fetchLabel, SendCloudError as BoxtalError } from "@/lib/sendcloud";

/**
 * GET /api/rachat/[id]/bordereau
 *
 * Télécharge l'étiquette d'expédition Boxtal (PDF) associée à un rachat.
 * L'ID du rachat est suffisamment aléatoire (cuid) pour ne pas nécessiter
 * d'authentification supplémentaire — seul le détenteur de l'URL peut la télécharger.
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

    // Fetch du PDF depuis l'API Boxtal
    const pdfBuffer = await fetchLabel(rachat.boxtralOrderRef);

    const filename = `bordereau-${rachat.reference}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof BoxtalError) {
      console.error("[BORDEREAU_GET] BoxtalError:", error.message);
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode ?? 502 }
      );
    }

    console.error("[BORDEREAU_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
