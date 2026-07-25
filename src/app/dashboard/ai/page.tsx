"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Bot, Brain, ChefHat, PackageSearch, Sparkles, Loader2, Send, CheckCircle2, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs, inventory, menuItems, orders } from "@/lib/data";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AIOpsPage() {
  const [pending, setPending] = useState(7);
  const [chefs, setChefs] = useState(3);
  const [digestLoading, setDigestLoading] = useState(false);
  const [customDigest, setCustomDigest] = useState<string | null>(null);

  const [liveEta, setLiveEta] = useState<number | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Live Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello Manager! I am your DineFlow AI assistant. Ask me anything about menu optimization, wait times, or kitchen shifts." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Restock State
  const [restockedItems, setRestockedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWaitTime();
  }, [pending, chefs]);

  const fetchWaitTime = async () => {
    try {
      const res = await fetch("/api/ai/wait-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingOrders: pending, activeChefs: chefs }),
      });
      const data = await res.json();
      if (data.eta) setLiveEta(data.eta);
      if (data.suggestion) setAiSuggestion(data.suggestion);
    } catch (err) {
      console.error("Wait-time API error:", err);
    }
  };

  const handleGenerateDigest = async () => {
    try {
      setDigestLoading(true);
      const res = await fetch("/api/ai/daily-digest", { method: "POST" });
      const data = await res.json();
      if (data.digest) {
        setCustomDigest(data.digest);
      }
    } catch (err) {
      console.error("Gemini AI API call error:", err);
    } finally {
      setDigestLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.reply || "I couldn't process that right now." }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: "AI service connection error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDispatchRestock = (itemName: string) => {
    setRestockedItems((prev) => ({ ...prev, [itemName]: true }));
  };

  const avgPrep = Math.round(orders.reduce((sum, order) => sum + (order.eta || 8), 0) / orders.length);
  const calculatedEta = useMemo(() => Math.max(8, Math.round(avgPrep + (pending * avgPrep) / Math.max(1, chefs) / 2)), [avgPrep, chefs, pending]);

  return (
    <DashboardShell title="AI Operations Center" subtitle="Real-time intelligent controls for wait-time predictions, executive shift digests, and Gemini AI assistant.">
      <div className="grid gap-6 xl:grid-cols-2">
        {/* 1. Live Wait-Time Predictor */}
        <section className="rounded-[12px] border border-[#eadfce] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
              <Brain size={24} />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold">Wait-Time Predictor</h2>
              <p className="text-xs font-semibold text-[var(--muted)]">Real-time kitchen queue & staff allocation ETA model.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className="flex justify-between text-xs font-bold text-[var(--ink)] mb-1">
                <span>Pending Orders Queue</span>
                <span className="font-mono text-[var(--terracotta)] font-extrabold">{pending} orders</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={pending}
                onChange={(e) => setPending(Number(e.target.value))}
                className="w-full accent-[#c1622e] h-2 bg-[#eadfce] rounded-lg cursor-pointer"
              />
            </label>
            <label className="block">
              <div className="flex justify-between text-xs font-bold text-[var(--ink)] mb-1">
                <span>Active Chefs on Shift</span>
                <span className="font-mono text-[var(--sage)] font-extrabold">{chefs} chefs</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={chefs}
                onChange={(e) => setChefs(Number(e.target.value))}
                className="w-full accent-[#4f7d52] h-2 bg-[#eadfce] rounded-lg cursor-pointer"
              />
            </label>
          </div>

          <div className="mt-6 rounded-[10px] bg-[#fcfaf6] border border-[#eadfce] p-5 shadow-inner">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">Predicted Guest Wait Time</p>
            <p className="mt-2 font-mono text-5xl font-black text-[var(--ink)]">~{liveEta ?? calculatedEta} min</p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)] font-semibold border-t border-[#eadfce] pt-3">
              {aiSuggestion || "Kitchen load is moderate. Suggest drinks or quick starters if guests are waiting."}
            </p>
          </div>
        </section>

        {/* 2. Executive Shift Digest Generator */}
        <section className="rounded-[12px] border border-[#eadfce] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                  <Bot size={24} />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold">Executive Shift Briefing</h2>
                  <p className="text-xs font-semibold text-[var(--muted)]">Generate live Gemini AI daily operational summary.</p>
                </div>
              </div>
              <button
                onClick={handleGenerateDigest}
                disabled={digestLoading}
                className="flex h-10 items-center gap-2 rounded-full bg-[var(--terracotta)] px-5 text-xs font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 shrink-0 shadow-sm"
              >
                {digestLoading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Generate Briefing</>}
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {customDigest ? (
                <div className="rounded-[10px] bg-[#f8eadf]/40 border border-[var(--terracotta)]/30 p-5 text-xs leading-relaxed text-[var(--ink)] font-semibold shadow-sm">
                  <p className="font-bold text-[var(--terracotta)] mb-2 flex items-center gap-1.5 text-sm">
                    <Sparkles size={16} /> Live Gemini AI Executive Briefing:
                  </p>
                  <p className="whitespace-pre-line">{customDigest}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] p-3.5 text-xs leading-relaxed text-[var(--muted)] font-semibold flex items-center gap-2.5">
                    <ChefHat className="text-[var(--terracotta)] shrink-0" size={16} /> Butter Bowl is leading sales by 22% today. Recommend pairing with Nimbu Soda.
                  </p>
                  <p className="rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] p-3.5 text-xs leading-relaxed text-[var(--muted)] font-semibold flex items-center gap-2.5">
                    <ChefHat className="text-[var(--terracotta)] shrink-0" size={16} /> Average bill value rises when drinks are suggested with mains.
                  </p>
                  <p className="rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] p-3.5 text-xs leading-relaxed text-[var(--muted)] font-semibold flex items-center gap-2.5">
                    <ChefHat className="text-[var(--terracotta)] shrink-0" size={16} /> Restock mint and cream before tomorrow lunch to prevent order bottlenecks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Interactive Gemini AI Operational Assistant Chat */}
        <section className="rounded-[12px] border border-[#eadfce] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-[#eadfce] pb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)]">
                <Sparkles size={24} />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold">Ask DineFlow AI Assistant</h2>
                <p className="text-xs font-semibold text-[var(--muted)]">Ask operational, menu, or pricing questions to Gemini AI.</p>
              </div>
            </div>

            <div className="my-4 max-h-56 overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-[10px] p-3.5 text-xs leading-relaxed ${msg.sender === "user" ? "bg-[var(--terracotta)] text-white font-bold" : "bg-[#fcfaf6] border border-[#eadfce] text-[var(--ink)] font-semibold"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[10px] bg-[#fcfaf6] border border-[#eadfce] p-3 text-xs font-bold text-[var(--muted)] flex items-center gap-2">
                    <Loader2 className="animate-spin text-[var(--terracotta)]" size={14} /> Gemini AI is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[#eadfce] pt-4">
            <input
              type="text"
              placeholder="Ask Gemini (e.g. Which dishes are most profitable?)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-11 flex-1 rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3.5 text-xs font-semibold outline-none focus:border-[var(--terracotta)] text-[var(--ink)]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--terracotta)] text-white hover:scale-[1.02] transition disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </section>

        {/* 4. Predictive Low-Stock Smart Alerts with Direct Restock Dispatch */}
        <section className="rounded-[12px] border border-[#eadfce] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#eadfce] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf0cf] text-[#a07012]">
                <PackageSearch size={24} />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold">Predictive Low-Stock Alerts</h2>
                <p className="text-xs font-semibold text-[var(--muted)]">Automatic stock warning thresholds & 1-click restock dispatch.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {inventory.filter((row) => row.stock < row.threshold).map((row) => {
              const isRestocked = restockedItems[row.item];
              return (
                <div key={row.item} className="flex items-center justify-between gap-3 rounded-[10px] border border-[#eadfce] bg-[#fcfaf6] p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <BellRing className="mt-0.5 text-[var(--terracotta)] shrink-0" size={18} />
                    <div>
                      <p className="font-bold text-sm text-[var(--ink)]">{row.item} Stock Alert</p>
                      <p className="text-xs leading-relaxed text-[var(--muted)] font-semibold mt-0.5">
                        {row.stock} {row.unit} left (Threshold: {row.threshold} {row.unit}). Recommended reorder from <span className="font-bold text-[var(--ink)]">{row.supplier}</span>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDispatchRestock(row.item)}
                    disabled={isRestocked}
                    className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      isRestocked ? "bg-[#eaf2e5] text-[var(--sage)] border border-[#eaf2e5]" : "bg-[var(--terracotta)] text-white hover:scale-[1.02]"
                    }`}
                  >
                    {isRestocked ? <><CheckCircle2 size={14} /> Dispatched</> : <>⚡ Order Restock</>}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
