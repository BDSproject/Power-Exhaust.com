export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET — Lister tous les prix avec marques et modèles
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }

    const brands = await prisma.exhaustBrand.findMany({
      include: {
        models: {
          include: {
            prices: { orderBy: { etat: "asc" } },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("[ADMIN_CATALOGUE_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Actions catalogue
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ─── Créer une marque ───────────────────────────────────────────────────
    if (action === "create_brand") {
      const { name, slug, logoEmoji, origine } = body;
      const brand = await prisma.exhaustBrand.create({
        data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), logoEmoji, origine },
      });
      return NextResponse.json(brand, { status: 201 });
    }

    // ─── Supprimer une marque (cascade) ─────────────────────────────────────
    if (action === "delete_brand") {
      const { brandId } = body;
      // Supprimer les prix → modèles → marque
      const models = await prisma.exhaustModel.findMany({ where: { brandId } });
      for (const m of models) {
        await prisma.exhaustPrice.deleteMany({ where: { modelId: m.id } });
      }
      await prisma.exhaustModel.deleteMany({ where: { brandId } });
      await prisma.exhaustBrand.delete({ where: { id: brandId } });
      return NextResponse.json({ ok: true });
    }

    // ─── Modifier une marque ────────────────────────────────────────────────
    if (action === "update_brand") {
      const { brandId, name, logoEmoji, origine } = body;
      const brand = await prisma.exhaustBrand.update({
        where: { id: brandId },
        data: { name, logoEmoji, origine },
      });
      return NextResponse.json(brand);
    }

    // ─── Créer un modèle ────────────────────────────────────────────────────
    if (action === "create_model") {
      const { brandId, name, slug, type, description, anneeDebut, anneeFin } = body;
      const model = await prisma.exhaustModel.create({
        data: {
          brandId,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
          type,
          description,
          anneeDebut: anneeDebut ? parseInt(anneeDebut) : null,
          anneeFin: anneeFin ? parseInt(anneeFin) : null,
        },
      });
      // Créer des entrées de prix à 0 pour chaque état
      await Promise.all(
        (["EXCELLENT", "BON", "MOYEN", "MAUVAIS"] as const).map((etat) =>
          prisma.exhaustPrice.create({
            data: { modelId: model.id, etat, prix: 0 },
          })
        )
      );
      return NextResponse.json(model, { status: 201 });
    }

    // ─── Modifier un modèle ─────────────────────────────────────────────────
    if (action === "update_model") {
      const { modelId, name, type, description, anneeDebut, anneeFin, isActive } = body;
      const model = await prisma.exhaustModel.update({
        where: { id: modelId },
        data: {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(description !== undefined && { description }),
          ...(anneeDebut !== undefined && { anneeDebut: anneeDebut ? parseInt(anneeDebut) : null }),
          ...(anneeFin !== undefined && { anneeFin: anneeFin ? parseInt(anneeFin) : null }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      return NextResponse.json(model);
    }

    // ─── Supprimer un modèle ────────────────────────────────────────────────
    if (action === "delete_model") {
      const { modelId } = body;
      await prisma.exhaustPrice.deleteMany({ where: { modelId } });
      await prisma.exhaustModel.delete({ where: { id: modelId } });
      return NextResponse.json({ ok: true });
    }

    // ─── Modifier un prix ───────────────────────────────────────────────────
    if (action === "update_price") {
      const { priceId, prix } = body;
      const price = await prisma.exhaustPrice.update({
        where: { id: priceId },
        data: { prix: parseFloat(prix) },
      });
      return NextResponse.json(price);
    }

    // ─── Activer/désactiver une marque ──────────────────────────────────────
    if (action === "toggle_brand") {
      const { brandId, isActive } = body;
      const brand = await prisma.exhaustBrand.update({
        where: { id: brandId },
        data: { isActive },
      });
      return NextResponse.json(brand);
    }

    // ─── Activer/désactiver un modèle ───────────────────────────────────────
    if (action === "toggle_model") {
      const { modelId, isActive } = body;
      const model = await prisma.exhaustModel.update({
        where: { id: modelId },
        data: { isActive },
      });
      return NextResponse.json(model);
    }

    // ─── Import CSV (bulk upsert) ───────────────────────────────────────────
    // Format attendu: [{ marque, modele, type, anneeDebut, anneeFin, prixExcellent, prixBon, prixMoyen, prixMauvais }]
    if (action === "import_csv") {
      const { rows } = body as {
        rows: Array<{
          marque: string;
          modele: string;
          type?: string;
          anneeDebut?: string;
          anneeFin?: string;
          prixExcellent?: string;
          prixBon?: string;
          prixMoyen?: string;
          prixMauvais?: string;
        }>;
      };

      let created = 0;
      let updated = 0;

      for (const row of rows) {
        if (!row.marque || !row.modele) continue;

        // Upsert marque
        let brand = await prisma.exhaustBrand.findFirst({
          where: { name: { equals: row.marque } },
        });
        if (!brand) {
          brand = await prisma.exhaustBrand.create({
            data: {
              name: row.marque,
              slug: row.marque.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            },
          });
        }

        // Upsert modèle
        const slug = `${row.modele}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        let model = await prisma.exhaustModel.findFirst({
          where: { brandId: brand.id, name: { equals: row.modele } },
          include: { prices: true },
        });

        if (!model) {
          model = await prisma.exhaustModel.create({
            data: {
              brandId: brand.id,
              name: row.modele,
              slug,
              type: row.type || "slip-on",
              anneeDebut: row.anneeDebut ? parseInt(row.anneeDebut) : null,
              anneeFin: row.anneeFin ? parseInt(row.anneeFin) : null,
            },
            include: { prices: true },
          });
          // Créer les 4 prix à 0
          await Promise.all(
            (["EXCELLENT", "BON", "MOYEN", "MAUVAIS"] as const).map((etat) =>
              prisma.exhaustPrice.create({ data: { modelId: model!.id, etat, prix: 0 } })
            )
          );
          // Recharger avec les prix
          model = await prisma.exhaustModel.findUnique({
            where: { id: model.id },
            include: { prices: true },
          }) as typeof model;
          created++;
        } else {
          // Mettre à jour les années si fournies
          await prisma.exhaustModel.update({
            where: { id: model.id },
            data: {
              ...(row.anneeDebut && { anneeDebut: parseInt(row.anneeDebut) }),
              ...(row.anneeFin && { anneeFin: parseInt(row.anneeFin) }),
              ...(row.type && { type: row.type }),
            },
          });
          updated++;
        }

        // Mettre à jour les prix
        const priceMap: Record<string, number> = {
          EXCELLENT: parseFloat(row.prixExcellent || "0"),
          BON: parseFloat(row.prixBon || "0"),
          MOYEN: parseFloat(row.prixMoyen || "0"),
          MAUVAIS: parseFloat(row.prixMauvais || "0"),
        };
        if (model) {
          for (const p of model.prices) {
            if (priceMap[p.etat] !== undefined && !isNaN(priceMap[p.etat])) {
              await prisma.exhaustPrice.update({
                where: { id: p.id },
                data: { prix: priceMap[p.etat] },
              });
            }
          }
        }
      }

      return NextResponse.json({ ok: true, created, updated });
    }

    return NextResponse.json({ message: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_CATALOGUE_POST]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Supprimer via query param
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get("modelId");
    const brandId = searchParams.get("brandId");

    if (modelId) {
      await prisma.exhaustPrice.deleteMany({ where: { modelId } });
      await prisma.exhaustModel.delete({ where: { id: modelId } });
      return NextResponse.json({ ok: true });
    }
    if (brandId) {
      const models = await prisma.exhaustModel.findMany({ where: { brandId } });
      for (const m of models) {
        await prisma.exhaustPrice.deleteMany({ where: { modelId: m.id } });
      }
      await prisma.exhaustModel.deleteMany({ where: { brandId } });
      await prisma.exhaustBrand.delete({ where: { id: brandId } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ message: "Paramètre manquant" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_CATALOGUE_DELETE]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
