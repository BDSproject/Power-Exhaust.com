export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/chat — liste toutes les conversations (admin)
export async function GET() {
  try {
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { contenu: true } },
      },
    });
    return NextResponse.json({ conversations });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/chat — créer une conversation + premier message
export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, message } = await req.json();
    if (!nom || !prenom || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const conv = await prisma.chatConversation.create({
      data: {
        nom,
        prenom,
        email,
        messages: { create: { auteur: "CLIENT", contenu: message } },
      },
    });

    return NextResponse.json({ conversationId: conv.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
