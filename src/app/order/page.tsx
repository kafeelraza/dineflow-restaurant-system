"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Loader2, Search, Utensils, ArrowLeft, ChevronRight, Calendar } from "lucide-react";
import { AppNav } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";

export default function OrderRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Selection state: "select" | "dine-in" | "takeaway"
  const [orderTypeMode, setOrderTypeMode] = useState<"select" | "dine-in" | "takeaway">("select");
  
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
    const queryTerm = searchName.trim().toLowerCase();
    const orderIdQuery = searchOrderId.trim().toLowerCase();

    if (!queryTerm && !orderIdQuery) return;

    setSearching(true);
    setSearchError(null);
    setFoundOrders([]);

    try {
      // Query active orders (placed, confirmed, preparing, ready, served)
      let query = supabase
        .from("orders")
        .select("id, guest_name, total_amount, created_at, order_type, restaurant_tables(table_number)")
        .neq("status", "billed");

      // Filter by selected order type mode
      if (orderTypeMode === "dine-in") {
        query = query.eq("order_type", "dine-in");
      } else if (orderTypeMode === "takeaway") {
        query = query.eq("order_type", "takeaway");
      }

      const { data, error } = await query;
      if (error) throw error;

      // Extract numeric table query if user typed "2", "Table 2", "T2", "T02"
      const cleanTableNum = Number(queryTerm.replace(/\D/g, ""));
      const isTableQuery = !isNaN(cleanTableNum) && cleanTableNum > 0;

      const matched = (data || []).filter((o) => {
        // 1. Guest name check
        const nameMatches = queryTerm && o.guest_name?.toLowerCase().includes(queryTerm);

        // 2. Table number check (e.g. searching "2" or "Table 2")
        const tableObj: any = Array.isArray(o.restaurant_tables) ? o.restaurant_tables[0] : o.restaurant_tables;
        const tableNum = tableObj?.table_number;
        const tableMatches = isTableQuery && tableNum === cleanTableNum;

        // 3. Order ID check
        const idMatches = orderIdQuery && o.id.toLowerCase().startsWith(orderIdQuery);
        const termIsId = queryTerm && o.id.toLowerCase().startsWith(queryTerm);

        if (orderIdQuery) {
          return (nameMatches || tableMatches) && idMatches;
        }

        return nameMatches || tableMatches || termIsId;
      });

      if (matched.length === 1) {
        localStorage.setItem("dineflow_last_order_id", matched[0].id);
        router.push(`/order/${matched[0].id}`);
      } else if (matched.length > 1) {
        setFoundOrders(matched);
      } else {
        setSearchError(
          orderTypeMode === "dine-in"
            ? "No active Dine-In order found matching this Table Number or Guest Name."
            : "No active Takeaway order found matching this Guest Name or Order ID."
        );
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
      <div className="mx-auto max-w-md px-5 py-14">
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

        {/* STEP 1: Select Order Type (Dine-In vs Takeaway) */}
        {orderTypeMode === "select" ? (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                <Search size={28} />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold text-[var(--ink)]">Track Order Status</h2>
              <p className="mt-2.5 text-sm text-[var(--muted)] leading-relaxed">
                Which type of order would you like to track? Select your order mode below.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Dine-In Order */}
              <button
                onClick={() => {
                  setOrderTypeMode("dine-in");
                  setSearchError(null);
                  setSearchName("");
                  setSearchOrderId("");
                }}
                className="w-full text-left p-5 rounded-[12px] border border-[#eadfce] bg-white hover:border-[var(--terracotta)] hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)] group-hover:scale-110 transition">
                    <Utensils size={22} />
                  </span>
                  <div>
                    <p className="font-serif font-bold text-lg text-[var(--ink)]">Dine-In Order</p>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">
                      Search by Table Number (e.g. Table 2) or Guest Name
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--terracotta)] group-hover:translate-x-1 transition" />
              </button>

              {/* Option 2: Takeaway Order */}
              <button
                onClick={() => {
                  setOrderTypeMode("takeaway");
                  setSearchError(null);
                  setSearchName("");
                  setSearchOrderId("");
                }}
                className="w-full text-left p-5 rounded-[12px] border border-[#eadfce] bg-white hover:border-[var(--sage)] hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)] group-hover:scale-110 transition">
                    <ShoppingBag size={22} />
                  </span>
                  <div>
                    <p className="font-serif font-bold text-lg text-[var(--ink)]">Takeaway Pickup</p>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">
                      Search online pickup by Guest Name or Order ID
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--sage)] group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Fill Details Form for selected mode */
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setOrderTypeMode("select");
                  setFoundOrders([]);
                  setSearchError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--terracotta)] hover:underline"
              >
                <ArrowLeft size={14} /> Change Mode
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfce] bg-white px-3 py-1 text-xs font-bold text-[var(--ink)] capitalize">
                {orderTypeMode === "dine-in" ? <Utensils size={13} className="text-[var(--terracotta)]" /> : <ShoppingBag size={13} className="text-[var(--sage)]" />}
                {orderTypeMode === "dine-in" ? "Dine-In Mode" : "Takeaway Mode"}
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-serif text-3xl font-bold text-[var(--ink)]">
                {orderTypeMode === "dine-in" ? "Track Table Order" : "Track Takeaway Order"}
              </h2>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                {orderTypeMode === "dine-in"
                  ? "Enter your Table Number or Guest Name below to check live kitchen progress."
                  : "Enter your Guest Name or Order ID below to view your pickup status."}
              </p>
            </div>

            <form onSubmit={handleTrackOrder} className="bg-white border border-[#eadfce] rounded-[12px] p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
                  {orderTypeMode === "dine-in" ? "Table Number or Guest Name" : "Guest Name"}
                </label>
                <input
                  type="text"
                  placeholder={orderTypeMode === "dine-in" ? "e.g. Table 2 or Rahul Sharma" : "e.g. Rahul Sharma"}
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
                    <Search size={14} /> Search {orderTypeMode === "dine-in" ? "Dine-In" : "Takeaway"} Orders
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
                    const tableObj: any = Array.isArray(ord.restaurant_tables) ? ord.restaurant_tables[0] : ord.restaurant_tables;
                    const tableNum = tableObj?.table_number;
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
                            {ord.order_type === "dine-in" ? `Dine-In (Table T${String(tableNum || "??").padStart(2, "0")})` : "Takeaway"} • {timeStr}
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
          </div>
        )}

        <div className="text-center mt-8 text-xs text-[var(--muted)] font-semibold">
          Don&apos;t have an order?{" "}
          <Link href="/menu" className="text-[var(--terracotta)] underline hover:text-[var(--terracotta)]/80 font-bold">
            Start Ordering
          </Link>
        </div>
      </div>
    </main>
  );
}

