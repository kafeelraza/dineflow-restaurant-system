"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Loader2, ReceiptText } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { OrderStepper } from "@/components/customer/customer-widgets";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

interface OrderDetail {
  id: string;
  status: string;
  total_amount: number;
  estimated_ready_at: string | null;
  restaurant_tables?: {
    table_number: number;
  } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_order: number;
  menu_items?: {
    name: string;
  } | null;
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waiterName, setWaiterName] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // Fetch order basic details and table number
        const { data: orderData, error: orderErr } = await supabase
          .from("orders")
          .select("id, status, total_amount, estimated_ready_at, assigned_staff_id, restaurant_tables(table_number, assigned_staff_id)")
          .eq("id", orderId)
          .single();

        if (orderErr) throw orderErr;
        setOrder(orderData as any);

        // Fetch waiter name separately to prevent join embedding conflicts
        const primaryStaffId = orderData.assigned_staff_id;
        const tableDetails: any = Array.isArray(orderData.restaurant_tables)
          ? orderData.restaurant_tables[0]
          : orderData.restaurant_tables;
        const tableStaffId = tableDetails?.assigned_staff_id;
        const targetStaffId = primaryStaffId || tableStaffId;

        if (targetStaffId) {
          const { data: staffProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", targetStaffId)
            .single();
          if (staffProfile) {
            setWaiterName(staffProfile.full_name);
          }
        }

        // Fetch items associated with the order
        const { data: itemsData, error: itemsErr } = await supabase
          .from("order_items")
          .select("id, quantity, price_at_order, menu_items(name)")
          .eq("order_id", orderId);

        if (itemsErr) throw itemsErr;
        setItems(itemsData as any[]);
      } catch (err: any) {
        setError(err.message || "Failed to load order information.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Subscribe to real-time status updates for this order
    const channel = supabase
      .channel(`order-realtime-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          fetchOrderData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--cream)]">
        <AppNav />
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={40} />
          <p className="mt-4 font-bold text-[var(--muted)]">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[var(--cream)]">
        <AppNav />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h2 className="font-serif text-3xl font-bold text-[var(--ink)]">Order Not Found</h2>
          <p className="mt-4 text-[var(--muted)]">{error || "The requested order does not exist."}</p>
          <Link href="/menu" className="mt-6 inline-flex rounded-full bg-[var(--terracotta)] px-6 py-3 font-bold text-white">
            Return to Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <PageHeader
          eyebrow="Live order tracking"
          title="Your kitchen status is visible"
          copy="Customers can see ETA, order stage, item details, and move to billing when service is complete."
        />
        
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-white p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eadfce] pb-5 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-sm font-bold text-[var(--terracotta)]">
                  ORDER #{order.id.slice(0, 8).toUpperCase()} - TABLE {order.restaurant_tables?.table_number ? `T${String(order.restaurant_tables.table_number).padStart(2, "0")}` : "TAKEAWAY"}
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold capitalize">
                  {order.status === "placed" && "Order Placed"}
                  {order.status === "confirmed" && "Chef Confirmed"}
                  {order.status === "preparing" && "Preparing now"}
                  {order.status === "ready" && "Ready for Pickup"}
                  {order.status === "served" && "Served"}
                  {order.status === "billed" && "Billed"}
                  {order.status === "cancelled" && "Cancelled"}
                </h2>
                {waiterName && (
                  <p className="mt-2 text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--terracotta)] animate-pulse text-xs"></span>
                    Your Server: <span className="text-[var(--ink)] font-extrabold">{waiterName}</span>
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf2e5] px-4 py-2 font-bold text-[var(--sage)]">
                <Clock3 size={18} /> 
                {order.status === "ready" ? "Ready" : order.status === "served" ? "Served" : "Active"}
              </span>
            </div>
            
            {/* Order Recovery Information Banner */}
            <div className="mb-6 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] p-4 text-xs leading-relaxed text-[var(--muted)] font-semibold flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)] font-mono font-bold">!</span>
              <div>
                <p className="font-bold text-[var(--ink)] mb-0.5">Order Tracking Tip</p>
                Save your Order ID: <span className="font-mono font-bold text-[var(--terracotta)]">#{order.id.slice(0, 4).toUpperCase()}</span>. If you close this tab, you can restore your tracking anytime at <Link href="/order" className="underline text-[var(--terracotta)] font-bold">/order</Link> using this ID and your guest name!
              </div>
            </div>

            <div className="mt-6">
              <OrderStepper status={order.status} />
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="font-serif text-3xl font-bold">Order summary</h2>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between rounded-[8px] bg-white p-4">
                  <div>
                    <p className="font-bold">{item.menu_items?.name || "Delicious Item"}</p>
                    <p className="text-sm text-[var(--muted)]">Qty {item.quantity}</p>
                  </div>
                  <p className="font-mono font-bold">
                    {formatRs(item.quantity * item.price_at_order)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-5 border-t border-[#eadfce] pt-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Subtotal</span>
                <span>{formatRs(order.total_amount)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.restaurant_tables?.table_number && (
                  <Link
                    href={`/menu?table=${order.restaurant_tables.table_number}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] font-bold text-[var(--ink)] transition hover:bg-white text-xs hover:scale-[1.01]"
                  >
                    + Order More
                  </Link>
                )}
                {["ready", "served", "billed"].includes(order.status) ? (
                  <Link
                    href={`/billing/demo?orderId=${order.id}`}
                    className={`flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01] text-xs ${
                      !order.restaurant_tables?.table_number ? "col-span-2" : ""
                    }`}
                  >
                    <ReceiptText size={16} /> Pay Bill & Receipt
                  </Link>
                ) : (
                  <div
                    className={`flex h-12 items-center justify-center gap-2 rounded-full bg-[#fcfaf6] border border-[#eadfce] font-semibold text-[var(--muted)] text-xs text-center px-4 ${
                      !order.restaurant_tables?.table_number ? "col-span-2" : ""
                    }`}
                  >
                    <Clock3 size={14} className="text-[var(--terracotta)] animate-spin" /> Bill unlocks once order is ready/served
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
