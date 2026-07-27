"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock3, ArrowRight, UserCheck, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";
import { claimOrder } from "@/lib/supabaseHelpers";

type OrderStatus = "placed" | "confirmed" | "preparing" | "ready" | "served";
const columns: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "served"];

interface OrderItem {
  quantity: number;
  menu_items: {
    name: string;
  } | null;
}

interface StaffMember {
  id: string;
  full_name: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  order_type: "dine-in" | "takeaway";
  total_amount: number;
  created_at: string;
  estimated_ready_at: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  assigned_staff_id: string | null;
  table_id: string | null;
  profiles?: {
    full_name: string;
  } | null;
  waiter_profile?: {
    full_name: string;
  } | null;
  restaurant_tables?: {
    table_number: number;
    assigned_staff_id: string | null;
    profiles?: {
      full_name: string;
    } | null;
  } | null;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [userRole, setUserRole] = useState<string>("customer");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigningMap, setAssigningMap] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);
  const [orderFilterMode, setOrderFilterMode] = useState<string>("all_assigned");
  const [activeColumnTab, setActiveColumnTab] = useState<string>("all");

  const fetchOrdersData = async () => {
    try {
      // 1. Fetch user role details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "customer";
      setUserRole(role);

      // 2. Fetch staff members list (for dropdown and client-side name lookup)
      const { data: staffData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "staff");
      setStaffMembers((staffData as StaffMember[]) || []);

      // 3. Build active orders query (exclude completed 'billed' ones)
      let query = supabase
        .from("orders")
        .select(`
          id,
          status,
          order_type,
          total_amount,
          created_at,
          estimated_ready_at,
          guest_name,
          guest_phone,
          assigned_staff_id,
          table_id,
          restaurant_tables(
            table_number,
            assigned_staff_id,
            profiles(
              full_name
            )
          ),
          waiter_profile:profiles!orders_assigned_staff_id_fkey(
            full_name
          ),
          order_items(
            quantity,
            menu_items(name)
          )
        `)
        .neq("status", "billed");

      const { data: ordersData, error: ordersErr } = await query.order("created_at", { ascending: false });
      if (ordersErr) throw ordersErr;

      const loadedOrders = (ordersData as any[]) || [];
      setLocalOrders(loadedOrders);

      // Pre-fill dropdown selections
      const initialMap: Record<string, string> = {};
      loadedOrders.forEach((o) => {
        initialMap[o.id] = o.assigned_staff_id || "";
      });
      setAssigningMap(initialMap);
    } catch (err) {
      console.error("Orders fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("active-orders-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrdersData())
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => fetchOrdersData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const nextIndex = columns.indexOf(currentStatus) + 1;
    if (nextIndex >= columns.length) return; // Already served

    const nextStatus = columns[nextIndex];
    setUpdatingId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrdersData();
    } catch (err: any) {
      alert("Failed to advance order status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignStaff = async (orderId: string) => {
    const staffId = assigningMap[orderId];
    setUpdatingId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ assigned_staff_id: staffId || null })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrdersData();
    } catch (err: any) {
      alert("Failed to assign staff: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    try {
      setUpdatingId(orderId);
      await claimOrder(orderId);
      fetchOrdersData();
    } catch (err: any) {
      alert("Failed to claim order: " + (err.message || "Could not claim order"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSettleAndArchive = (orderId: string) => {
    setSettlingOrderId(orderId);
  };

  const confirmSettleAndArchive = async () => {
    if (!settlingOrderId) return;
    const orderId = settlingOrderId;
    const orderToSettle = localOrders.find((o) => o.id === orderId);
    setSettlingOrderId(null);
    setUpdatingId(orderId);

    try {
      // 1. Mark order as settled
      const { error } = await supabase
        .from("orders")
        .update({ status: "billed" })
        .eq("id", orderId);

      if (error) throw error;

      // 2. Release the associated table back to available
      if (orderToSettle && orderToSettle.table_id) {
        await supabase
          .from("restaurant_tables")
          .update({ status: "available" })
          .eq("id", orderToSettle.table_id);
      }

      fetchOrdersData();
    } catch (err: any) {
      alert("Failed to settle order: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardShell
      title={userRole === "staff" ? "My Station Tasks" : "Order Control Desk"}
      subtitle={
        userRole === "staff"
          ? "View and advance active order workflows assigned directly to you or your table stations."
          : "Assign dispatch staff to takeaway orders, monitor operational statuses, and settle completed sales."
      }
    >
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Order Filter Radio Bar */}
          <div className="bg-white border border-[#eadfce] p-4 rounded-[12px] shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfce] pb-2.5">
              <span className="text-xs font-extrabold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-[var(--terracotta)]" /> Filter Order Queue:
              </span>
              <span className="text-xs font-bold text-[var(--terracotta)] font-mono">
                Active Filter Mode: <span className="capitalize">{orderFilterMode.replace("_", " ")}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {userRole === "staff" ? (
                <>
                  {/* Staff Radio Option 1: All My Assigned */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "all_assigned"
                      ? "border-[var(--terracotta)] bg-[#f8eadf] text-[var(--terracotta)] shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="staffOrderFilter"
                      value="all_assigned"
                      checked={orderFilterMode === "all_assigned"}
                      onChange={() => setOrderFilterMode("all_assigned")}
                      className="accent-[#c1622e] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🎯 My Assigned Orders ({
                      localOrders.filter((o) => o.assigned_staff_id === userId || o.restaurant_tables?.assigned_staff_id === userId).length
                    })</span>
                  </label>

                  {/* Staff Radio Option 2: My Dine-In Only */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "my_dine_in"
                      ? "border-[var(--terracotta)] bg-[#f8eadf] text-[var(--terracotta)] shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="staffOrderFilter"
                      value="my_dine_in"
                      checked={orderFilterMode === "my_dine_in"}
                      onChange={() => setOrderFilterMode("my_dine_in")}
                      className="accent-[#c1622e] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🍽️ My Dine-In Tables ({
                      localOrders.filter((o) => (o.assigned_staff_id === userId || o.restaurant_tables?.assigned_staff_id === userId) && o.order_type === "dine-in").length
                    })</span>
                  </label>

                  {/* Staff Radio Option 3: My Takeaway Only */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "my_takeaway"
                      ? "border-[var(--sage)] bg-[#eaf2e5] text-[var(--sage)] shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="staffOrderFilter"
                      value="my_takeaway"
                      checked={orderFilterMode === "my_takeaway"}
                      onChange={() => setOrderFilterMode("my_takeaway")}
                      className="accent-[#4f7d52] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🛍️ My Takeaways ({
                      localOrders.filter((o) => (o.assigned_staff_id === userId || o.restaurant_tables?.assigned_staff_id === userId) && o.order_type === "takeaway").length
                    })</span>
                  </label>

                  {/* Staff Radio Option 4: All Kitchen Orders */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "all_kitchen"
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="staffOrderFilter"
                      value="all_kitchen"
                      checked={orderFilterMode === "all_kitchen"}
                      onChange={() => setOrderFilterMode("all_kitchen")}
                      className="accent-[#2b2621] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🌐 All Kitchen Orders ({localOrders.length})</span>
                  </label>
                </>
              ) : (
                <>
                  {/* Admin Radio Option 1: All Orders */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "all"
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="adminOrderFilter"
                      value="all"
                      checked={orderFilterMode === "all"}
                      onChange={() => setOrderFilterMode("all")}
                      className="accent-[#2b2621] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>All Restaurant Orders ({localOrders.length})</span>
                  </label>

                  {/* Admin Radio Option 2: Dine-In Only */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "dine-in"
                      ? "border-[var(--terracotta)] bg-[#f8eadf] text-[var(--terracotta)] shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="adminOrderFilter"
                      value="dine-in"
                      checked={orderFilterMode === "dine-in"}
                      onChange={() => setOrderFilterMode("dine-in")}
                      className="accent-[#c1622e] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🍽️ Dine-In Only ({localOrders.filter((o) => o.order_type === "dine-in").length})</span>
                  </label>

                  {/* Admin Radio Option 3: Takeaway Only */}
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition select-none ${
                    orderFilterMode === "takeaway"
                      ? "border-[var(--sage)] bg-[#eaf2e5] text-[var(--sage)] shadow-xs"
                      : "border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="adminOrderFilter"
                      value="takeaway"
                      checked={orderFilterMode === "takeaway"}
                      onChange={() => setOrderFilterMode("takeaway")}
                      className="accent-[#4f7d52] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>🛍️ Takeaway Only ({localOrders.filter((o) => o.order_type === "takeaway").length})</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Mobile Column Tab Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
            <button
              onClick={() => setActiveColumnTab("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeColumnTab === "all"
                  ? "bg-[var(--terracotta)] text-white shadow-sm"
                  : "border border-[#d7c9b5] bg-white text-[var(--ink)]"
              }`}
            >
              All Columns
            </button>
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => setActiveColumnTab(col)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition capitalize ${
                  activeColumnTab === col
                    ? "bg-[var(--terracotta)] text-white shadow-sm"
                    : "border border-[#d7c9b5] bg-white text-[var(--ink)]"
                }`}
              >
                {col} ({localOrders.filter((o) => o.status === col).length})
              </button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            {columns.map((column) => {
              if (activeColumnTab !== "all" && activeColumnTab !== column) {
                return null;
              }

              const displayedOrders = localOrders.filter((o) => {
                const isAssignedToMe = o.assigned_staff_id === userId || o.restaurant_tables?.assigned_staff_id === userId;

                if (userRole === "staff") {
                  if (orderFilterMode === "my_dine_in") {
                    return isAssignedToMe && o.order_type === "dine-in";
                  }
                  if (orderFilterMode === "my_takeaway") {
                    return isAssignedToMe && o.order_type === "takeaway";
                  }
                  if (orderFilterMode === "all_assigned") {
                    return isAssignedToMe;
                  }
                  if (orderFilterMode === "all_kitchen") {
                    return true;
                  }
                  return isAssignedToMe;
                } else {
                  // Admin / Owner
                  if (orderFilterMode === "dine-in") return o.order_type === "dine-in";
                  if (orderFilterMode === "takeaway") return o.order_type === "takeaway";
                  return true;
                }
              });

              return (
                <section key={column} className="rounded-[8px] border border-[#eadfce] bg-white p-4 flex flex-col min-h-[70vh]">
                  <div className="flex items-center justify-between border-b border-[#eadfce] pb-3 mb-4">
                    <h2 className="font-serif text-xl font-bold capitalize">{column}</h2>
                    <span className="rounded-full bg-[#f3eee5] px-2 py-0.5 text-xs font-mono font-bold text-[var(--muted)]">
                      {displayedOrders.filter((o) => o.status === column).length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-1">
                    {displayedOrders
                      .filter((order) => order.status === column)
                      .map((order) => {
                    const formattedItems = order.order_items
                      .map((oi) => `${oi.menu_items?.name || "Item"} x${oi.quantity}`)
                      .join(", ");

                    // Resolve the waiter name dynamically (dine-in table server, or directly assigned staff)
                    const serverName = order.order_type === "dine-in"
                      ? (order.restaurant_tables?.profiles?.full_name || "Unassigned")
                      : (order.waiter_profile?.full_name || "Unassigned");

                    return (
                      <article key={order.id} className="rounded-[8px] bg-[#fcfaf6] p-4 border border-[#eadfce] shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between gap-2 items-start">
                            <div>
                              <p className="font-mono font-bold text-xs text-[var(--muted)]">
                                #{order.id.slice(0, 4).toUpperCase()}
                              </p>
                              <h3 className="font-bold text-sm mt-1">{order.guest_name || "Guest customer"}</h3>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 uppercase tracking-wider ${
                              order.order_type === "dine-in" ? "bg-[#eaf2e5] text-[#4f7d52]" : "bg-[#fbeead] text-[#a07012]"
                            }`}>
                              {order.order_type === "dine-in"
                                ? `Dine-In (T${String(order.restaurant_tables?.table_number || "??").padStart(2, "0")})`
                                : "Takeaway"}
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-xs text-[var(--ink)] leading-relaxed">
                            {formattedItems || "No items ordered"}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#eadfce] space-y-3">
                          {/* Waiter assignment / dropdown info */}
                          {userRole === "admin" && column !== "served" ? (
                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider">
                                Dispatch Server
                              </label>
                              <div className="flex gap-1">
                                <select
                                  value={assigningMap[order.id] || ""}
                                  onChange={(e) =>
                                    setAssigningMap({ ...assigningMap, [order.id]: e.target.value })
                                  }
                                  className="h-8 flex-1 rounded-[6px] border border-[#d7c9b5] bg-white px-2 text-[10px] font-bold outline-none"
                                >
                                  <option value="">Unassigned</option>
                                  {staffMembers.map((sm) => (
                                    <option key={sm.id} value={sm.id}>
                                      {sm.full_name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  disabled={updatingId === order.id}
                                  onClick={() => handleAssignStaff(order.id)}
                                  className="h-8 px-2 rounded-[6px] bg-[var(--terracotta)] text-white text-[10px] font-bold hover:scale-[1.02] disabled:opacity-50"
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] font-semibold text-[var(--muted)] flex justify-between">
                              <span>Assigned Server:</span>
                              <span className="font-bold text-[var(--terracotta)] uppercase">
                                {serverName || "Unassigned"}
                              </span>
                            </div>
                          )}

                          {userRole === "staff" && !order.assigned_staff_id && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => handleClaimOrder(order.id)}
                              className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-[#d7c9b5] bg-white text-xs font-bold text-[var(--terracotta)] hover:bg-[var(--terracotta)] hover:text-white transition disabled:opacity-50 shadow-sm"
                            >
                              <UserCheck size={14} /> Claim this order
                            </button>
                          )}

                          {/* Time and Price information */}
                          <div className="mt-2 flex flex-col gap-1.5 border-t border-[#eadfce] pt-2.5 text-xs">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--muted)] font-mono">
                              <span className="flex items-center gap-1 font-bold text-[var(--ink)]">
                                <Clock3 size={11} className="text-[var(--terracotta)]" />
                                Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span>
                                {order.estimated_ready_at
                                  ? `Est: ${new Date(order.estimated_ready_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                  : "~12m prep"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Order Total</span>
                              <span className="font-mono text-sm font-bold text-[var(--terracotta)]">{formatRs(order.total_amount)}</span>
                            </div>
                          </div>

                          {/* Action Button: Staff can Move, Admin can Archive Served orders */}
                          {userRole === "staff" && column !== "served" && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => handleAdvanceStatus(order.id, order.status)}
                              className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] text-xs font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
                            >
                              {updatingId === order.id ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <>
                                  Move <ArrowRight size={12} />
                                </>
                              )}
                            </button>
                          )}

                          {userRole === "admin" && column === "served" && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => handleSettleAndArchive(order.id)}
                              className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#eaf2e5] border border-[#eadfce] text-[#4f7d52] text-xs font-bold transition hover:scale-[1.01] disabled:opacity-50"
                            >
                              {updatingId === order.id ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <>
                                  <CheckCircle2 size={12} /> Settle & Archive
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>
          );
        })}
        </div>
      </div>
      )}
      {settlingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[12px] bg-[#fcfaf6] p-6 border border-[#eadfce] shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f8ddd5] text-[var(--terracotta)]">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--ink)]">Settle & Archive Order</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-semibold">
              Are you sure you want to settle the payment for this order? This will complete the order and move it to your sales history logs.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingOrderId(null)}
                className="h-10 flex-1 rounded-full border border-[#d7c9b5] bg-white text-xs font-bold text-[var(--ink)] hover:bg-[#f5f0e6] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSettleAndArchive}
                className="h-10 flex-1 rounded-full bg-[var(--terracotta)] text-xs font-bold text-white hover:scale-[1.01] transition shadow-sm"
              >
                Settle & Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
