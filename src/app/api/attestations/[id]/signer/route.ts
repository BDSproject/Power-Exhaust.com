export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// PATCH — Signer une attestation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { role, signature } = await req.json();

    if (!["vendeur", "acheteur"].includes(role) || !signature) {
      return NextResponse.json({ message: "Données invalides" }, { status: 400 });
    }

    // Seul l'admin peut signer en tant qu'acheteur
    if (role === "acheteur" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: { rachat: true },
    });

    if (!attestation) {
      return NextResponse.json({ message: "Attestation introuvable" }, { status: 404 });
    }

    // Vérifier que le vendeur signe sa propre attestation
    if (role === "vendeur" && attestation.rachat.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    // Mettre à jour la signature
    const updateData =
      role === "vendeur"
        ? { signatureVendeur: signature, signatureVendeurAt: new Date() }
        : { signatureAcheteur: signature, signatureAcheteurAt: new Date() };

    const updated = await prisma.attestation.update({
      where: { id },
      data: updateData,
    });

    // Vérifier si l'attestation est complète (les deux signatures présentes)
    const isComplete =
      (role === "vendeur" ? true : !!attestation.signatureVendeur) &&
      (role === "acheteur" ? true : !!attestation.signatureAcheteur);

    if (isComplete) {
      await prisma.attestation.update({
        where: { id },
        data: { estComplete: true },
      });

      await prisma.rachat.update({
        where: { id: attestation.rachatId },
        data: { statut: "COMPLETE" },
      });
    }

    return NextResponse.json({ success: true, attestation: updated });
  } catch (error) {
    console.error("[SIGNER_PATCH]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
