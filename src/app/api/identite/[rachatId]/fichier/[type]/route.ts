/**
 * API — Accès aux fichiers chiffrés de pièce d'identité
 * GET /api/identite/[rachatId]/fichier/[type]  → stream déchiffré (admin only)
 * [type] = "recto" | "verso"
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { readEncryptedFile } from "@/lib/crypto-file";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ rachatId: string; type: string }> }
) {
  try {
    // Admin uniquement
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { rachatId, type } = await params;

    if (type !== "recto" && type !== "verso") {
      return NextResponse.json({ message: "Type invalide" }, { status: 400 });
    }

    const doc = await prisma.identiteDocument.findUnique({
      where: { rachatId },
      select: {
        purgee: true,
        fichierRectoUuid: true,
        fichierRectoMime: true,
        fichierRectoIv: true,
        fichierRectoTag: true,
        fichierVersoUuid: true,
        fichierVersoMime: true,
        fichierVersoIv: true,
        fichierVersoTag: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ message: "Document non trouvé" }, { status: 404 });
    }
    if (doc.purgee) {
      return NextResponse.json(
        { message: "Ce fichier a été supprimé conformément à la politique RGPD (30 jours)" },
        { status: 410 }
      );
    }

    const uuid  = type === "recto" ? doc.fichierRectoUuid  : doc.fichierVersoUuid;
    const mime  = type === "recto" ? doc.fichierRectoMime  : doc.fichierVersoMime;
    const iv    = type === "recto" ? doc.fichierRectoIv    : doc.fichierVersoIv;
    const tag   = type === "recto" ? doc.fichierRectoTag   : doc.fichierVersoTag;

    if (!uuid || !iv || !tag) {
      return NextResponse.json({ message: "Fichier non disponible" }, { status: 404 });
    }

    const buffer = await readEncryptedFile(uuid, iv, tag);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mime ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${type}-${rachatId}.${mime?.split("/")[1] ?? "bin"}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        // Empêche l'indexation et le partage
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[IDENTITE_FILE_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
