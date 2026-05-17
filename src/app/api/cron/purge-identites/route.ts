/**
 * CRON — Purge automatique des pièces d'identité
 * GET /api/cron/purge-identites
 *
 * Conformité RGPD : suppression des fichiers chiffrés après 30 jours
 * Les métadonnées légales (nom, prénom, type de pièce, numéro) sont conservées
 * en base pour le registre R321-3 CSI, mais les fichiers biométriques sont purgés.
 *
 * Appel via cron externe (Vercel Cron, GitHub Actions, etc.) avec CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { deleteEncryptedFile } from "@/lib/crypto-file";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vérification du secret CRON
  const secret = req.headers.get("x-cron-secret") ??
    req.nextUrl.searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Trouver tous les documents dont la date de purge est dépassée
    const docsToPurge = await prisma.identiteDocument.findMany({
      where: {
        purgee: false,
        purgeAt: { lte: now },
      },
      select: {
        id: true,
        fichierRectoUuid: true,
        fichierVersoUuid: true,
      },
    });

    let purged = 0;
    let errors = 0;

    for (const doc of docsToPurge) {
      try {
        // Suppression des fichiers chiffrés
        if (doc.fichierRectoUuid) await deleteEncryptedFile(doc.fichierRectoUuid);
        if (doc.fichierVersoUuid) await deleteEncryptedFile(doc.fichierVersoUuid);

        // Marquer comme purgé en base (les métadonnées légales restent)
        await prisma.identiteDocument.update({
          where: { id: doc.id },
          data: {
            purgee: true,
            purgeeAt: now,
            // Effacement des métadonnées de chiffrement (plus nécessaires)
            fichierRectoUuid: null,
            fichierVersoUuid: null,
            fichierRectoIv: null,
            fichierRectoTag: null,
            fichierVersoIv: null,
            fichierVersoTag: null,
          },
        });

        purged++;
      } catch (err) {
        console.error(`[PURGE] Erreur sur document ${doc.id}:`, err);
        errors++;
      }
    }

    console.log(`[PURGE] ${purged} document(s) purgé(s), ${errors} erreur(s). Date: ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      purged,
      errors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[PURGE_CRON]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
