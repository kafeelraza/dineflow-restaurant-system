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
  
  // Search state
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const lastOrderId = localStorage.getItem("dineflow_last_order_id");
    if (lastOrderId) {
      router.replace(`/order/${lastOrderId}`);
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim() || !searchName.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      // Query active orders (placed, confirmed, preparing, ready, served)
      const { data, error } = await supabase
        .from("orders")
        .select("id, guest_name")
        .neq("status", "billed");

      if (error) throw error;

      const matchedOrder = data?.find((o) => {
        const cleanSearchId = searchOrderId.trim().toLowerCase();
        const idMatches = o.id.toLowerCase().startsWith(cleanSearchId);
        const nameMatches = o.guest_name?.toLowerCase().trim() === searchName.trim().toLowerCase();
        return idMatches && nameMatches;
      });

      if (matchedOrder) {
        localStorage.setItem("dineflow_last_order_id", matchedOrder.id);
        router.push(`/order/${matchedOrder.id}`);
      } else {
        setSearchError("No active order found matching this order number and guest name.");
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
          <p className="mt-4 font-bold text-[var(--muted)]">Checking for active orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <div className="mx-auto max-w-md px-5 py-20">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
            <ShoppingBag size={28} />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[var(--ink)]">Track Your Order</h2>
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
            Lost your tracking page? Enter your Order ID (first 4 characters) and your checkout name to monitor kitchen status.
          </p>
        </div>

        <form onSubmit={handleTrackOrder} className="bg-white border border-[#eadfce] rounded-[12px] p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
              Order ID / Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5DD9"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)] uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
              Guest Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)]"
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
                <Search size={14} /> Track Live Status
              </>
            )}
          </button>
        </form>

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
