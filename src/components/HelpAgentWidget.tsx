"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { helpAgent } from "@/lib/support/helpAgent";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starter = "How can I help you use DefendableDatasets?";

export function HelpAgentWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: starter }]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const content = message.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: content, history: nextMessages.slice(-6) }),
      });
      const data = await response.json().catch(() => ({}));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer || data.error || "Hack is not connected yet. Send feedback and we will route it.",
        },
      ]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Hack is unreachable right now. Try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <section className="w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-md border border-white/10 bg-[#090e14]/96 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md border border-amber-300/25 bg-amber-300/10 text-amber-100">
                <Bot className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{helpAgent.name}</div>
                <div className="text-xs text-slate-500">Defendable support AI</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close support chat"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={item.role === "user" ? "ml-8 rounded-md bg-amber-300 px-3 py-2 text-sm text-slate-950" : "mr-8 rounded-md border border-white/10 bg-white/[.055] px-3 py-2 text-sm leading-6 text-slate-200"}
              >
                {item.content}
              </div>
            ))}
            {loading ? (
              <div className="mr-8 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[.055] px-3 py-2 text-sm text-slate-300">
                <Loader2 className="size-4 animate-spin" />
                Thinking
              </div>
            ) : null}
          </div>
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
                maxLength={800}
                placeholder="Ask about datasets, access, receipts..."
                className="min-h-10 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 focus:border-amber-200/60"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!message.trim() || loading}
                className="grid size-10 place-items-center rounded-md bg-amber-300 text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send support question"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{helpAgent.tagline}</p>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/40 transition hover:bg-amber-200"
        >
          <MessageCircle className="size-4" />
          Help? Ask Hack
        </button>
      )}
    </div>
  );
}

