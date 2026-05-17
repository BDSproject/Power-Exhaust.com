/**
 * API — Téléchargement du RIB chiffré (admin uniquement)
 * GET /api/rib/[rachatId]/fichier
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { readEncryptedFile } from "@/lib/crypto-file";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rachatId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { rachatId } = await params;
  const doc = await prisma.ribDocument.findUnique({
    where: { rachatId },
    select: {
      fichierUuid: true,
      fichierMime: true,
      fichierIv: true,
      fichierTag: true,
    },
  });

  if (!doc) return NextResponse.json({ message: "RIB non trouvé" }, { status: 404 });

  const buffer = await readEncryptedFile(doc.fichierUuid, doc.fichierIv, doc.fichierTag);
  const ext = doc.fichierMime.split("/")[1] ?? "bin";

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": doc.fichierMime,
      "Content-Disposition": `inline; filename="rib-${rachatId}.${ext}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
