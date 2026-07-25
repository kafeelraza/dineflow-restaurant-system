"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock3, ArrowRight, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

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
  profiles?: {
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
          restaurant_tables(
            table_number,
            assigned_staff_id
          ),
          order_items(
            quantity,
            menu_items(name)
          )
        `)
        .neq("status", "billed");

      // 4. Filter orders for staff isolation
      if (role === "staff") {
        // Staff should only see:
        // A. Orders directly assigned to them (for takeaway or specific task)
        // B. Dine-in orders linked to tables assigned to them
        const { data: staffTables } = await supabase
          .from("restaurant_tables")
          .select("id")
          .eq("assigned_staff_id", user.id);

        const assignedTableIds = staffTables?.map((t) => t.id) || [];

        // Apply complex query condition using OR filter on table_id or assigned_staff_id
        if (assignedTableIds.length > 0) {
          query = query.or(`assigned_staff_id.eq.${user.id},table_id.in.(${assignedTableIds.join(",")})`);
        } else {
          query = query.eq("assigned_staff_id", user.id);
        }
      }

      const { data: ordersData, error: ordersErr } = await query.order("created_at", { ascending: true });
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

  const handleSettleAndArchive = (orderId: string) => {
    setSettlingOrderId(orderId);
  };

  const confirmSettleAndArchive = async () => {
    if (!settlingOrderId) return;
    const orderId = settlingOrderId;
    setSettlingOrderId(null);
    setUpdatingId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "billed" })
        .eq("id", orderId);

      if (error) throw error;
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
        <div className="grid gap-4 xl:grid-cols-5">
          {columns.map((column) => (
            <section key={column} className="rounded-[8px] border border-[#eadfce] bg-white p-4 flex flex-col min-h-[70vh]">
              <div className="flex items-center justify-between border-b border-[#eadfce] pb-3 mb-4">
                <h2 className="font-serif text-xl font-bold capitalize">{column}</h2>
                <span className="rounded-full bg-[#f3eee5] px-2 py-0.5 text-xs font-mono font-bold text-[var(--muted)]">
                  {localOrders.filter((o) => o.status === column).length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-1">
                {localOrders
                  .filter((order) => order.status === column)
                  .map((order) => {
                    const formattedItems = order.order_items
                      .map((oi) => `${oi.menu_items?.name || "Item"} x${oi.quantity}`)
                      .join(", ");

                    // Resolve the waiter name dynamically (dine-in table server, or directly assigned staff)
                    const serverName = order.order_type === "dine-in"
                      ? (staffMembers.find((s) => s.id === order.restaurant_tables?.assigned_staff_id)?.full_name || "Unassigned")
                      : (staffMembers.find((s) => s.id === order.assigned_staff_id)?.full_name || "Unassigned");

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
                                ? `T${String(order.restaurant_tables?.table_number || "??").padStart(2, "0")}`
                                : "Takeaway"}
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-xs text-[var(--ink)] leading-relaxed">
                            {formattedItems || "No items ordered"}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#eadfce] space-y-3">
                          {/* Waiter assignment / dropdown info */}
                          {userRole === "admin" ? (
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

                          {/* Time and Price information */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] font-mono">
                              <Clock3 size={11} />
                              {order.estimated_ready_at
                                ? new Date(order.estimated_ready_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "12 mins"}
                            </span>
                            <span className="font-mono font-bold text-[var(--ink)]">
                              {formatRs(order.total_amount)}
                            </span>
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
          ))}
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
