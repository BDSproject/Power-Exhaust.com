export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const brands = await prisma.exhaustBrand.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { models: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("[CATALOGUE_MARQUES_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
