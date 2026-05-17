import { PrismaLibSql } from "@prisma/adapter-libsql";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

// ─── Catalogue complet des marques & modèles ─────────────────────────────────
const CATALOGUE = [
  {
    name: "Akrapovic",
    slug: "akrapovic",
    logoEmoji: "�🇮",
    origine: "Slovénie",
    models: [
      {
        name: "Racing Line Titane Full System",
        slug: "racing-line-titane-full",
        type: "ligne-complete",
        description: "Ligne complète titane haute performance",
        prices: { EXCELLENT: 680, BON: 480, MOYEN: 280, MAUVAIS: 100 },
      },
      {
        name: "Slip-on Line Titane",
        slug: "slip-on-titane",
        type: "slip-on",
        description: "Silencieux slip-on en titane",
        prices: { EXCELLENT: 390, BON: 270, MOYEN: 160, MAUVAIS: 60 },
      },
      {
        name: "Slip-on Line Carbone",
        slug: "slip-on-carbone",
        type: "slip-on",
        description: "Silencieux slip-on en carbone",
        prices: { EXCELLENT: 420, BON: 290, MOYEN: 170, MAUVAIS: 65 },
      },
      {
        name: "Evolution Line Full System",
        slug: "evolution-line-full",
        type: "ligne-complete",
        description: "Ligne complète Evolution avec collecteurs",
        prices: { EXCELLENT: 850, BON: 620, MOYEN: 380, MAUVAIS: 140 },
      },
      {
        name: "Optional Link Pipe",
        slug: "optional-link-pipe",
        type: "collecteur",
        description: "Raccord intermédiaire Akrapovic",
        prices: { EXCELLENT: 180, BON: 120, MOYEN: 70, MAUVAIS: 25 },
      },
    ],
  },
  {
    name: "Yoshimura",
    slug: "yoshimura",
    logoEmoji: "🇯🇵",
    origine: "Japon",
    models: [
      {
        name: "RS-12 Titane",
        slug: "rs-12-titane",
        type: "slip-on",
        description: "Silencieux RS-12 en titane, son caractéristique Yoshimura",
        prices: { EXCELLENT: 320, BON: 220, MOYEN: 130, MAUVAIS: 50 },
      },
      {
        name: "RS-12 Inox",
        slug: "rs-12-inox",
        type: "slip-on",
        description: "Silencieux RS-12 en inox",
        prices: { EXCELLENT: 220, BON: 150, MOYEN: 85, MAUVAIS: 30 },
      },
      {
        name: "Alpha T Full System",
        slug: "alpha-t-full",
        type: "ligne-complete",
        description: "Ligne complète Alpha T titane",
        prices: { EXCELLENT: 580, BON: 400, MOYEN: 240, MAUVAIS: 90 },
      },
      {
        name: "R-77 Carbone",
        slug: "r-77-carbone",
        type: "slip-on",
        description: "Silencieux R-77 carbone",
        prices: { EXCELLENT: 360, BON: 250, MOYEN: 150, MAUVAIS: 55 },
      },
      {
        name: "Tri-Oval Full System",
        slug: "tri-oval-full",
        type: "ligne-complete",
        description: "Ligne complète Tri-Oval signature Yoshimura",
        prices: { EXCELLENT: 620, BON: 440, MOYEN: 260, MAUVAIS: 95 },
      },
    ],
  },
  {
    name: "Arrow",
    slug: "arrow",
    logoEmoji: "�🇹",
    origine: "Italie",
    models: [
      {
        name: "Race-Tech Titane",
        slug: "race-tech-titane",
        type: "slip-on",
        description: "Silencieux Race-Tech en titane",
        prices: { EXCELLENT: 310, BON: 210, MOYEN: 125, MAUVAIS: 45 },
      },
      {
        name: "Race-Tech Carbone",
        slug: "race-tech-carbone",
        type: "slip-on",
        description: "Silencieux Race-Tech en carbone",
        prices: { EXCELLENT: 340, BON: 235, MOYEN: 140, MAUVAIS: 52 },
      },
      {
        name: "Maxi-Race Full System",
        slug: "maxi-race-full",
        type: "ligne-complete",
        description: "Ligne complète Maxi-Race",
        prices: { EXCELLENT: 560, BON: 390, MOYEN: 230, MAUVAIS: 85 },
      },
      {
        name: "Street Thunder Inox",
        slug: "street-thunder-inox",
        type: "slip-on",
        description: "Silencieux Street Thunder en inox",
        prices: { EXCELLENT: 195, BON: 135, MOYEN: 80, MAUVAIS: 28 },
      },
      {
        name: "Pro-Race Full System",
        slug: "pro-race-full",
        type: "ligne-complete",
        description: "Ligne complète Pro-Race compétition",
        prices: { EXCELLENT: 720, BON: 510, MOYEN: 300, MAUVAIS: 110 },
      },
    ],
  },
  {
    name: "Leovince",
    slug: "leovince",
    logoEmoji: "🇮🇹",
    origine: "Italie",
    models: [
      {
        name: "LV ONE EVO Carbone",
        slug: "lv-one-evo-carbone",
        type: "slip-on",
        description: "Silencieux LV ONE EVO en carbone",
        prices: { EXCELLENT: 280, BON: 195, MOYEN: 115, MAUVAIS: 42 },
      },
      {
        name: "GP Corsa Carbone",
        slug: "gp-corsa-carbone",
        type: "slip-on",
        description: "Silencieux GP Corsa carbone haute performance",
        prices: { EXCELLENT: 330, BON: 230, MOYEN: 135, MAUVAIS: 50 },
      },
      {
        name: "Factory S Full System",
        slug: "factory-s-full",
        type: "ligne-complete",
        description: "Ligne complète Factory S Leovince",
        prices: { EXCELLENT: 520, BON: 360, MOYEN: 215, MAUVAIS: 78 },
      },
      {
        name: "SBK Black Edition",
        slug: "sbk-black-edition",
        type: "slip-on",
        description: "Édition spéciale SBK noir mat",
        prices: { EXCELLENT: 295, BON: 205, MOYEN: 120, MAUVAIS: 44 },
      },
      {
        name: "Nero Inox",
        slug: "nero-inox",
        type: "slip-on",
        description: "Silencieux Nero en inox finition noire",
        prices: { EXCELLENT: 185, BON: 128, MOYEN: 75, MAUVAIS: 27 },
      },
    ],
  },
  {
    name: "Termignoni",
    slug: "termignoni",
    logoEmoji: "🇮🇹",
    origine: "Italie",
    models: [
      {
        name: "Relevance Slip-on Carbone",
        slug: "relevance-slip-on-carbone",
        type: "slip-on",
        description: "Silencieux Relevance carbone",
        prices: { EXCELLENT: 420, BON: 295, MOYEN: 175, MAUVAIS: 65 },
      },
      {
        name: "Relevance Full System",
        slug: "relevance-full",
        type: "ligne-complete",
        description: "Ligne complète Relevance Termignoni",
        prices: { EXCELLENT: 780, BON: 550, MOYEN: 330, MAUVAIS: 120 },
      },
      {
        name: "Conical Titane",
        slug: "conical-titane",
        type: "slip-on",
        description: "Silencieux conique en titane",
        prices: { EXCELLENT: 460, BON: 320, MOYEN: 190, MAUVAIS: 72 },
      },
      {
        name: "Oval Carbone",
        slug: "oval-carbone",
        type: "slip-on",
        description: "Silencieux oval carbone",
        prices: { EXCELLENT: 440, BON: 308, MOYEN: 182, MAUVAIS: 68 },
      },
    ],
  },
  {
    name: "SC-Project",
    slug: "sc-project",
    logoEmoji: "🇮🇹",
    origine: "Italie",
    models: [
      {
        name: "CR-T Carbone",
        slug: "cr-t-carbone",
        type: "slip-on",
        description: "Silencieux CR-T carbone conique",
        prices: { EXCELLENT: 450, BON: 315, MOYEN: 188, MAUVAIS: 70 },
      },
      {
        name: "S1 Full System",
        slug: "s1-full",
        type: "ligne-complete",
        description: "Ligne complète S1 SC-Project",
        prices: { EXCELLENT: 820, BON: 580, MOYEN: 345, MAUVAIS: 125 },
      },
      {
        name: "Oval Carbone",
        slug: "oval-carbone",
        type: "slip-on",
        description: "Silencieux oval en carbone",
        prices: { EXCELLENT: 395, BON: 275, MOYEN: 165, MAUVAIS: 60 },
      },
      {
        name: "M3 Titane",
        slug: "m3-titane",
        type: "slip-on",
        description: "Silencieux M3 titane double sortie",
        prices: { EXCELLENT: 520, BON: 365, MOYEN: 218, MAUVAIS: 82 },
      },
    ],
  },
  {
    name: "Mivv",
    slug: "mivv",
    logoEmoji: "�🇹",
    origine: "Italie",
    models: [
      {
        name: "Suono Inox",
        slug: "suono-inox",
        type: "slip-on",
        description: "Silencieux Suono inox au son exceptionnel",
        prices: { EXCELLENT: 210, BON: 148, MOYEN: 88, MAUVAIS: 32 },
      },
      {
        name: "GP Pro Titane",
        slug: "gp-pro-titane",
        type: "slip-on",
        description: "Silencieux GP Pro en titane",
        prices: { EXCELLENT: 340, BON: 238, MOYEN: 142, MAUVAIS: 52 },
      },
      {
        name: "Delta Race Full System",
        slug: "delta-race-full",
        type: "ligne-complete",
        description: "Ligne complète Delta Race Mivv",
        prices: { EXCELLENT: 580, BON: 405, MOYEN: 242, MAUVAIS: 88 },
      },
      {
        name: "Sound Carbone",
        slug: "sound-carbone",
        type: "slip-on",
        description: "Silencieux Sound en carbone",
        prices: { EXCELLENT: 310, BON: 218, MOYEN: 130, MAUVAIS: 48 },
      },
    ],
  },
  {
    name: "Austin Racing",
    slug: "austin-racing",
    logoEmoji: "�🇧",
    origine: "Royaume-Uni",
    models: [
      {
        name: "GP1R Full System Titane",
        slug: "gp1r-full-titane",
        type: "ligne-complete",
        description: "Ligne complète GP1R titane compétition",
        prices: { EXCELLENT: 950, BON: 665, MOYEN: 398, MAUVAIS: 145 },
      },
      {
        name: "Daytona Slip-on",
        slug: "daytona-slip-on",
        type: "slip-on",
        description: "Silencieux Daytona Austin Racing",
        prices: { EXCELLENT: 480, BON: 336, MOYEN: 202, MAUVAIS: 75 },
      },
    ],
  },
  {
    name: "Remus",
    slug: "remus",
    logoEmoji: "🇦🇹",
    origine: "Autriche",
    models: [
      {
        name: "Hexacone Inox",
        slug: "hexacone-inox",
        type: "slip-on",
        description: "Silencieux hexagonal en inox",
        prices: { EXCELLENT: 195, BON: 136, MOYEN: 82, MAUVAIS: 30 },
      },
      {
        name: "Sport Race Titane",
        slug: "sport-race-titane",
        type: "slip-on",
        description: "Silencieux Sport Race en titane",
        prices: { EXCELLENT: 285, BON: 200, MOYEN: 120, MAUVAIS: 44 },
      },
      {
        name: "Custom Cone Full System",
        slug: "custom-cone-full",
        type: "ligne-complete",
        description: "Ligne complète Custom Cone Remus",
        prices: { EXCELLENT: 520, BON: 364, MOYEN: 218, MAUVAIS: 80 },
      },
    ],
  },
  {
    name: "GPR",
    slug: "gpr",
    logoEmoji: "�🇹",
    origine: "Italie",
    models: [
      {
        name: "Vintacone Inox",
        slug: "vintacone-inox",
        type: "slip-on",
        description: "Silencieux vintage conique en inox",
        prices: { EXCELLENT: 175, BON: 122, MOYEN: 73, MAUVAIS: 26 },
      },
      {
        name: "Furore Carbone",
        slug: "furore-carbone",
        type: "slip-on",
        description: "Silencieux Furore en carbone",
        prices: { EXCELLENT: 265, BON: 186, MOYEN: 111, MAUVAIS: 40 },
      },
      {
        name: "GP Evo Full System",
        slug: "gp-evo-full",
        type: "ligne-complete",
        description: "Ligne complète GP Evo homologuée",
        prices: { EXCELLENT: 480, BON: 336, MOYEN: 202, MAUVAIS: 74 },
      },
      {
        name: "Albus Ceramic",
        slug: "albus-ceramic",
        type: "slip-on",
        description: "Silencieux Albus finition céramique blanche",
        prices: { EXCELLENT: 245, BON: 172, MOYEN: 103, MAUVAIS: 37 },
      },
    ],
  },
  {
    name: "FMF Racing",
    slug: "fmf",
    logoEmoji: "�🇸",
    origine: "États-Unis",
    models: [
      {
        name: "Power Core 4 SA",
        slug: "power-core-4-sa",
        type: "slip-on",
        description: "Silencieux 4 temps SA (avec spark arrestor)",
        prices: { EXCELLENT: 185, BON: 130, MOYEN: 78, MAUVAIS: 28 },
      },
      {
        name: "Q4 SA Quiet",
        slug: "q4-sa-quiet",
        type: "slip-on",
        description: "Silencieux Q4 homologué bruit maîtrisé",
        prices: { EXCELLENT: 195, BON: 136, MOYEN: 82, MAUVAIS: 30 },
      },
      {
        name: "Megabomb Full System",
        slug: "megabomb-full",
        type: "ligne-complete",
        description: "Ligne complète Megabomb pour cross/enduro",
        prices: { EXCELLENT: 380, BON: 265, MOYEN: 160, MAUVAIS: 58 },
      },
    ],
  },
  {
    name: "Two Brothers Racing",
    slug: "two-brothers",
    logoEmoji: "🇺🇸",
    origine: "États-Unis",
    models: [
      {
        name: "M2 Black Series",
        slug: "m2-black",
        type: "slip-on",
        description: "Silencieux M2 Black Series carbone",
        prices: { EXCELLENT: 310, BON: 217, MOYEN: 130, MAUVAIS: 48 },
      },
      {
        name: "S1R Full System",
        slug: "s1r-full",
        type: "ligne-complete",
        description: "Ligne complète S1R Two Brothers",
        prices: { EXCELLENT: 550, BON: 385, MOYEN: 230, MAUVAIS: 85 },
      },
    ],
  },
  {
    name: "Vance & Hines",
    slug: "vance-hines",
    logoEmoji: "🇺🇸",
    origine: "États-Unis",
    models: [
      {
        name: "Big Radius 2-into-2",
        slug: "big-radius-2-2",
        type: "ligne-complete",
        description: "Ligne Big Radius spéciale Harley-Davidson",
        prices: { EXCELLENT: 420, BON: 294, MOYEN: 176, MAUVAIS: 65 },
      },
      {
        name: "Pro Pipe 2-into-1",
        slug: "pro-pipe-2-1",
        type: "ligne-complete",
        description: "Ligne Pro Pipe 2-en-1 Harley",
        prices: { EXCELLENT: 380, BON: 265, MOYEN: 160, MAUVAIS: 58 },
      },
      {
        name: "Short Shots",
        slug: "short-shots",
        type: "slip-on",
        description: "Silencieux Short Shots courts Harley",
        prices: { EXCELLENT: 285, BON: 200, MOYEN: 120, MAUVAIS: 44 },
      },
    ],
  },
  {
    name: "HGS",
    slug: "hgs",
    logoEmoji: "🇩🇪",
    origine: "Allemagne",
    models: [
      {
        name: "Full System Carbone Enduro",
        slug: "full-system-carbone",
        type: "ligne-complete",
        description: "Ligne complète carbone enduro/cross",
        prices: { EXCELLENT: 420, BON: 294, MOYEN: 176, MAUVAIS: 65 },
      },
      {
        name: "Silencieux Carbone",
        slug: "silencieux-carbone",
        type: "slip-on",
        description: "Silencieux carbone HGS",
        prices: { EXCELLENT: 220, BON: 154, MOYEN: 92, MAUVAIS: 34 },
      },
    ],
  },
  {
    name: "Dominator",
    slug: "dominator",
    logoEmoji: "🇮🇹",
    origine: "Italie",
    models: [
      {
        name: "Round Carbone Slip-on",
        slug: "round-carbone",
        type: "slip-on",
        description: "Silencieux rond carbone Dominator",
        prices: { EXCELLENT: 255, BON: 178, MOYEN: 107, MAUVAIS: 39 },
      },
      {
        name: "HP3 Inox Full System",
        slug: "hp3-full",
        type: "ligne-complete",
        description: "Ligne complète HP3 Dominator inox",
        prices: { EXCELLENT: 460, BON: 322, MOYEN: 193, MAUVAIS: 70 },
      },
    ],
  },
  {
    name: "Ligne d'Origine (OEM)",
    slug: "oem",
    logoEmoji: "�",
    origine: "Divers",
    models: [
      {
        name: "Ligne d'origine complète",
        slug: "oem-full",
        type: "ligne-complete",
        description: "Ligne d'échappement d'origine constructeur complète",
        prices: { EXCELLENT: 180, BON: 120, MOYEN: 65, MAUVAIS: 20 },
      },
      {
        name: "Silencieux d'origine",
        slug: "oem-silencieux",
        type: "slip-on",
        description: "Silencieux d'origine constructeur",
        prices: { EXCELLENT: 95, BON: 65, MOYEN: 35, MAUVAIS: 10 },
      },
      {
        name: "Collecteur d'origine",
        slug: "oem-collecteur",
        type: "collecteur",
        description: "Collecteur d'origine constructeur",
        prices: { EXCELLENT: 75, BON: 50, MOYEN: 28, MAUVAIS: 8 },
      },
    ],
  },
];

async function main() {
  console.log("🌱 Démarrage du seed Power Exhaust...");

  // ─── Admin ─────────────────────────────────
  const adminEmail = "admin@power-exhaust.com";
  const adminPassword = "Admin2024!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: "Administrateur Power Exhaust",
        role: "ADMIN",
      },
    });
    console.log("✅ Compte admin créé :", admin.email);
    console.log("🔑 Mot de passe :", adminPassword);
  } else {
    console.log("✅ Admin déjà existant :", adminEmail);
  }

  // ─── Catalogue Échappements ─────────────────
  
  console.log("\n📦 Création du catalogue d'échappements...");

  for (const brandData of CATALOGUE) {
    const brand = await prisma.exhaustBrand.upsert({
      where: { slug: brandData.slug },
      update: {
        name: brandData.name,
        logoEmoji: brandData.logoEmoji,
        origine: brandData.origine,
      },
      create: {
        name: brandData.name,
        slug: brandData.slug,
        logoEmoji: brandData.logoEmoji,
        origine: brandData.origine,
      },
    });

    for (const modelData of brandData.models) {
      const model = await prisma.exhaustModel.upsert({
        where: { brandId_slug: { brandId: brand.id, slug: modelData.slug } },
        update: {
          name: modelData.name,
          type: modelData.type,
          description: modelData.description,
        },
        create: {
          brandId: brand.id,
          name: modelData.name,
          slug: modelData.slug,
          type: modelData.type,
          description: modelData.description,
        },
      });

      for (const [etat, prix] of Object.entries(modelData.prices)) {
        await prisma.exhaustPrice.upsert({
          where: {
            modelId_etat: {
              modelId: model.id,
              etat: etat as "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS",
            },
          },
          update: { prix },
          create: {
            modelId: model.id,
            etat: etat as "EXCELLENT" | "BON" | "MAUVAIS" | "MOYEN",
            prix,
          },
        });
      }

      console.log(`   ✓ ${brand.name} - ${model.name}`);
    }
  }

  console.log("\n✅ Seed terminé avec succès !");
  console.log(`📊 ${CATALOGUE.length} marques et ${CATALOGUE.reduce((acc, b) => acc + b.models.length, 0)} modèles créés`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
