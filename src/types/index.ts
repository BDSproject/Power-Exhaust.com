export type Role = "ADMIN" | "CLIENT";

export type StatutRachat =
  | "EN_ATTENTE"
  | "EN_COURS"
  | "OFFRE_ENVOYEE"
  | "ACCEPTE"
  | "REFUSE"
  | "COMPLETE";

export type EtatEchappement = "EXCELLENT" | "BON" | "MOYEN" | "MAUVAIS";

export interface UserType {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

export interface RachatType {
  id: string;
  reference: string;
  statut: StatutRachat;
  userId: string | null;
  user?: UserType;
  marque: string;
  modele: string;
  annee: number | null;
  immatriculation: string | null;
  kilometrage: number | null;
  typeEchappement: string | null;
  etatEchappement: EtatEchappement;
  description: string | null;
  photos: string | null;
  prixPropose: number | null;
  prixAccepte: number | null;
  noteAdmin: string | null;
  nomVendeur: string;
  prenomVendeur: string;
  emailVendeur: string;
  telVendeur: string;
  adresseVendeur: string;
  villeVendeur: string;
  codePostalVendeur: string;
  attestation?: AttestationType | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttestationType {
  id: string;
  rachatId: string;
  rachat?: RachatType;
  numero: string;
  dateVente: Date;
  prixFinal: number;
  signatureVendeur: string | null;
  signatureAcheteur: string | null;
  signatureVendeurAt: Date | null;
  signatureAcheteurAt: Date | null;
  pdfUrl: string | null;
  estComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  adminOnly?: boolean;
}
