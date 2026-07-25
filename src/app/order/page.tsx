"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { AppNav } from "@/components/ui/brand";

export default function OrderRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasOrder, setHasOrder] = useState(false);

  useEffect(() => {
    const lastOrderId = localStorage.getItem("dineflow_last_order_id");
    if (lastOrderId) {
      setHasOrder(true);
      router.replace(`/order/${lastOrderId}`);
    } else {
      setChecking(false);
    }
  }, [router]);

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
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
          <ShoppingBag size={36} />
        </div>
        <h2 className="mt-6 font-serif text-3xl font-bold text-[var(--ink)]">No Active Order</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          You haven&apos;t placed any orders yet. Scan a QR code or browse our menu to place your first order.
        </p>
        <Link href="/menu" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--terracotta)] px-8 font-bold text-white transition hover:scale-[1.01]">
          Start Ordering
        </Link>
      </div>
    </main>
  );
}
