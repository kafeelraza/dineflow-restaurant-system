"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Download, ReceiptText, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
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
  table_id?: string | null;
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
  const [allOrderIds, setAllOrderIds] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        .select("id, status, total_amount, guest_name, guest_phone, table_id, restaurant_tables(table_number)")
        .eq("id", orderId)
        .single();

      if (orderErr) throw orderErr;
      setOrder(orderData as any);
      if (orderData.status === "billed") {
        setPaid(true);
      }

      // Consolidate active sibling orders for this table if it is Dine-In
      let orderIds = [orderId];
      if (orderData.table_id) {
        const { data: siblingOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("table_id", orderData.table_id)
          .neq("status", "billed");

        if (siblingOrders && siblingOrders.length > 0) {
          const activeIds = siblingOrders.map((o) => o.id);
          // Only consolidate if our current order is part of the active session
          if (activeIds.includes(orderId)) {
            orderIds = activeIds;
          }
        }
      }
      setAllOrderIds(orderIds);

      // 2. Fetch order items for all these consolidated orders
      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("id, quantity, price_at_order, menu_items(name)")
        .in("order_id", orderIds);

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
    if (allOrderIds.length === 0) return;
    setUpdating(true);

    try {
      // 1. Update order status to 'billed' for all consolidated orders
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "billed" })
        .in("id", allOrderIds);

      if (orderErr) throw orderErr;

      // 2. Release the associated table back to available
      if (order && order.table_id) {
        await supabase
          .from("restaurant_tables")
          .update({ status: "available" })
          .eq("id", order.table_id);
      }

      // 3. Insert or update bills table record (link to primary orderId)
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

      // 4. Send database notification to the Owner
      const notificationMsg = order?.restaurant_tables?.table_number
        ? `Table T${String(order.restaurant_tables.table_number).padStart(2, "0")} bill of Rs. ${total} has been settled & paid.`
        : `Takeaway bill for ${order?.guest_name || "Guest"} of Rs. ${total} has been settled & paid.`;

      await supabase.from("notifications").insert({
        message: notificationMsg,
        is_read: false
      });

      setPaid(true);
      if (order) {
        setOrder({ ...order, status: "billed" });
      }
      setShowSuccessModal(true);
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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full bg-white p-8 border border-[#eadfce] rounded-[16px] text-center shadow-xl transform scale-100 transition animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2e5] text-[#4f7d52] mb-5">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            
            <h3 className="font-serif text-3xl font-bold text-[var(--ink)]">Payment Successful!</h3>
            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed font-semibold">
              Your transaction has been successfully processed and settled. Thank you for dining with us!
            </p>

            <div className="my-6 rounded-[12px] bg-[#fcfaf6] border border-[#eadfce] p-4 text-left space-y-2">
              <div className="flex justify-between text-xs text-[var(--muted)] font-semibold">
                <span>Settlement ID:</span>
                <span className="font-mono text-[var(--ink)]">#S-{orderId?.slice(0,8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] font-semibold">
                <span>Mode:</span>
                <span className="text-[var(--ink)] font-bold capitalize">
                  {order?.restaurant_tables?.table_number ? `Dine-In (Table T${order.restaurant_tables.table_number})` : "Takeaway"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] font-semibold border-t border-[#eadfce] pt-2 mt-2">
                <span className="font-bold text-[var(--ink)]">Amount Paid:</span>
                <span className="font-mono font-bold text-[var(--terracotta)] text-sm">Rs. {total}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.print();
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01]"
              >
                <Download size={18} /> Print Invoice
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/menu");
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] font-bold text-[var(--ink)] transition hover:bg-white"
              >
                Return to Home
              </button>
            </div>
          </Card>
        </div>
      )}
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
