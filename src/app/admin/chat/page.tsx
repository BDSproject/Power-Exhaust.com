"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Send, RefreshCw, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

type Message = { id: string; auteur: "CLIENT" | "ADMIN"; contenu: string; createdAt: string; lu: boolean };
type Conversation = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: "OUVERT" | "EN_ATTENTE" | "REPONDU";
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
};

const STATUT_CONFIG = {
  OUVERT: { label: "Nouveau", color: "bg-blue-500/20 text-blue-400", icon: AlertCircle },
  EN_ATTENTE: { label: "En attente", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  REPONDU: { label: "Répondu", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
};

export default function AdminChatPage() {
  useSession({ required: true });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = async () => {
    const res = await fetch("/api/chat");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations ?? []);
    }
  };

  const fetchMessages = async (id: string) => {
    const res = await fetch(`/api/chat/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(selected.id), 4000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    const text = reply.trim();
    setReply("");
    setSending(true);
    await fetch(`/api/chat/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, auteur: "ADMIN" }),
    });
    await fetchMessages(selected.id);
    await fetchConversations();
    setSending(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-black/80 border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
      </div>

      <div className="flex h-[calc(100vh-130px)] gap-0 overflow-hidden rounded-2xl border border-white/8" style={{ background: "#0f0f0f" }}>
        {/* ── Liste des conversations ── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-white/8">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: "#E30613" }} />
            Conversations
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400">
              {conversations.length}
            </span>
          </h2>
          <button
            onClick={fetchConversations}
            className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-gray-500 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">Aucune conversation</div>
          )}
          {conversations.map((conv) => {
            const cfg = STATUT_CONFIG[conv.statut];
            const Icon = cfg.icon;
            const isSelected = selected?.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/4 ${isSelected ? "bg-white/6" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">
                    {conv.prenom} {conv.nom}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                    <Icon className="w-2.5 h-2.5" />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-gray-500 text-xs truncate">{conv.email}</p>
                {conv.lastMessage && (
                  <p className="text-gray-600 text-xs mt-1 truncate">{conv.lastMessage}</p>
                )}
                <p className="text-gray-700 text-[10px] mt-1">{formatDate(conv.updatedAt)}</p>
              </button>
            );
          })}
        </div>
        </div>

        {/* ── Détail de la conversation ── */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <MessageCircle className="w-12 h-12 text-gray-700" />
            <p className="text-gray-600 text-sm">Sélectionnez une conversation</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <p className="text-white font-bold">
                {selected.prenom} {selected.nom}
              </p>
              <p className="text-gray-500 text-xs">{selected.email}</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${STATUT_CONFIG[selected.statut].color}`}>
              {selected.statut}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${msg.auteur === "ADMIN" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: msg.auteur === "ADMIN" ? "#E30613" : "#333" }}
                >
                  {msg.auteur === "ADMIN" ? "PE" : `${selected.prenom[0]}${selected.nom[0]}`}
                </div>
                <div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm max-w-xs ${
                      msg.auteur === "ADMIN" ? "rounded-br-none text-white" : "rounded-bl-none text-white"
                    }`}
                    style={{ background: msg.auteur === "ADMIN" ? "#E30613" : "#1e1e1e" }}
                  >
                    {msg.contenu}
                  </div>
                  <p className="text-gray-700 text-[10px] mt-1 px-1">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Zone de réponse */}
          <div className="p-4 border-t border-white/8 flex gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              }}
              rows={2}
              placeholder="Répondre au client…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className="w-10 h-10 self-end rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ background: "#E30613" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
