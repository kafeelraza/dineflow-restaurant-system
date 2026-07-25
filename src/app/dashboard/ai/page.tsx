"use client";

import { useMemo, useState } from "react";
import { BellRing, Bot, Brain, ChefHat, PackageSearch, Sparkles, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { aiInsights, formatRs, inventory, menuItems, orders } from "@/lib/data";

export default function AIOpsPage() {
  const [pending, setPending] = useState(7);
  const [chefs, setChefs] = useState(3);
  const [digestLoading, setDigestLoading] = useState(false);
  const [customDigest, setCustomDigest] = useState<string | null>(null);

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

  const avgPrep = Math.round(orders.reduce((sum, order) => sum + (order.eta || 8), 0) / orders.length);
  const eta = useMemo(() => Math.max(8, Math.round(avgPrep + (pending * avgPrep) / Math.max(1, chefs) / 2)), [avgPrep, chefs, pending]);
  const recommendations = menuItems.filter((item) => item.isAvailable).slice(0, 3);

  return (
    <DashboardShell title="AI operations center" subtitle="Frontend-ready intelligent workflows for recommendations, ETA prediction, forecasts, and smart alerts.">
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]"><Brain /></span>
            <div><h2 className="font-serif text-2xl font-bold">Wait-time predictor</h2><p className="text-sm text-[var(--muted)]">Formula now, Gemini phrasing later.</p></div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label><span className="text-sm font-bold">Pending orders: {pending}</span><input type="range" min="1" max="20" value={pending} onChange={(event) => setPending(Number(event.target.value))} className="mt-3 w-full accent-[#c1622e]" /></label>
            <label><span className="text-sm font-bold">Active chefs: {chefs}</span><input type="range" min="1" max="8" value={chefs} onChange={(event) => setChefs(Number(event.target.value))} className="mt-3 w-full accent-[#7a8b6f]" /></label>
          </div>
          <div className="mt-6 rounded-[8px] bg-[#fcfaf6] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">Predicted customer ETA</p>
            <p className="mt-2 font-mono text-5xl font-black">~{eta} min</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Kitchen load is moderate. Suggest drinks or quick starters if guests are waiting.</p>
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)]"><Sparkles /></span>
            <div><h2 className="font-serif text-2xl font-bold">Personalized recommendations</h2><p className="text-sm text-[var(--muted)]">For customer Aarav, based on cart and history.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-[8px] bg-[#fcfaf6] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{item.name}</p>
                  <span className="font-mono text-sm font-bold text-[var(--terracotta)]">{formatRs(item.price)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Recommended because the guest likes {item.spice > 1 ? "spicy" : "comfort"} dishes and this item has healthy prep capacity.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbf0cf] text-[#a07012]"><PackageSearch /></span>
            <div><h2 className="font-serif text-2xl font-bold">Low-stock smart alerts</h2><p className="text-sm text-[var(--muted)]">Inventory prediction UI for restock decisions.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {inventory.filter((row) => row.stock < row.threshold).map((row) => (
              <div key={row.item} className="flex items-start gap-3 rounded-[8px] bg-[#f8eadf] p-4">
                <BellRing className="mt-1 text-[var(--terracotta)]" size={18} />
                <div><p className="font-bold">{row.item} needs restock</p><p className="text-sm leading-6 text-[var(--muted)]">{row.stock} {row.unit} left. Recommended reorder from {row.supplier} today.</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]"><Bot /></span>
              <div><h2 className="font-serif text-2xl font-bold">Manager digest generator</h2><p className="text-sm text-[var(--muted)]">Real-time Gemini AI executive shift summary.</p></div>
            </div>
            <button
              onClick={handleGenerateDigest}
              disabled={digestLoading}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-4 text-xs font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 shrink-0"
            >
              {digestLoading ? <Loader2 className="animate-spin" size={12} /> : <>⚡ Ask Gemini</>}
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {customDigest ? (
              <div className="rounded-[8px] bg-[#f8eadf]/40 border border-[var(--terracotta)]/30 p-4 text-sm leading-relaxed text-[var(--ink)] font-semibold">
                <p className="font-bold text-[var(--terracotta)] mb-1 flex items-center gap-1.5"><Sparkles size={14} /> Live Gemini AI Briefing:</p>
                {customDigest}
              </div>
            ) : (
              aiInsights.map((insight) => (
                <p key={insight} className="rounded-[8px] bg-[#fcfaf6] p-4 text-sm leading-6 text-[var(--muted)]"><ChefHat className="mr-2 inline text-[var(--terracotta)]" size={16} />{insight}</p>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
