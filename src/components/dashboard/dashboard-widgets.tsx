"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Loader2,
  Package,
  Search,
  Table2,
  Users,
  Utensils,
  UserCheck,
  History,
} from "lucide-react";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ChefHat },
  { href: "/dashboard/menu", label: "Manage Menu", icon: Utensils },
  { href: "/dashboard/tables", label: "Tables", icon: Table2 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/customers", label: "Customers", icon: CreditCard },
  { href: "/dashboard/performance", label: "My Performance", icon: BarChart3 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Ops", icon: Bot },
];

export function DashboardShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [assignedTables, setAssignedTables] = useState<string[]>([]);
  const [hasUnreadOrders, setHasUnreadOrders] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dineflow_has_unread_orders") === "true";
    }
    return false;
  });
  const [toastAlert, setToastAlert] = useState<{
    id: string;
    title: string;
    message: string;
    type: "order" | "payment";
  } | null>(null);

  // Clear unread orders badge ONLY when user explicitly visits /dashboard/orders
  useEffect(() => {
    if (pathname === "/dashboard/orders") {
      setHasUnreadOrders(false);
      localStorage.setItem("dineflow_has_unread_orders", "false");
    }
  }, [pathname]);

  // Realtime listener for new orders (orange dot badge) & payments (top-right toast alert)
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-shell-realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const newOrd = payload.new;
          if (pathname !== "/dashboard/orders") {
            setHasUnreadOrders(true);
            localStorage.setItem("dineflow_has_unread_orders", "true");
          }
          const orderTypeLabel = newOrd.order_type === "dine-in" ? "Dine-In" : "Takeaway";
          const idTag = newOrd.id.slice(0, 4).toUpperCase();
          const amount = newOrd.total_amount ? `Rs. ${newOrd.total_amount}` : "";

          // Insert into notifications database table for system history
          await supabase.from("notifications").insert({
            message: `🔔 New ${orderTypeLabel} Order #${idTag} placed (${amount || "Rs. 0"})`,
            is_read: false,
          });

          setToastAlert({
            id: newOrd.id,
            title: `🔔 New ${orderTypeLabel} Order #${idTag}!`,
            message: `New order received (${amount}). Click to view board.`,
            type: "order",
          });

          setTimeout(() => {
            setToastAlert(null);
          }, 4500);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        async (payload) => {
          const newOrd = payload.new;
          const oldOrd = payload.old;
          if (newOrd.status === "billed" && oldOrd.status !== "billed") {
            const idTag = newOrd.id.slice(0, 4).toUpperCase();
            const amount = newOrd.total_amount ? `Rs. ${newOrd.total_amount}` : "";

            // Insert into notifications database table for payment settlement history
            await supabase.from("notifications").insert({
              message: `💳 Bill Paid & Settled for Order #${idTag} (${amount || "Rs. 0"}). Table released.`,
              is_read: false,
            });

            setToastAlert({
              id: newOrd.id,
              title: `💳 Payment Settled for Order #${idTag}!`,
              message: `Payment received (${amount}). Table released to available.`,
              type: "payment",
            });

            setTimeout(() => {
              setToastAlert(null);
            }, 4500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check user role and full_name from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile && (profile.role === "admin" || profile.role === "staff")) {
        setRole(profile.role);
        setUserName(profile.full_name);

        // If staff, restrict access to only orders and tables pages
        if (profile.role === "staff") {
          const allowedStaffPages = ["/dashboard/orders", "/dashboard/tables", "/dashboard/performance", "/notifications"];
          if (!allowedStaffPages.includes(pathname)) {
            router.push("/dashboard/orders");
            return;
          }

          // Fetch tables assigned to this waiter
          const { data: staffTables } = await supabase
            .from("restaurant_tables")
            .select("table_number")
            .eq("assigned_staff_id", user.id)
            .order("table_number", { ascending: true });

          if (staffTables) {
            setAssignedTables(staffTables.map(t => `T${String(t.table_number).padStart(2, "0")}`));
          }
        }

        setCheckingAuth(false);
      } else {
        router.push("/menu");
      }
    };
    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#2b2621] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        <p className="mt-4 text-sm font-bold opacity-80">Verifying session authorization...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#2b2621] p-3 text-[var(--ink)] md:p-5">
      {/* Top-Right Floating Toast Alert Popup */}
      {toastAlert && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm rounded-[12px] border border-[#eadfce] bg-white p-4 shadow-2xl animate-in slide-in-from-top-5 duration-300 flex items-start gap-3.5">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold ${
            toastAlert.type === "order" ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"
          }`}>
            {toastAlert.type === "order" ? <ChefHat size={20} /> : <CreditCard size={20} />}
          </span>
          <div className="flex-1 pr-2">
            <h4 className="font-serif font-bold text-sm text-[var(--ink)]">{toastAlert.title}</h4>
            <p className="text-xs text-[var(--muted)] mt-0.5 font-semibold">{toastAlert.message}</p>
            <button
              onClick={() => {
                setToastAlert(null);
                if (pathname !== "/dashboard/orders") {
                  router.push("/dashboard/orders");
                }
              }}
              className="mt-2 text-[11px] font-bold text-[var(--terracotta)] underline hover:opacity-80"
            >
              View in Orders Kanban →
            </button>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-xs font-bold">✕</button>
        </div>
      )}

      <div className="grid min-h-[calc(100vh-24px)] overflow-hidden rounded-[8px] bg-[#fcfaf6] lg:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-[#eadfce] bg-[#f5efe5] p-5 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="mb-8 flex items-center gap-3">
              <Utensils className="text-[var(--terracotta)]" />
              <span className="font-serif text-2xl font-black">DineFlow</span>
            </Link>
            {nav
              .filter((item) => {
                if (role === "staff") {
                  return ["/dashboard/orders", "/dashboard/tables", "/dashboard/performance"].includes(item.href);
                }
                return true;
              })
              .map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (item.href === "/dashboard/orders") {
                        setHasUnreadOrders(false);
                      }
                    }}
                    className={`relative mb-2 flex items-center justify-between gap-3 rounded-[8px] px-4 py-3 text-sm font-bold ${
                      active ? "bg-white text-[var(--terracotta)] shadow-sm" : "text-[var(--muted)] hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} /> {item.label}
                    </div>
                    {item.href === "/dashboard/orders" && hasUnreadOrders && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--terracotta)] animate-pulse shadow-[0_0_8px_#c1622e]" />
                    )}
                  </Link>
                );
              })}
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold text-[#b24428] hover:bg-[#f8ddd5]/45 transition mt-auto"
          >
            <LogOut size={18} /> Logout
          </button>
        </aside>
        
        <section className="min-w-0 p-5 md:p-7">
          <header className="flex flex-col justify-between gap-4 border-b border-[#eadfce] pb-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--terracotta)]">
                {role === "staff" ? "Staff role: Kitchen & Waiter" : "Admin role: owner"}
              </p>
              <h1 className="font-serif text-4xl font-black">{title}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-11 items-center gap-2 rounded-full border border-[#d7c9b5] bg-white px-4 text-sm text-[var(--muted)] sm:flex">
                <Search size={16} /> Search operations
              </div>
              <Link href="/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                <Bell size={18} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--terracotta)]" />
              </Link>
            </div>
          </header>
          
          <div className="mt-6 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {nav
                .filter((item) => {
                  if (role === "staff") {
                    return ["/dashboard/orders", "/dashboard/tables", "/dashboard/performance"].includes(item.href);
                  }
                  return true;
                })
                .map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (item.href === "/dashboard/orders") {
                          setHasUnreadOrders(false);
                        }
                      }}
                      className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                        active
                          ? "bg-[var(--terracotta)] text-white shadow-sm"
                          : "border border-[#d7c9b5] bg-white text-[var(--ink)] hover:bg-[#fcfaf6]"
                      }`}
                    >
                      {item.label}
                      {item.href === "/dashboard/orders" && hasUnreadOrders && (
                        <span className="h-2 w-2 rounded-full bg-[var(--terracotta)] animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              <button
                onClick={handleSignOut}
                className="shrink-0 rounded-full border border-[#d7c9b5] bg-[#f8ddd5]/20 text-[#b24428] px-4 py-2 text-xs font-bold"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mt-6">
            {role === "staff" && (
              <div className="mb-6 rounded-[8px] bg-[#eaf2e5] border border-[#eadfce] p-4 text-[#4f7d52] font-bold text-sm flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} />
                  <span>
                    Welcome back, {userName}! You are currently assigned to Table Station:{" "}
                    {assignedTables.length === 0 ? (
                      <span className="text-[#b24428] font-black">No Tables Assigned Yet</span>
                    ) : (
                      <span className="bg-[#fcfaf6] border border-[#eadfce] px-2.5 py-0.5 rounded-[4px] text-[var(--terracotta)] font-extrabold font-mono ml-1">
                        {assignedTables.join(", ")}
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--muted)] capitalize">
                  Shift Status: Active
                </span>
              </div>
            )}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="font-mono text-3xl font-bold text-[var(--ink)]">{value}</p>
        <svg viewBox="0 0 80 28" className="h-8 w-20 text-[var(--sage)]" fill="none">
          <path d="M2 24c10-2 12-14 22-11 8 2 8 9 18 6 9-3 11-16 21-15 8 1 10 8 15 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--sage)]">{note}</p>
    </div>
  );
}

export function OverviewDashboard() {
  const [stats, setStats] = useState({
    revenue: "Rs. 0.0",
    activeOrders: "0",
    occupancy: "0%",
    lowStock: "0",
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // 1. Fetch Orders to calculate revenue and active count
      const { data: dbOrders } = await supabase.from("orders").select("status, total_amount");

      let totalRevenue = 0;
      let activeCount = 0;

      if (dbOrders) {
        dbOrders.forEach((o) => {
          if (o.status === "served" || o.status === "billed") {
            totalRevenue += Number(o.total_amount);
          }
          if (["placed", "confirmed", "preparing", "ready"].includes(o.status)) {
            activeCount++;
          }
        });
      }

      // 2. Fetch Tables to calculate occupancy
      const { data: dbTables } = await supabase.from("restaurant_tables").select("status");
      let occupiedCount = 0;
      let totalTables = dbTables?.length || 16;

      if (dbTables) {
        dbTables.forEach((t) => {
          if (t.status === "occupied" || t.status === "reserved") {
            occupiedCount++;
          }
        });
      }

      const occupancyPercent = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0;

      // 3. Fetch Low Stock Alerts count
      const { data: dbInv } = await supabase.from("inventory_items").select("current_stock, reorder_threshold");
      let lowStockCount = 0;

      if (dbInv) {
        dbInv.forEach((i) => {
          if (Number(i.current_stock) < Number(i.reorder_threshold)) {
            lowStockCount++;
          }
        });
      }

      setStats({
        revenue: formatRs(totalRevenue),
        activeOrders: String(activeCount),
        occupancy: `${occupancyPercent}%`,
        lowStock: String(lowStockCount).padStart(2, "0"),
      });
    } catch (err) {
      console.error("Failed to load dashboard overview stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to changes across orders, tables, and inventory tables
    const ordersChannel = supabase
      .channel("overview-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today's revenue" value={stats.revenue} note="Calculated from served orders" />
        <StatCard label="Active orders" value={stats.activeOrders} note="Orders in prep pipelines" />
        <StatCard label="Occupancy" value={stats.occupancy} note="Tables reserved or seated" />
        <StatCard label="Low stock items" value={stats.lowStock} note="Needs urgent replenishment" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <LiveOrders />
        <AIInsightCard />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <TableGrid compact />
        <InventoryBars />
      </div>
    </div>
  );
}

export function LiveOrders() {
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total_amount,
          estimated_ready_at,
          restaurant_tables(table_number),
          order_items(
            quantity,
            menu_items(name)
          )
        `)
        .in("status", ["placed", "confirmed", "preparing", "ready"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setOrdersList(data || []);
    } catch (err) {
      console.error("Failed to fetch live orders feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();

    const channel = supabase
      .channel("overview-live-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchLiveOrders())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Live active orders</h2>
        <span className="rounded-full bg-[#f8eadf] px-3 py-1 text-xs font-bold text-[var(--terracotta)]">Realtime DB sync</span>
      </div>
      
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={24} />
        </div>
      ) : ordersList.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-8">No active orders right now.</p>
      ) : (
        <div className="space-y-3">
          {ordersList.map((order) => {
            const itemsFormatted = order.order_items
              .map((oi: any) => `${oi.menu_items?.name || "Item"} x${oi.quantity}`)
              .join(", ");

            return (
              <div key={order.id} className="grid gap-3 rounded-[8px] border border-[#eadfce] p-4 sm:grid-cols-[76px_1fr_74px_112px] sm:items-center bg-[#fcfaf6]">
                <p className="font-mono font-bold">#{order.id.slice(0, 4).toUpperCase()}</p>
                <p className="text-sm text-[var(--muted)]">
                  <span className="font-bold text-[var(--ink)]">
                    {order.restaurant_tables?.table_number ? `T${String(order.restaurant_tables.table_number).padStart(2, "0")}` : "Takeaway"}
                  </span>{" "}
                  - {itemsFormatted}
                </p>
                <p className="font-mono text-sm font-bold text-[var(--sage)]">Active</p>
                <button className="rounded-full bg-[#f3eee5] px-3 py-2 text-xs font-bold capitalize text-center">
                  {order.status}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AIInsightCard() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_insights")
          .select("content")
          .order("generated_at", { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          setInsights(data.map((ins) => ins.content));
        } else {
          // Fallback to static insights
          setInsights([
            "Butter Bowl is leading sales by 22% today.",
            "Average bill value is rising after 7 PM.",
            "Restock mint before tomorrow's lunch rush.",
          ]);
        }
      } catch (err) {
        console.error("Failed to load AI insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">AI daily digest</h2>
      
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={24} />
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
          {insights.map((insight, idx) => (
            <p key={idx}>
              <Bot className="mr-2 inline text-[var(--terracotta)]" size={16} />
              {insight}
            </p>
          ))}
        </div>
      )}
      <Link href="/dashboard/ai" className="mt-5 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]">
        Open AI ops
      </Link>
    </div>
  );
}

export function TableGrid({ compact = false }: { compact?: boolean }) {
  const [tablesList, setTablesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const { data } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("table_number", { ascending: true });

      setTablesList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    const channel = supabase
      .channel("overview-tables")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => fetchTables())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-[var(--terracotta)]" size={24} />
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">Floor plan</h2>
      <div className={`mt-5 grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
        {tablesList.map((table) => (
          <button key={table.id} className={`rounded-[8px] p-4 text-left text-xs font-bold ${
            table.status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
            table.status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
            table.status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
            "bg-[#f8ddd5] text-[#b24428]"
          }`}>
            <span className="block text-base">T{String(table.table_number).padStart(2, "0")}</span>
            <span className="capitalize">{table.status}</span>
            {!compact && <span className="mt-2 block text-[var(--muted)]">Seats {table.capacity}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InventoryBars() {
  const [invList, setInvList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      setInvList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel("overview-inventory")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => fetchInventory())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-[var(--terracotta)]" size={24} />
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">Inventory watch</h2>
      <div className="mt-5 space-y-4">
        {invList.map((row) => {
          const percent = Math.min(100, Math.round((Number(row.current_stock) / Number(row.reorder_threshold)) * 100));
          const low = Number(row.current_stock) < Number(row.reorder_threshold);
          
          return (
            <div key={row.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold">{row.name}</span>
                <span className={low ? "font-bold text-[var(--terracotta)]" : "text-[var(--muted)]"}>
                  {row.current_stock} {row.unit} / min {row.reorder_threshold} {row.unit}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f3eee5]">
                <div className={`h-full rounded-full ${low ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RevenueChart() {
  const values = [18, 24, 20, 32, 28, 45, 42, 58, 51, 68, 76, 72];
  const max = Math.max(...values);
  
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Sales pulse</h2>
        <p className="font-mono font-bold text-[var(--terracotta)]">{formatRs(42800)}</p>
      </div>
      <div className="mt-8 flex h-56 items-end gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-[8px] bg-[var(--terracotta)]" style={{ height: `${(value / max) * 100}%`, opacity: 0.45 + index / 24 }} />
            <span className="text-xs text-[var(--muted)]">{index + 11}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
