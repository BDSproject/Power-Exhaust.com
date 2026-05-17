"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown, Loader2 } from "lucide-react";

type Message = { auteur: "CLIENT" | "ADMIN"; contenu: string; createdAt?: string };

type Step = "closed" | "identify" | "chat";

export default function ChatWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (step === "chat" && convId) {
      const poll = async () => {
        const res = await fetch(`/api/chat/${convId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      };
      poll();
      pollRef.current = setInterval(poll, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, convId]);

  // Count unread admin messages when widget is closed
  useEffect(() => {
    if (step === "closed") {
      const adminMsgs = messages.filter((m) => m.auteur === "ADMIN");
      setUnread(adminMsgs.length > 0 ? adminMsgs.length : 0);
    } else {
      setUnread(0);
    }
  }, [step, messages]);

  const open = () => {
    if (convId) {
      setStep("chat");
    } else {
      setStep("identify");
    }
    setUnread(0);
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim() || !firstMessage.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, email, message: firstMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConvId(data.conversationId);
      setMessages([{ auteur: "CLIENT", contenu: firstMessage }]);
      setFirstMessage("");
      setStep("chat");
    } catch {
      setError("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !convId) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { auteur: "CLIENT", contenu: text }]);
    await fetch(`/api/chat/${convId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, auteur: "CLIENT" }),
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* ── Chat window ── */}
      {step !== "closed" && (
        <div
          className="w-[360px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "520px",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "#E30613" }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-tight">Power Exhaust</p>
              <p className="text-red-200 text-xs">Support client · Réponse sous 24h</p>
            </div>
            <button
              onClick={() => setStep("closed")}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* ── Formulaire d'identification ── */}
          {step === "identify" && (
            <form onSubmit={handleIdentify} className="flex flex-col gap-3 p-4 overflow-y-auto">
              <p className="text-gray-300 text-sm leading-relaxed">
                Avant de commencer, merci de vous présenter 👋
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Prénom *</label>
                  <input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Jean"
                    className="w-full px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nom *</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Adresse e-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@exemple.fr"
                  className="w-full px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Votre message *</label>
                <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Bonjour, j'ai une question sur..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: "#E30613" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Envoi…" : "Démarrer la conversation"}
              </button>
            </form>
          )}

          {/* ── Fenêtre de chat ── */}
          {step === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "340px" }}>
                {/* Message de bienvenue */}
                <div className="flex gap-2 items-end">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: "#E30613" }}
                  >
                    PE
                  </div>
                  <div
                    className="px-3 py-2 rounded-2xl rounded-bl-none text-sm text-white max-w-[75%]"
                    style={{ background: "#2a2a2a" }}
                  >
                    Bonjour {prenom} 👋 Notre équipe va vous répondre dès que possible.
                  </div>
                </div>

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 items-end ${msg.auteur === "CLIENT" ? "flex-row-reverse" : ""}`}
                  >
                    {msg.auteur === "ADMIN" && (
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: "#E30613" }}
                      >
                        PE
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] ${
                        msg.auteur === "CLIENT"
                          ? "rounded-br-none text-white"
                          : "rounded-bl-none text-white"
                      }`}
                      style={{
                        background: msg.auteur === "CLIENT" ? "#E30613" : "#2a2a2a",
                      }}
                    >
                      {msg.contenu}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/8 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Votre message…"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: "#E30613" }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Bouton flottant ── */}
      <button
        onClick={step === "closed" ? open : () => setStep("closed")}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative"
        style={{
          background: step !== "closed" ? "#333" : "#E30613",
          boxShadow: step === "closed" ? "0 4px 20px rgba(227,6,19,0.5)" : "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {step !== "closed" ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {unread > 0 && step === "closed" && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 text-xs font-black rounded-full flex items-center justify-center shadow">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
