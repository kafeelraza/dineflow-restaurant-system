"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, Link as LinkIcon, XCircle, UserCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { supabase } from "@/lib/supabaseClient";

interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
}

interface RestaurantTable {
  id: string;
  table_number: number;
  assigned_staff_id: string | null;
}

interface OrderInfo {
  id: string;
  table_id: string;
  status: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [tablesList, setTablesList] = useState<RestaurantTable[]>([]);
  const [ordersList, setOrdersList] = useState<OrderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableMap, setSelectedTableMap] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // 1. Fetch staff members
      const { data: staffData } = await supabase
        .from("profiles")
        .select("id, full_name, role, phone")
        .eq("role", "staff");

      setStaffList((staffData as StaffProfile[]) || []);

      // 2. Fetch tables with assignment information
      const { data: tablesData } = await supabase
        .from("restaurant_tables")
        .select("id, table_number, assigned_staff_id")
        .order("table_number", { ascending: true });

      const loadedTables = (tablesData as RestaurantTable[]) || [];
      setTablesList(loadedTables);

      // 3. Fetch active orders (placed, confirmed, preparing, served - excluding billed/completed)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, table_id, status")
        .in("status", ["placed", "confirmed", "preparing", "served"]);

      setOrdersList((ordersData as OrderInfo[]) || []);

      // Pre-select first table for each staff dropdown
      if (loadedTables.length > 0) {
        const initialMap: Record<string, string> = {};
        staffData?.forEach((s: any) => {
          initialMap[s.id] = loadedTables[0].id;
        });
        setSelectedTableMap(initialMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to changes on restaurant_tables and orders
    const channel = supabase
      .channel("staff-dashboard-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAssignTable = async (staffId: string) => {
    const tableId = selectedTableMap[staffId];
    if (!tableId) return;

    setUpdatingId(staffId);
    try {
      const res = await fetch("/api/assign-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", staffId, tableId }),
      });
      const result = await res.json();

      if (!result.success) throw new Error(result.error);
      fetchData(); // Reload assignments
    } catch (err: any) {
      alert("Failed to assign table: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearAssignments = async (staffId: string) => {
    setUpdatingId(staffId);
    try {
      const res = await fetch("/api/assign-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", staffId }),
      });
      const result = await res.json();

      if (!result.success) throw new Error(result.error);
      fetchData();
    } catch (err: any) {
      alert("Failed to clear assignments: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveSingleTable = async (staffId: string, tableId: string) => {
    setUpdatingId(staffId);
    try {
      const res = await fetch("/api/assign-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", staffId: null, tableId }),
      });
      const result = await res.json();

      if (!result.success) throw new Error(result.error);
      fetchData();
    } catch (err: any) {
      alert("Failed to remove table assignment: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardShell title="Staff coordination" subtitle="Assign wait staff to specific floor plan tables, manage workloads, and monitor table coverages.">
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-[8px] bg-white border border-[#eadfce] p-8 text-center max-w-xl mx-auto mt-6">
          <Users className="mx-auto text-[var(--muted)] mb-3" size={32} />
          <h3 className="font-serif text-2xl font-bold">No Staff Profiles Registered</h3>
          <p className="text-sm text-[var(--muted)] mt-2">
            Register new staff accounts at /signup (by choosing the 'staff' role or manually editing user role in profiles table) to manage shifts and assignments.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {staffList.map((member) => {
            // Find tables assigned to this member
            const memberTables = tablesList.filter((t) => t.assigned_staff_id === member.id);
            const assignedTables = memberTables.map((t) => `T${String(t.table_number).padStart(2, "0")}`);

            // Determine if the staff is currently Busy based on active orders on their assigned tables
            const activeOrders = ordersList.filter((o) => memberTables.some((t) => t.id === o.table_id));
            const isBusy = activeOrders.length > 0;

            return (
              <article key={member.id} className="rounded-[8px] border border-[#eadfce] bg-white p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isBusy ? "bg-[#f8ddd5] text-[#b24428]" : "bg-[#eaf2e5] text-[#4f7d52]"
                    }`}>
                      {isBusy ? "Busy" : "Free"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--muted)]">Role: Wait staff</span>
                  </div>
                  
                  <h2 className="mt-4 font-serif text-2xl font-bold">{member.full_name}</h2>
                  <p className="text-xs text-[var(--muted)] mt-1 font-mono">{member.phone || "No phone added"}</p>
                  
                  <div className="mt-5 space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-[var(--muted)]">Shift Zone:</span>
                      <b className="text-[var(--ink)]">Floor Area A</b>
                    </p>
                    
                    <div className="mt-3">
                      <span className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                        Assigned Tables
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-2 min-h-8">
                        {memberTables.length === 0 ? (
                          <span className="text-xs italic text-[var(--muted)]">No tables assigned</span>
                        ) : (
                          memberTables.map((t) => (
                            <span key={t.id} className="inline-flex items-center gap-1 rounded-[4px] bg-[#f8eadf] px-2.5 py-1 text-xs font-bold text-[var(--terracotta)] border border-[#eadfce]">
                              T{String(t.table_number).padStart(2, "0")}
                              <button
                                type="button"
                                disabled={updatingId === member.id}
                                onClick={() => handleRemoveSingleTable(member.id, t.id)}
                                className="ml-1 hover:text-red-700 font-extrabold text-[10px] cursor-pointer shrink-0 transition"
                                title="Remove table coverage"
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {isBusy && (
                      <div className="mt-4 rounded-[6px] bg-[#f8ddd5]/20 p-3 border border-[#f8ddd5]/45">
                        <span className="block text-[10px] font-bold text-[#b24428] uppercase tracking-wider mb-1.5">
                          Active Orders (Serving)
                        </span>
                        <div className="space-y-1">
                          {activeOrders.map((o) => {
                            const tbl = memberTables.find((t) => t.id === o.table_id);
                            return (
                              <div key={o.id} className="text-xs text-[var(--ink)] font-bold flex justify-between">
                                <span>Table T{String(tbl?.table_number).padStart(2, "0")}</span>
                                <span className="capitalize text-[var(--terracotta)] font-semibold">({o.status})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-[#eadfce] pt-4 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={selectedTableMap[member.id] || ""}
                      onChange={(e) =>
                        setSelectedTableMap({ ...selectedTableMap, [member.id]: e.target.value })
                      }
                      className="h-10 flex-1 rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-2 text-xs font-bold outline-none focus:border-[var(--terracotta)] capitalize"
                    >
                      {tablesList.map((t) => {
                        const assignedTo = staffList.find((s) => s.id === t.assigned_staff_id);
                        const suffix = assignedTo
                          ? assignedTo.id === member.id
                            ? " (Assigned here)"
                            : ` (Covered by ${assignedTo.full_name.split(" ")[0]})`
                          : "";
                        return (
                          <option key={t.id} value={t.id} disabled={t.assigned_staff_id === member.id}>
                            Table T{String(t.table_number).padStart(2, "0")}{suffix}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      disabled={updatingId === member.id}
                      onClick={() => handleAssignTable(member.id)}
                      className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-full bg-[var(--terracotta)] text-white text-xs font-bold transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      {updatingId === member.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <LinkIcon size={12} /> Assign
                        </>
                      )}
                    </button>
                  </div>

                  {assignedTables.length > 0 && (
                    <button
                      disabled={updatingId === member.id}
                      onClick={() => handleClearAssignments(member.id)}
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] text-[#b24428] text-xs font-bold hover:bg-[#f8ddd5]/20 transition"
                    >
                      <XCircle size={14} /> Clear All Tables
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
