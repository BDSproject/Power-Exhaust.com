/**
 * API — Lister tous les documents des clients
 * GET /api/admin/documents
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Récupérer toutes les identités avec leurs rachats
    const identites = await prisma.identiteDocument.findMany({
      include: {
        rachat: {
          select: {
            id: true,
            reference: true,
            statut: true,
            marque: true,
            modele: true,
            nomVendeur: true,
            prenomVendeur: true,
            emailVendeur: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Récupérer tous les RIB avec leurs rachats
    const ribs = await prisma.ribDocument.findMany({
      include: {
        rachat: {
          select: {
            id: true,
            reference: true,
            statut: true,
            marque: true,
            modele: true,
            nomVendeur: true,
            prenomVendeur: true,
            emailVendeur: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Récupérer tous les rachats avec photos
    const rachatsAvecPhotos = await prisma.rachat.findMany({
      where: {
        photos: {
          not: null,
        },
      },
      select: {
        id: true,
        reference: true,
        statut: true,
        marque: true,
        modele: true,
        nomVendeur: true,
        prenomVendeur: true,
        emailVendeur: true,
        photos: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transformer en format unifié
    const documents: any[] = [];

    // Documents d'identité
    identites.forEach((identite) => {
      if (identite.fichierRectoUuid) {
        documents.push({
          id: `identite-${identite.id}-recto`,
          type: "identite",
          rachatId: identite.rachat.id,
          rachatRef: identite.rachat.reference,
          rachatStatut: identite.rachat.statut,
          clientName: `${identite.rachat.prenomVendeur} ${identite.rachat.nomVendeur}`,
          clientEmail: identite.rachat.emailVendeur,
          vehicleBrand: identite.rachat.marque,
          vehicleModel: identite.rachat.modele,
          fileName: `identite-recto-${identite.rachat.reference}.${identite.fichierRectoMime?.split("/")[1] || "bin"}`,
          mimeType: identite.fichierRectoMime || "application/octet-stream",
          size: 0, // Taille inconnue pour les fichiers chiffrés
          createdAt: identite.createdAt,
          recto: true,
          verso: false,
          typePiece: identite.typePiece,
        });
      }

      if (identite.fichierVersoUuid) {
        documents.push({
          id: `identite-${identite.id}-verso`,
          type: "identite",
          rachatId: identite.rachat.id,
          rachatRef: identite.rachat.reference,
          rachatStatut: identite.rachat.statut,
          clientName: `${identite.rachat.prenomVendeur} ${identite.rachat.nomVendeur}`,
          clientEmail: identite.rachat.emailVendeur,
          vehicleBrand: identite.rachat.marque,
          vehicleModel: identite.rachat.modele,
          fileName: `identite-verso-${identite.rachat.reference}.${identite.fichierVersoMime?.split("/")[1] || "bin"}`,
          mimeType: identite.fichierVersoMime || "application/octet-stream",
          size: 0,
          createdAt: identite.createdAt,
          recto: false,
          verso: true,
          typePiece: identite.typePiece,
        });
      }
    });

    // RIB
    ribs.forEach((rib) => {
      documents.push({
        id: `rib-${rib.id}`,
        type: "rib",
        rachatId: rib.rachat.id,
        rachatRef: rib.rachat.reference,
        rachatStatut: rib.rachat.statut,
        clientName: `${rib.rachat.prenomVendeur} ${rib.rachat.nomVendeur}`,
        clientEmail: rib.rachat.emailVendeur,
        vehicleBrand: rib.rachat.marque,
        vehicleModel: rib.rachat.modele,
        fileName: `rib-${rib.rachat.reference}.${rib.fichierMime?.split("/")[1] || "bin"}`,
        mimeType: rib.fichierMime || "application/octet-stream",
        size: 0,
        createdAt: rib.createdAt,
      });
    });

    // Photos
    rachatsAvecPhotos.forEach((rachat) => {
      if (rachat.photos) {
        const photosArray = JSON.parse(rachat.photos);
        photosArray.forEach((photo: string | null, index: number) => {
          if (photo) {
            documents.push({
              id: `photo-${rachat.id}-${index}`,
              type: "photo",
              rachatId: rachat.id,
              rachatRef: rachat.reference,
              rachatStatut: rachat.statut,
              clientName: `${rachat.prenomVendeur} ${rachat.nomVendeur}`,
              clientEmail: rachat.emailVendeur,
              vehicleBrand: rachat.marque,
              vehicleModel: rachat.modele,
              fileName: `photo-${rachat.reference}-${index + 1}.jpg`,
              mimeType: "image/jpeg",
              size: 0,
              createdAt: rachat.createdAt,
            });
          }
        });
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[ADMIN_DOCUMENTS_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
