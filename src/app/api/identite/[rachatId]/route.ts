/**
 * API — Pièce d'identité
 * POST /api/identite/[rachatId]?token=xxx  → upload (public, token requis)
 * GET  /api/identite/[rachatId]            → métadonnées (admin uniquement)
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { saveEncryptedFile } from "@/lib/crypto-file";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

// ─── GET — Métadonnées (admin only) ─────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rachatId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { rachatId } = await params;
    const doc = await prisma.identiteDocument.findUnique({
      where: { rachatId },
      select: {
        id: true,
        rachatId: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        adresse: true,
        typePiece: true,
        numeroPiece: true,
        dateDelivrance: true,
        lieuDelivrance: true,
        fichierRectoUuid: true,
        fichierVersoUuid: true,
        fichierRectoMime: true,
        fichierVersoMime: true,
        consentementTraitement: true,
        consentementConservation: true,
        consentementAt: true,
        purgeAt: true,
        purgee: true,
        purgeeAt: true,
        uploadIp: true,
        createdAt: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ message: "Document non trouvé" }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("[IDENTITE_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST — Upload (public, token-gated) ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ rachatId: string }> }
) {
  try {
    const { rachatId } = await params;
    const token = req.nextUrl.searchParams.get("token");

    // Vérification du token
    const rachat = await prisma.rachat.findUnique({
      where: { id: rachatId },
      select: { id: true, identiteToken: true, identite: { select: { id: true } } },
    });

    if (!rachat) {
      return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
    }
    if (!rachat.identiteToken || rachat.identiteToken !== token) {
      return NextResponse.json({ message: "Lien invalide ou expiré" }, { status: 403 });
    }
    if (rachat.identite) {
      return NextResponse.json(
        { message: "Pièce d'identité déjà soumise pour cette demande" },
        { status: 409 }
      );
    }

    // Parsing multipart
    const formData = await req.formData();

    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;
    const dateNaissance = formData.get("dateNaissance") as string;
    const adresse = formData.get("adresse") as string;
    const typePiece = formData.get("typePiece") as string;
    const numeroPiece = formData.get("numeroPiece") as string;
    const dateDelivrance = formData.get("dateDelivrance") as string;
    const lieuDelivrance = formData.get("lieuDelivrance") as string;
    const consentementTraitement = formData.get("consentementTraitement") === "true";
    const consentementConservation = formData.get("consentementConservation") === "true";
    const rectoFile = formData.get("recto") as File | null;
    const versoFile = formData.get("verso") as File | null;

    // Validation des champs
    const missing = [nom, prenom, dateNaissance, adresse, typePiece, numeroPiece, dateDelivrance, lieuDelivrance]
      .some((v) => !v || v.trim() === "");
    if (missing) {
      return NextResponse.json({ message: "Tous les champs obligatoires doivent être remplis" }, { status: 400 });
    }
    if (!consentementTraitement || !consentementConservation) {
      return NextResponse.json({ message: "Le consentement RGPD est requis" }, { status: 400 });
    }
    if (!["CARTE_IDENTITE", "PASSEPORT", "TITRE_SEJOUR", "PERMIS_CONDUIRE"].includes(typePiece)) {
      return NextResponse.json({ message: "Type de pièce invalide" }, { status: 400 });
    }
    if (!rectoFile) {
      return NextResponse.json({ message: "Le fichier recto est obligatoire" }, { status: 400 });
    }

    // Validation et chiffrement du recto
    if (!ALLOWED_MIME_TYPES.includes(rectoFile.type)) {
      return NextResponse.json({ message: "Format de fichier non autorisé (JPG, PNG, WEBP ou PDF)" }, { status: 400 });
    }
    const rectoBytes = await rectoFile.arrayBuffer();
    if (rectoBytes.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Fichier recto trop volumineux (max 10 Mo)" }, { status: 400 });
    }
    const rectoUuid = randomUUID();
    const rectoMeta = await saveEncryptedFile(Buffer.from(rectoBytes), rectoUuid);

    // Recto: chiffrement
    let versoUuid: string | null = null;
    let versoMeta: { iv: string; authTag: string } | null = null;

    if (versoFile && versoFile.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(versoFile.type)) {
        return NextResponse.json({ message: "Format du verso non autorisé (JPG, PNG, WEBP ou PDF)" }, { status: 400 });
      }
      const versoBytes = await versoFile.arrayBuffer();
      if (versoBytes.byteLength > MAX_FILE_SIZE) {
        return NextResponse.json({ message: "Fichier verso trop volumineux (max 10 Mo)" }, { status: 400 });
      }
      versoUuid = randomUUID();
      versoMeta = await saveEncryptedFile(Buffer.from(versoBytes), versoUuid);
    }

    // Métadonnées réseau
    const uploadIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "inconnue";
    const uploadUa = req.headers.get("user-agent") ?? "inconnu";

    // Purge automatique dans 30 jours
    const purgeAt = new Date();
    purgeAt.setDate(purgeAt.getDate() + 30);

    // Sauvegarde en base
    await prisma.identiteDocument.create({
      data: {
        rachatId,
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        adresse: adresse.trim(),
        typePiece,
        numeroPiece: numeroPiece.trim(),
        dateDelivrance,
        lieuDelivrance: lieuDelivrance.trim(),
        fichierRectoUuid: rectoUuid,
        fichierRectoMime: rectoFile.type,
        fichierRectoIv: rectoMeta.iv,
        fichierRectoTag: rectoMeta.authTag,
        ...(versoUuid && versoMeta
          ? {
              fichierVersoUuid: versoUuid,
              fichierVersoMime: versoFile?.type,
              fichierVersoIv: versoMeta.iv,
              fichierVersoTag: versoMeta.authTag,
            }
          : {}),
        consentementTraitement,
        consentementConservation,
        consentementAt: new Date(),
        uploadIp,
        uploadUa,
        purgeAt,
      },
    });

    // Invalider le token d'upload (usage unique)
    await prisma.rachat.update({
      where: { id: rachatId },
      data: { identiteToken: null },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[IDENTITE_POST]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
