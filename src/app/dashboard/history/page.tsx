"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, TrendingUp, DollarSign, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

interface HistoricalOrder {
  id: string;
  total_amount: number;
  created_at: string;
  guest_name: string | null;
  guest_phone: string | null;
  status: string;
  restaurant_tables?: {
    table_number: number;
  } | null;
  order_items: {
    quantity: number;
    menu_items: {
      name: string;
    } | null;
  }[];
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<HistoricalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Statistics states
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [yesterdayOrdersCount, setYesterdayOrdersCount] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch all completed/billed orders
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          created_at,
          guest_name,
          guest_phone,
          status,
          restaurant_tables(table_number),
          order_items(
            quantity,
            menu_items(name)
          )
        `)
        .eq("status", "billed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const loadedOrders = (data as any[]) || [];
      setOrders(loadedOrders);

      // Compute Today vs Yesterday stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterdayStart = new Date(today);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const yesterdayEnd = new Date(today);

      let tCount = 0;
      let tRev = 0;
      let yCount = 0;
      let yRev = 0;

      loadedOrders.forEach((o) => {
        const orderDate = new Date(o.created_at);
        if (orderDate >= today) {
          tCount++;
          tRev += Number(o.total_amount);
        } else if (orderDate >= yesterdayStart && orderDate < yesterdayEnd) {
          yCount++;
          yRev += Number(o.total_amount);
        }
      });

      setTodayOrdersCount(tCount);
      setTodayRevenue(tRev);
      setYesterdayOrdersCount(yCount);
      setYesterdayRevenue(yRev);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <DashboardShell title="Order History" subtitle="Monitor completed guest invoices, compare daily performance metrics, and track operations.">
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Comparison Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[var(--muted)] block">Orders Served (Today)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-bold">{todayOrdersCount}</span>
                <span className="text-xs text-[var(--sage)] font-semibold flex items-center">
                  <TrendingUp size={12} className="mr-0.5" /> Live tracker
                </span>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[var(--muted)] block">Revenue Generated (Today)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-bold text-[var(--terracotta)]">
                  {formatRs(todayRevenue)}
                </span>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[var(--muted)] block">Orders Served (Yesterday)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-bold">{yesterdayOrdersCount}</span>
                <span className="text-xs text-[var(--muted)] font-semibold">Completed shift</span>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-[var(--muted)] block">Revenue (Yesterday)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-bold">
                  {formatRs(yesterdayRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Orders History Table */}
          <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-bold mb-4">Completed Invoices</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr className="border-b border-[#eadfce]">
                    <th className="py-3">Order ID</th>
                    <th>Customer Name</th>
                    <th>Table</th>
                    <th>Ordered Dishes</th>
                    <th>Date & Time</th>
                    <th className="text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[var(--muted)]">
                        No completed orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const itemsStr = o.order_items
                        .map((item) => `${item.menu_items?.name || "Item"} (x${item.quantity})`)
                        .join(", ");

                      const orderDate = new Date(o.created_at);

                      return (
                        <tr key={o.id} className="border-b border-[#eadfce] hover:bg-[#fcfaf6]">
                          <td className="py-4 font-mono font-bold text-[var(--terracotta)]">
                            #{o.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="font-bold">
                            {o.guest_name || "Guest Checkout"}
                            {o.guest_phone && (
                              <span className="block text-[10px] text-[var(--muted)] font-mono font-semibold">
                                {o.guest_phone}
                              </span>
                            )}
                          </td>
                          <td className="font-semibold">
                            {o.restaurant_tables?.table_number
                              ? `T${String(o.restaurant_tables.table_number).padStart(2, "0")}`
                              : "Takeaway"}
                          </td>
                          <td className="max-w-xs truncate text-[var(--ink)] font-medium" title={itemsStr}>
                            {itemsStr}
                          </td>
                          <td className="text-[var(--muted)] font-semibold">
                            {orderDate.toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                            <span className="text-xs font-normal">
                              at {orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="text-right py-4 font-mono font-bold text-base text-[var(--ink)]">
                            {formatRs(o.total_amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </DashboardShell>
  );
}
