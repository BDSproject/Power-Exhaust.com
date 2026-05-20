import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// ─── Rachat Public (sans authentification) ────
export const rachatPublicSchema = z.object({
  // Ligne d'échappement
  exhaustModelId: z.string().optional(),
  prixOfficiel: z.number().optional(),
  typeEchappement: z.string().optional(),
  marqueEchappement: z.string().optional(),
  modeleEchappement: z.string().optional(),
  etatEchappement: z.enum(["EXCELLENT", "BON", "MOYEN", "MAUVAIS"]),
  description: z.string().optional(),
  prixPropose: z.number().min(0).optional(),

  // Moto
  marque: z.string().min(2, "Marque du véhicule requise"),
  modele: z.string().min(1, "Modèle du véhicule requis"),
  annee: z
    .number()
    .int()
    .min(1980, "Année invalide")
    .max(new Date().getFullYear() + 1, "Année invalide")
    .optional(),
  immatriculation: z.string().optional(),
  kilometrage: z.number().int().min(0).optional(),

  // Vendeur
  nomVendeur: z.string().min(2, "Nom requis"),
  prenomVendeur: z.string().min(2, "Prénom requis"),
  emailVendeur: z.string().email("Email invalide"),
  telVendeur: z.string().optional(),
  adresseVendeur: z.string().min(5, "Adresse requise"),
  villeVendeur: z.string().min(2, "Ville requise"),
  codePostalVendeur: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),

  // Expédition Boxtal
  poidsKg: z.number({ error: "Poids requis" }).min(0.1, "Poids minimum 0.1 kg").max(30, "Poids maximum 30 kg"),
  longueurCm: z.number().int().min(1).max(200).optional(),
  largeurCm: z.number().int().min(1).max(200).optional(),
  hauteurCm: z.number().int().min(1).max(200).optional(),
});

// ─── Rachat ───────────────────────────────────
export const rachatSchema = z.object({
  // Vendeur
  nomVendeur: z.string().min(2, "Nom requis"),
  prenomVendeur: z.string().min(2, "Prénom requis"),
  emailVendeur: z.string().email("Email invalide"),
  telVendeur: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, "Numéro de téléphone invalide"),
  adresseVendeur: z.string().min(5, "Adresse requise"),
  villeVendeur: z.string().min(2, "Ville requise"),
  codePostalVendeur: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),

  // Véhicule
  marque: z.string().min(2, "Marque requise"),
  modele: z.string().min(1, "Modèle requis"),
  annee: z
    .number()
    .int()
    .min(1990, "Année invalide")
    .max(new Date().getFullYear(), "Année invalide"),
  immatriculation: z
    .string()
    .regex(
      /^[A-Z]{2}-\d{3}-[A-Z]{2}$|^\d{2,4}\s?[A-Z]{2,3}\s?\d{2}$/,
      "Format d'immatriculation invalide"
    )
    .or(z.string().min(4, "Immatriculation requise")),
  kilometrage: z
    .number()
    .int()
    .min(0, "Kilométrage invalide")
    .max(2000000, "Kilométrage invalide"),
  typeEchappement: z.string().min(2, "Type d'échappement requis"),
  etatEchappement: z.enum(["EXCELLENT", "BON", "MOYEN", "MAUVAIS"]),
  description: z.string().optional(),
});

export const attestationSchema = z.object({
  rachatId: z.string(),
  prixFinal: z.number().positive("Le prix doit être positif"),
  dateVente: z.string(),
});

// ─── Types inférés ────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RachatFormData = z.infer<typeof rachatSchema>;
export type RachatPublicFormData = z.infer<typeof rachatPublicSchema>;
export type AttestationFormData = z.infer<typeof attestationSchema>;
