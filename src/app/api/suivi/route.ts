export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Statuts dans l'ordre chronologique du workflow
const WORKFLOW_ORDER = [
  "EN_ATTENTE",
  "VALIDE",
  "EN_COURS",
  "OFFRE_ENVOYEE",
  "ACCEPTE",
  "EN_EXPEDITION",
  "RECU",
  "PAYE",
  "COMPLETE",
] as const;

type WorkflowStatut = (typeof WORKFLOW_ORDER)[number];

const STATUT_INFO: Record<
  string,
  { label: string; description: string; icon: string }
> = {
  EN_ATTENTE:    { label: "Demande reçue",         icon: "📥", description: "Votre demande a bien été enregistrée. Notre équipe va l'analyser sous 24h." },
  VALIDE:        { label: "Dossier validé",         icon: "✅", description: "Votre dossier est validé. Vous pouvez nous envoyer votre ligne d'échappement." },
  EN_COURS:      { label: "Analyse en cours",       icon: "🔍", description: "Votre ligne d'échappement est en cours d'analyse par nos experts." },
  OFFRE_ENVOYEE: { label: "Offre envoyée",          icon: "💶", description: "Nous vous avons envoyé une offre de rachat par email. Consultez votre messagerie." },
  ACCEPTE:       { label: "Offre acceptée",         icon: "🤝", description: "Vous avez accepté notre offre. L'attestation de cession est en cours de préparation." },
  EN_EXPEDITION: { label: "En expédition",          icon: "📦", description: "Votre ligne d'échappement est en transit vers nos entrepôts." },
  RECU:          { label: "Colis reçu",             icon: "📬", description: "Nous avons bien reçu votre colis. Le paiement va être traité." },
  PAYE:          { label: "Paiement effectué",      icon: "💳", description: "Le virement a été effectué sur votre compte. Merci pour votre confiance !" },
  NON_PAYE:      { label: "Paiement en attente",    icon: "⏳", description: "Le paiement est en cours de traitement. Contactez-nous si vous avez des questions." },
  LITIGE:        { label: "Litige en cours",         icon: "⚖️", description: "Un litige est en cours. Notre équipe vous contactera rapidement." },
  REFUSE:        { label: "Demande refusée",        icon: "❌", description: "Votre demande n'a pas pu être traitée. Contactez-nous pour plus d'informations." },
  COMPLETE:      { label: "Dossier clôturé",        icon: "🏆", description: "Votre dossier est entièrement clôturé. Merci de votre confiance envers Power Exhaust !" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("ref")?.trim().toUpperCase();

  if (!reference) {
    return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
  }

  // Chercher par référence ou par les 8 premiers caractères de l'ID
  const rachat = await prisma.rachat.findFirst({
    where: {
      OR: [
        { reference: { contains: reference } },
        { id: { startsWith: reference.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      reference: true,
      statut: true,
      marque: true,
      modele: true,
      annee: true,
      typeEchappement: true,
      etatEchappement: true,
      createdAt: true,
      updatedAt: true,
      prenomVendeur: true,
      nomVendeur: true,
      prixAccepte: true,
      prixPropose: true,
      noteAdmin: true,
      attestation: {
        select: {
          id: true,
          numero: true,
          estComplete: true,
        },
      },
    },
  });

  if (!rachat) {
    return NextResponse.json({ error: "Référence introuvable" }, { status: 404 });
  }

  // Calculer la progression dans le workflow
  const currentIndex = WORKFLOW_ORDER.indexOf(rachat.statut as WorkflowStatut);
  const isTerminal = ["REFUSE", "LITIGE", "NON_PAYE"].includes(rachat.statut);

  // Construire la timeline (uniquement les statuts "normaux" du workflow)
  const timeline = WORKFLOW_ORDER.map((s, i) => ({
    statut: s,
    ...STATUT_INFO[s],
    done: currentIndex >= 0 && i <= currentIndex,
    active: s === rachat.statut,
  }));

  return NextResponse.json({
    reference: rachat.reference.substring(0, 8).toUpperCase(),
    statut: rachat.statut,
    statutInfo: STATUT_INFO[rachat.statut] ?? STATUT_INFO["EN_ATTENTE"],
    isTerminal,
    marque: rachat.marque,
    modele: rachat.modele,
    annee: rachat.annee,
    typeEchappement: rachat.typeEchappement,
    prenomVendeur: rachat.prenomVendeur,
    createdAt: rachat.createdAt,
    updatedAt: rachat.updatedAt,
    prixAccepte: rachat.prixAccepte,
    prixPropose: rachat.prixPropose,
    noteAdmin: rachat.noteAdmin,
    attestation: rachat.attestation,
    timeline,
  });
}
