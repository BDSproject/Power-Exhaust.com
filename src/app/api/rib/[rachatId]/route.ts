/**
 * API — RIB
 * POST /api/rib/[rachatId]  → upload (authentifié ou via token admin dans headers)
 * GET  /api/rib/[rachatId]  → métadonnées (admin uniquement)
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { saveEncryptedFile } from "@/lib/crypto-file";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s pour les uploads volumineux

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

// ─── GET — Métadonnées (admin only) ─────────────────────────────────────────

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
      id: true,
      rachatId: true,
      fichierMime: true,
      uploadIp: true,
      createdAt: true,
    },
  });

  if (!doc) return NextResponse.json({ message: "RIB non trouvé" }, { status: 404 });
  return NextResponse.json(doc);
}

// ─── POST — Upload base64 ou FormData ──────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ rachatId: string }> }
) {
  try {
    const { rachatId } = await params;

    // Vérifier que le rachat existe
    const rachat = await prisma.rachat.findUnique({
      where: { id: rachatId },
      select: { id: true, rib: { select: { id: true } } },
    });
    if (!rachat) {
      return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
    }
    if (rachat.rib) {
      return NextResponse.json({ message: "RIB déjà enregistré" }, { status: 409 });
    }

    let buffer: Buffer;
    let mime: string;

    // Déterminer le type de contenu (FormData ou JSON base64)
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // ─ FormData (recommended) ─
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      
      if (!file) {
        return NextResponse.json({ message: "Fichier manquant" }, { status: 400 });
      }

      mime = file.type;
      if (!ALLOWED_MIME.includes(mime)) {
        return NextResponse.json({ message: "Format non autorisé (JPG, PNG, WEBP ou PDF)" }, { status: 400 });
      }

      buffer = Buffer.from(await file.arrayBuffer());
      
      if (buffer.byteLength > MAX_SIZE) {
        return NextResponse.json({ message: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
      }
    } else {
      // ─ JSON base64 (legacy) ─
      const body = await req.json() as { dataUrl?: string; mime?: string };
      const { dataUrl } = body;
      mime = body.mime ?? "";

      if (!dataUrl || !mime) {
        return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
      }
      if (!ALLOWED_MIME.includes(mime)) {
        return NextResponse.json({ message: "Format non autorisé (JPG, PNG, WEBP ou PDF)" }, { status: 400 });
      }

      // Décoder le base64
      const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      buffer = Buffer.from(base64Data, "base64");

      if (buffer.byteLength > MAX_SIZE) {
        return NextResponse.json({ message: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
      }
    }

    const uuid = randomUUID();
    const { iv, authTag } = await saveEncryptedFile(buffer, uuid);

    const uploadIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "inconnue";
    const uploadUa = req.headers.get("user-agent") ?? "inconnu";

    await prisma.ribDocument.create({
      data: {
        rachatId,
        fichierUuid: uuid,
        fichierMime: mime,
        fichierIv: iv,
        fichierTag: authTag,
        uploadIp,
        uploadUa,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[RIB_POST]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
