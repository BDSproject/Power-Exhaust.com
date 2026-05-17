export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/chat/[id] — récupérer les messages d'une conversation
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const conv = await prisma.chatConversation.findUnique({ where: { id } });
  if (!conv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ conversation: conv, messages });
}

// POST /api/chat/[id] — envoyer un message dans une conversation existante
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { message, auteur } = await req.json();
  if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 });

  // Seul un admin peut répondre en tant qu'ADMIN
  if (auteur === "ADMIN") {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  const src = auteur === "ADMIN" ? "ADMIN" : "CLIENT";

  await prisma.chatMessage.create({
    data: { conversationId: id, auteur: src, contenu: message },
  });

  await prisma.chatConversation.update({
    where: { id },
    data: { statut: src === "ADMIN" ? "REPONDU" : "EN_ATTENTE" },
  });

  return NextResponse.json({ ok: true });
}
