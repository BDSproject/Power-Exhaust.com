/**
 * API — Télécharger un document
 * GET /api/admin/documents/[id]/download
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { readEncryptedFile } from "@/lib/crypto-file";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const [type, ...rest] = id.split("-");
    const resourceId = rest.slice(0, -1).join("-");
    const subType = rest[rest.length - 1];

    if (type === "identite") {
      const identite = await prisma.identiteDocument.findUnique({
        where: { id: resourceId },
        select: {
          fichierRectoUuid: true,
          fichierRectoMime: true,
          fichierRectoIv: true,
          fichierRectoTag: true,
          fichierVersoUuid: true,
          fichierVersoMime: true,
          fichierVersoIv: true,
          fichierVersoTag: true,
          purgee: true,
          rachat: {
            select: {
              reference: true,
            },
          },
        },
      });

      if (!identite || identite.purgee) {
        return NextResponse.json({ message: "Document non trouvé ou supprimé" }, { status: 404 });
      }

      const isRecto = subType === "recto";
      const uuid = isRecto ? identite.fichierRectoUuid : identite.fichierVersoUuid;
      const mime = isRecto ? identite.fichierRectoMime : identite.fichierVersoMime;
      const iv = isRecto ? identite.fichierRectoIv : identite.fichierVersoIv;
      const tag = isRecto ? identite.fichierRectoTag : identite.fichierVersoTag;

      if (!uuid || !iv || !tag) {
        return NextResponse.json({ message: "Fichier non disponible" }, { status: 404 });
      }

      const buffer = await readEncryptedFile(uuid, iv, tag);

      return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": mime ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="identite-${subType}-${identite.rachat.reference}.${mime?.split("/")[1] ?? "bin"}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (type === "rib") {
      const rib = await prisma.ribDocument.findUnique({
        where: { id: resourceId },
        select: {
          fichierUuid: true,
          fichierMime: true,
          fichierIv: true,
          fichierTag: true,
          rachat: {
            select: {
              reference: true,
            },
          },
        },
      });

      if (!rib) {
        return NextResponse.json({ message: "RIB non trouvé" }, { status: 404 });
      }

      const buffer = await readEncryptedFile(rib.fichierUuid, rib.fichierIv, rib.fichierTag);

      return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": rib.fichierMime ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="rib-${rib.rachat.reference}.${rib.fichierMime?.split("/")[1] ?? "bin"}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (type === "photo") {
      const rachat = await prisma.rachat.findUnique({
        where: { id: resourceId },
        select: {
          photos: true,
          reference: true,
        },
      });

      if (!rachat || !rachat.photos) {
        return NextResponse.json({ message: "Photo non trouvée" }, { status: 404 });
      }

      const photosArray = JSON.parse(rachat.photos);
      const photoIndex = parseInt(subType);

      if (isNaN(photoIndex) || !photosArray[photoIndex]) {
        return NextResponse.json({ message: "Photo non trouvée" }, { status: 404 });
      }

      const photoBase64 = photosArray[photoIndex];
      const matches = photoBase64.match(/^data:([^;]+);base64,(.+)$/);

      if (!matches) {
        return NextResponse.json({ message: "Format de photo invalide" }, { status: 400 });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="photo-${rachat.reference}-${photoIndex + 1}.jpg"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ message: "Type de document invalide" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_DOCUMENT_DOWNLOAD]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
