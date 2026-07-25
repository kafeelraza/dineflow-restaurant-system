"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Download, ReceiptText, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

interface BillItem {
  id: string;
  quantity: number;
  price_at_order: number;
  menu_items?: {
    name: string;
  } | null;
}

interface BillOrder {
  id: string;
  status: string;
  total_amount: number;
  guest_name: string | null;
  guest_phone: string | null;
  restaurant_tables?: {
    table_number: number;
  } | null;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<BillOrder | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const fetchBillData = async () => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Fetch order details
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("id, status, total_amount, guest_name, guest_phone, restaurant_tables(table_number)")
        .eq("id", orderId)
        .single();

      if (orderErr) throw orderErr;
      setOrder(orderData as any);
      if (orderData.status === "billed") {
        setPaid(true);
      }

      // 2. Fetch order items
      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("id, quantity, price_at_order, menu_items(name)")
        .eq("order_id", orderId);

      if (itemsErr) throw itemsErr;
      setItems(itemsData as any[]);
    } catch (err: any) {
      setError(err.message || "Failed to load bill information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillData();
  }, [orderId]);

  const handleMarkPaid = async () => {
    if (!orderId) return;
    setUpdating(true);

    try {
      // 1. Update order status to 'billed'
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "billed" })
        .eq("id", orderId);

      if (orderErr) throw orderErr;

      // 2. Insert or update bills table record
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price_at_order, 0);
      const tax = Math.round(subtotal * 0.05); // 5% GST
      const discount = Math.round(subtotal * 0.1); // 10% Loyalty discount
      const total = subtotal + tax - discount;

      await supabase.from("bills").upsert({
        order_id: orderId,
        subtotal,
        tax,
        discount,
        total,
        payment_status: "paid",
        payment_method: "card",
      }, { onConflict: "order_id" });

      setPaid(true);
      if (order) {
        setOrder({ ...order, status: "billed" });
      }
    } catch (err: any) {
      alert("Failed to mark bill as paid: " + (err.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        <p className="mt-2 text-sm text-[var(--muted)]">Fetching invoice details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="mx-auto mt-6 max-w-xl bg-white p-8 text-center border border-[#eadfce]">
        <h3 className="font-serif text-2xl font-bold">Bill Details Not Found</h3>
        <p className="text-sm text-[var(--muted)] mt-2">{error || "Please specify a valid order ID."}</p>
        <Link href="/menu" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--terracotta)] px-6 font-bold text-white transition hover:scale-[1.01]">
          Back to Menu
        </Link>
      </Card>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price_at_order, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discount = Math.round(subtotal * 0.1); // 10% Loyalty discount
  const total = subtotal + tax - discount;

  return (
    <Card className="mx-auto mt-12 bg-white p-6 border border-[#eadfce]">
      <div className="flex items-center justify-between border-b border-[#eadfce] pb-5">
        <div>
          <p className="font-mono text-sm font-bold text-[var(--terracotta)]">
            BILL #B-{order.id.slice(0, 8).toUpperCase()}
          </p>
          <h2 className="font-serif text-3xl font-bold">
            {order.restaurant_tables?.table_number
              ? `Table T${String(order.restaurant_tables.table_number).padStart(2, "0")}`
              : "Takeaway"}
          </h2>
          {order.guest_name && (
            <p className="text-xs text-[var(--muted)] mt-1">Customer: {order.guest_name}</p>
          )}
        </div>
        <ReceiptText className="text-[var(--terracotta)]" size={34} />
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.menu_items?.name || "Delicious Item"} x{item.quantity}
            </span>
            <span className="font-mono font-bold">
              {formatRs(item.quantity * item.price_at_order)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-[#eadfce] pt-5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <b>{formatRs(subtotal)}</b>
        </div>
        <div className="flex justify-between text-[var(--muted)]">
          <span>GST (5%)</span>
          <span>{formatRs(tax)}</span>
        </div>
        <div className="flex justify-between text-[var(--sage)]">
          <span>Loyalty discount (10%)</span>
          <span>-{formatRs(discount)}</span>
        </div>
        <div className="flex justify-between border-t border-[#eadfce] pt-4 text-2xl font-black">
          <span>Total</span>
          <span>{formatRs(total)}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold uppercase tracking-wider">
          Payment Status:{" "}
          <span className={paid ? "text-[var(--sage)] font-bold" : "text-[#b24428] font-bold"}>
            {paid ? "PAID" : "PENDING"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleMarkPaid}
          disabled={updating || paid}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <CreditCard size={18} /> {paid ? "Settled" : "Mark paid"}
            </>
          )}
        </button>
        <button
          onClick={() => window.print()}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] font-bold transition hover:bg-white"
        >
          <Download size={18} /> Print Receipt
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/order/${order.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={12} /> Back to order tracking
        </Link>
      </div>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8">
        <PageHeader
          eyebrow="Billing invoice"
          title="A bill that is ready when the table is"
          copy="A live dynamically generated invoice linked to table orders, showing tax, auto-applied discounts, and real-time checkout."
        />
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
            </div>
          }
        >
          <BillingContent />
        </Suspense>
      </section>
    </main>
  );
}
