export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const marqueId = searchParams.get("marqueId");

    if (!marqueId) {
      return NextResponse.json({ message: "marqueId requis" }, { status: 400 });
    }

    const models = await prisma.exhaustModel.findMany({
      where: { brandId: marqueId, isActive: true },
      include: {
        prices: { where: { isActive: true }, orderBy: { etat: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error("[CATALOGUE_MODELES_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
