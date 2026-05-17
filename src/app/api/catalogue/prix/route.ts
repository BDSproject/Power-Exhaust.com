export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modeleId = searchParams.get("modeleId");
    const etat = searchParams.get("etat");

    if (!modeleId || !etat) {
      return NextResponse.json(
        { message: "modeleId et etat requis" },
        { status: 400 }
      );
    }

    const price = await prisma.exhaustPrice.findUnique({
      where: {
        modelId_etat: {
          modelId: modeleId,
          etat: etat as "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS",
        },
      },
      include: {
        model: { include: { brand: true } },
      },
    });

    if (!price) {
      return NextResponse.json(
        { message: "Prix non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(price);
  } catch (error) {
    console.error("[CATALOGUE_PRIX_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
