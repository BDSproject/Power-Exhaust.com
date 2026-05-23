/**
 * API — Télécharger PDF attestation (admin)
 * GET /api/admin/attestations/[attestationId]/pdf
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ attestationId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { attestationId } = await params;

    const attestation = await prisma.attestation.findUnique({
      where: { id: attestationId },
      select: {
        pdfUrl: true,
        numero: true,
      },
    });

    if (!attestation) {
      return NextResponse.json({ message: "Attestation non trouvée" }, { status: 404 });
    }

    if (!attestation.pdfUrl) {
      return NextResponse.json(
        { message: "PDF non généré" },
        { status: 404 }
      );
    }

    // Récupérer le PDF depuis Vercel Blob
    const pdfResponse = await fetch(attestation.pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error("Erreur téléchargement PDF");
    }

    const buffer = await pdfResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Attestation_${attestation.numero}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[ADMIN_ATTESTATION_PDF_GET]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
