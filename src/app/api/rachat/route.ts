export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { rachatPublicSchema } from "@/lib/validations";
import { getPrixRachat, type EtatRachat } from "@/data/prices";
import { sendAdminDossierEmail, sendClientConfirmationEmail } from "@/lib/email";
import type { RachatEmailData } from "@/lib/email";
// GET — Lister les rachats de l'utilisateur connecté
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const rachats = await prisma.rachat.findMany({
      where:
        session.user.role === "ADMIN"
          ? {}
          : { userId: session.user.id },
      include: {
        attestation: { select: { id: true, numero: true, estComplete: true } },
        exhaustModel: { include: { brand: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rachats);
  } catch (error) {
    console.error("[RACHAT_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Créer une demande de rachat (public ou authentifié)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const parsed = rachatPublicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Données invalides", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const photos = typeof body.photos === "string" ? body.photos : undefined;

    // Signature obligatoire
    const signatureVendeur: string | undefined = body.signatureVendeur;
    if (!signatureVendeur) {
      return NextResponse.json(
        { message: "La signature du vendeur est requise." },
        { status: 400 }
      );
    }

    // Métadonnées de signature pour valeur probante
    const signatureVendeurAt = new Date();
    const signatureVendeurIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "inconnue";
    const signatureVendeurUa = req.headers.get("user-agent") ?? "inconnu";

    const etat = data.etatEchappement as EtatRachat;
    const prixOfficiel = ["EXCELLENT", "BON", "MOYEN"].includes(etat) && data.typeEchappement
      ? getPrixRachat(data.typeEchappement, etat, data.marque || undefined)
      : null;

    // Token sécurisé pour validation/refus par email
    const adminToken = randomBytes(32).toString("hex");
    // Token sécurisé pour upload pièce d'identité (R321-3 CSI)
    const identiteToken = randomBytes(32).toString("hex");

    const rachat = await prisma.rachat.create({
      data: {
        ...data,
        telVendeur:         data.telVendeur?.trim() || "Non renseigné",
        adresseVendeur:     data.adresseVendeur?.trim() || "Adresse non renseignée",
        villeVendeur:       data.villeVendeur?.trim() || "Ville non renseignée",
        codePostalVendeur:  data.codePostalVendeur?.trim() || "00000",
        photos,
        userId:             session?.user.id ?? null,
        statut:             "EN_ATTENTE",
        signatureVendeur,
        signatureVendeurAt,
        signatureVendeurIp,
        signatureVendeurUa,
        adminToken,
        identiteToken,
        ...(prixOfficiel !== null ? { prixOfficiel } : {}),
      },
    });

    // ── Emails (non bloquants) ────────────────────────────────────────────────
    const emailData: RachatEmailData = {
      id:               rachat.id,
      reference:        rachat.reference,
      adminToken,
      prenomVendeur:    rachat.prenomVendeur,
      nomVendeur:       rachat.nomVendeur,
      emailVendeur:     rachat.emailVendeur,
      telVendeur:       rachat.telVendeur,
      adresseVendeur:   rachat.adresseVendeur,
      villeVendeur:     rachat.villeVendeur,
      codePostalVendeur: rachat.codePostalVendeur,
      typeEchappement:  rachat.typeEchappement,
      etatEchappement:  rachat.etatEchappement,
      description:      rachat.description,
      marque:           rachat.marque,
      modele:           rachat.modele,
      annee:            rachat.annee,
      kilometrage:      rachat.kilometrage,
      poidsKg:          rachat.poidsKg,
      prixOfficiel:     rachat.prixOfficiel,
      signatureVendeur:   rachat.signatureVendeur,
      signatureVendeurAt: rachat.signatureVendeurAt,
      signatureVendeurIp: rachat.signatureVendeurIp,
      signatureVendeurUa: rachat.signatureVendeurUa,
      photos:             rachat.photos,
      identiteToken:      rachat.identiteToken,
    };

    Promise.all([
      sendAdminDossierEmail(emailData).catch((e) =>
        console.error("[RACHAT_POST] Admin email error:", e)
      ),
      sendClientConfirmationEmail(emailData).catch((e) =>
        console.error("[RACHAT_POST] Client email error:", e)
      ),
    ]);

    return NextResponse.json(
      {
        id:           rachat.id,
        reference:    rachat.reference,
        prixOfficiel: rachat.prixOfficiel ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[RACHAT_POST]", error);
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la création de la demande de rachat.",
      },
      { status: 500 }
    );
  }
}
