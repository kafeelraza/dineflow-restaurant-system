"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, TrendingUp, DollarSign, Award, Clock } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { Card } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import { formatRs } from "@/lib/data";

interface ServedOrder {
  id: string;
  total_amount: number;
  created_at: string;
  order_type: string;
  status: string;
  restaurant_tables?: {
    table_number: number;
  } | null;
  order_items: {
    quantity: number;
  }[];
}

type DatePreset = "today" | "yesterday" | "last7days" | "thismonth" | "lastmonth" | "custom";

export default function StaffPerformancePage() {
  const [orders, setOrders] = useState<ServedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffName, setStaffName] = useState("");

  // Filters
  const [preset, setPreset] = useState<DatePreset>("thismonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // 1. Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) setStaffName(profile.full_name);

      // 3. Query all served/billed orders assigned to this staff member
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          created_at,
          order_type,
          status,
          restaurant_tables (
            table_number
          ),
          order_items (
            quantity
          )
        `)
        .eq("assigned_staff_id", user.id)
        .in("status", ["served", "billed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any[]) || []);
    } catch (err) {
      console.error("Failed to load staff performance metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Filter logic on state updates
  useEffect(() => {
    let result = [...orders];
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    
    if (preset === "today") {
      result = result.filter(o => new Date(o.created_at) >= startOfToday);
    } else if (preset === "yesterday") {
      result = result.filter(o => {
        const d = new Date(o.created_at);
        return d >= startOfYesterday && d < startOfToday;
      });
    } else if (preset === "last7days") {
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(o => new Date(o.created_at) >= sevenDaysAgo);
    } else if (preset === "thismonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(o => new Date(o.created_at) >= startOfMonth);
    } else if (preset === "lastmonth") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      result = result.filter(o => {
        const d = new Date(o.created_at);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      });
    } else if (preset === "custom") {
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        result = result.filter(o => new Date(o.created_at) >= sDate);
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        result = result.filter(o => new Date(o.created_at) <= eDate);
      }
    }

    setFilteredOrders(result);
  }, [orders, preset, startDate, endDate]);

  // Aggregate stats from the filtered list
  const totalOrdersCount = filteredOrders.length;
  const totalSalesCount = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const avgOrderValue = totalOrdersCount > 0 ? totalSalesCount / totalOrdersCount : 0;

  // Breakdown counts day-by-day (grouped for selected range)
  const getDailyBreakdown = () => {
    const dailyMap: Record<string, { dateLabel: string; count: number; sales: number }> = {};
    
    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });

      if (!dailyMap[key]) {
        dailyMap[key] = { dateLabel, count: 0, sales: 0 };
      }
      dailyMap[key].count += 1;
      dailyMap[key].sales += Number(o.total_amount);
    });

    return Object.values(dailyMap).sort((a, b) => new Date(b.dateLabel).getTime() - new Date(a.dateLabel).getTime());
  };

  const dailyBreakdown = getDailyBreakdown();

  return (
    <DashboardShell title="My performance log" subtitle={`Serve statistics, transaction details, and historical coverage logs for ${staffName || "wait staff"}.`}>
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-white p-5 border border-[#eadfce] shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] font-extrabold uppercase tracking-wider">Orders Served</p>
                <h3 className="text-2xl font-serif font-bold text-[var(--ink)] mt-0.5">{totalOrdersCount}</h3>
              </div>
            </Card>
            <Card className="bg-white p-5 border border-[#eadfce] shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)]">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] font-extrabold uppercase tracking-wider">Sales Covered</p>
                <h3 className="text-2xl font-serif font-bold text-[var(--ink)] mt-0.5">{formatRs(totalSalesCount)}</h3>
              </div>
            </Card>
            <Card className="bg-white p-5 border border-[#eadfce] shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf0cf] text-[#a07012]">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] font-extrabold uppercase tracking-wider">Average Ticket</p>
                <h3 className="text-2xl font-serif font-bold text-[var(--ink)] mt-0.5">{formatRs(avgOrderValue)}</h3>
              </div>
            </Card>
          </div>

          {/* Filtering Workspace Section */}
          <Card className="bg-white p-5 border border-[#eadfce] shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#eadfce] pb-3">
                <h2 className="font-serif text-xl font-bold flex items-center gap-1.5 text-[var(--ink)]">
                  <Calendar size={18} className="text-[var(--terracotta)]" /> Filter Duty History
                </h2>
                <span className="text-[10px] uppercase font-extrabold text-[var(--muted)] bg-[#fcfaf6] border border-[#eadfce] px-2 py-0.5 rounded-[4px]">
                  Preset: {preset}
                </span>
              </div>

              {/* Presets List */}
              <div className="flex flex-wrap gap-2">
                {(["today", "yesterday", "last7days", "thismonth", "lastmonth", "custom"] as DatePreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`h-9 px-4 rounded-full text-xs font-bold transition capitalize ${
                      preset === p 
                        ? "bg-[var(--terracotta)] text-white" 
                        : "border border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-[#eadfce]/20"
                    }`}
                  >
                    {p === "last7days" ? "Last 7 Days" : p === "thismonth" ? "This Month" : p === "lastmonth" ? "Last Month" : p}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs Range */}
              {preset === "custom" && (
                <div className="grid gap-3 sm:grid-cols-2 mt-2 p-4 bg-[#fcfaf6] rounded-[8px] border border-[#eadfce]/60 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#d7c9b5] bg-white px-3 text-xs outline-none focus:border-[var(--terracotta)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#d7c9b5] bg-white px-3 text-xs outline-none focus:border-[var(--terracotta)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Breakdown and Table Logs */}
          <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            {/* Daily logs breakdown card */}
            <Card className="bg-white p-5 border border-[#eadfce] shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4">Daily Logs Summary</h2>
              {dailyBreakdown.length === 0 ? (
                <p className="text-xs italic text-[var(--muted)] mt-2">No shift logs found for this date range.</p>
              ) : (
                <div className="space-y-3">
                  {dailyBreakdown.map((row) => (
                    <div key={row.dateLabel} className="flex justify-between items-center p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce]/50">
                      <div>
                        <p className="font-bold text-xs text-[var(--ink)]">{row.dateLabel}</p>
                        <p className="text-[10px] text-[var(--muted)] font-semibold mt-0.5">{row.count} orders served</p>
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--terracotta)]">{formatRs(row.sales)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* List of individual orders served */}
            <Card className="bg-white p-5 border border-[#eadfce] shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4">Transaction History</h2>
              {filteredOrders.length === 0 ? (
                <p className="text-xs italic text-[var(--muted)] mt-2">No individual transactions recorded.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredOrders.map((ord) => {
                    const timeStr = new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    const itemsCount = ord.order_items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <div key={ord.id} className="p-3.5 border border-[#eadfce] rounded-[8px] flex items-center justify-between text-xs hover:border-[var(--terracotta)] transition bg-white shadow-sm">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[var(--ink)]">Order #{ord.id.slice(0,4).toUpperCase()}</p>
                          <p className="text-[10px] text-[var(--muted)] font-semibold capitalize">
                            {ord.order_type === "dine-in" 
                              ? `Dine-In (T${String(ord.restaurant_tables?.table_number).padStart(2, "0")})` 
                              : "Takeaway"
                            } • {itemsCount} items
                          </p>
                          <p className="text-[9px] text-[var(--muted)] font-bold flex items-center gap-1">
                            <Clock size={10} /> {dateStr} {timeStr}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[var(--terracotta)]">{formatRs(ord.total_amount)}</p>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold bg-[#eaf2e5] text-[#4f7d52] px-1.5 py-0.5 rounded-[4px] border border-[#eadfce]">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
