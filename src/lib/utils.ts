import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMMM yyyy", { locale: fr });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy à HH:mm", { locale: fr });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function generateNumeroAttestation(): string {
  const date = format(new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ATT-${date}-${random}`;
}

export function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    EN_ATTENTE:    "En attente",
    VALIDE:        "Validé — Bordereau envoyé",
    EN_COURS:      "En cours d'analyse",
    OFFRE_ENVOYEE: "Offre envoyée",
    ACCEPTE:       "Accepté",
    EN_EXPEDITION: "En expédition",
    RECU:          "Colis reçu",
    PAYE:          "Payé ✅",
    NON_PAYE:      "Non payé ⚠️",
    LITIGE:        "Litige ⚖️",
    REFUSE:        "Refusé",
    COMPLETE:      "Complété",
  };
  return labels[statut] ?? statut;
}

export function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    EN_ATTENTE:    "text-white bg-amber-500 border-amber-500",
    VALIDE:        "text-white bg-blue-600 border-blue-600",
    EN_COURS:      "text-white bg-violet-600 border-violet-600",
    OFFRE_ENVOYEE: "text-white bg-orange-500 border-orange-500",
    ACCEPTE:       "text-white bg-sky-600 border-sky-600",
    EN_EXPEDITION: "text-white bg-indigo-600 border-indigo-600",
    RECU:          "text-white bg-cyan-600 border-cyan-600",
    PAYE:          "text-white bg-green-600 border-green-600",
    NON_PAYE:      "text-white bg-rose-600 border-rose-600",
    LITIGE:        "text-black bg-yellow-400 border-yellow-400",
    REFUSE:        "text-white bg-red-600 border-red-600",
    COMPLETE:      "text-white bg-gray-700 border-gray-700",
  };
  return colors[statut] ?? "text-white bg-gray-700";
}

export function getEtatLabel(etat: string): string {
  const labels: Record<string, string> = {
    EXCELLENT: "Excellent",
    BON: "Bon état",
    MOYEN: "État moyen",
    MAUVAIS: "Mauvais état",
  };
  return labels[etat] ?? etat;
}
