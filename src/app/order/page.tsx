"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Loader2, Search } from "lucide-react";
import { AppNav } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";

export default function OrderRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  
  // Search state
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedId = localStorage.getItem("dineflow_last_order_id");
    if (savedId) {
      setLastOrderId(savedId);
    }
    setChecking(false);
  }, []);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return;

    setSearching(true);
    setSearchError(null);
    setFoundOrders([]);

    try {
      // Query active orders (placed, confirmed, preparing, ready, served)
      const { data, error } = await supabase
        .from("orders")
        .select("id, guest_name, total_amount, created_at, order_type, restaurant_tables(table_number)")
        .neq("status", "billed");

      if (error) throw error;

      const matched = (data || []).filter((o) => {
        const nameMatches = o.guest_name?.toLowerCase().trim() === searchName.trim().toLowerCase();
        if (!nameMatches) return false;

        if (searchOrderId.trim()) {
          const cleanSearchId = searchOrderId.trim().toLowerCase();
          return o.id.toLowerCase().startsWith(cleanSearchId);
        }
        return true;
      });

      if (matched.length === 1) {
        localStorage.setItem("dineflow_last_order_id", matched[0].id);
        router.push(`/order/${matched[0].id}`);
      } else if (matched.length > 1) {
        setFoundOrders(matched);
      } else {
        setSearchError("No active order found matching this guest name.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to search order.");
    } finally {
      setSearching(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-[var(--cream)]">
        <AppNav />
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={40} />
          <p className="mt-4 font-bold text-[var(--muted)]">Checking active sessions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <div className="mx-auto max-w-md px-5 py-16">
        {/* Active Session Notification */}
        {lastOrderId && (
          <div className="mb-6 rounded-[8px] bg-[#eaf2e5] border border-[#eadfce] p-4 text-xs text-[#4f7d52] font-semibold flex items-center justify-between shadow-sm">
            <span>You have an active tracked order session.</span>
            <Link
              href={`/order/${lastOrderId}`}
              className="bg-[var(--terracotta)] text-white px-4 py-2 rounded-full font-bold hover:scale-[1.03] transition shrink-0 ml-2"
            >
              View Order
            </Link>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
            <ShoppingBag size={28} />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[var(--ink)]">Track Your Order</h2>
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
            Enter your checkout name (and optional Order ID) below to restore and monitor your kitchen progress.
          </p>
        </div>

        <form onSubmit={handleTrackOrder} className="bg-white border border-[#eadfce] rounded-[12px] p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
              Guest Name (Required)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)] font-semibold text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5 flex justify-between">
              <span>Order ID / Number</span>
              <span className="text-[10px] lowercase text-[var(--muted)] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 5DD9"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)] uppercase font-mono"
            />
          </div>

          {searchError && (
            <p className="text-xs font-bold text-[#b24428] bg-[#f8ddd5]/30 p-2.5 rounded-[6px] border border-[#f8ddd5]">
              {searchError}
            </p>
          )}

          <button
            type="submit"
            disabled={searching}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] text-white text-xs font-bold transition hover:scale-[1.01] disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Search size={14} /> Search Orders
              </>
            )}
          </button>
        </form>

        {/* Found Multiple Matches */}
        {foundOrders.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-[var(--muted)] tracking-wider">Active Orders Found:</h3>
            <div className="space-y-2">
              {foundOrders.map((ord) => {
                const timeStr = new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const idTag = ord.id.slice(0, 4).toUpperCase();
                const tableNum = ord.restaurant_tables?.table_number;
                return (
                  <div
                    key={ord.id}
                    onClick={() => {
                      localStorage.setItem("dineflow_last_order_id", ord.id);
                      router.push(`/order/${ord.id}`);
                    }}
                    className="p-4 rounded-[8px] border border-[#eadfce] bg-white hover:border-[var(--terracotta)] hover:bg-[#fcfaf6] transition cursor-pointer flex justify-between items-center shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-sm text-[var(--ink)]">Order #{idTag}</p>
                      <p className="text-[10px] text-[var(--muted)] font-semibold mt-0.5 capitalize">
                        {ord.order_type === "dine-in" ? `Dine-In (Table T${String(tableNum).padStart(2, "0")})` : "Takeaway"} • {timeStr}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[var(--terracotta)]">
                      Rs. {ord.total_amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mt-6 text-xs text-[var(--muted)] font-semibold">
          Don&apos;t have an order?{" "}
          <Link href="/menu" className="text-[var(--terracotta)] underline hover:text-[var(--terracotta)]/80">
            Start Ordering
          </Link>
        </div>
      </div>
    </main>
  );
}
