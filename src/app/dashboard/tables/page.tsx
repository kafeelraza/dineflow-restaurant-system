"use client";

import { useEffect, useState } from "react";
import { Loader2, QrCode, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { supabase } from "@/lib/supabaseClient";

type TableStatus = "available" | "occupied" | "reserved" | "cleaning";
const cycle: TableStatus[] = ["available", "occupied", "reserved", "cleaning"];

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: TableStatus;
  profiles?: {
    full_name: string;
  } | null;
}

interface QueueItem {
  id: string;
  name: string;
  party_size: number;
  reserved_at: string;
}

export default function TablesPage() {
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

  const fetchData = async () => {
    try {
      // 1. Fetch tables with waiter profile join
      const { data: tablesData } = await supabase
        .from("restaurant_tables")
        .select("id, table_number, capacity, status, profiles:assigned_staff_id(full_name)")
        .order("table_number", { ascending: true });

      setLocalTables((tablesData as any[]) || []);

      // 2. Fetch queue from confirmed reservations
      const { data: queueData } = await supabase
        .from("reservations")
        .select("id, name, party_size, reserved_at")
        .in("status", ["pending", "confirmed"])
        .order("reserved_at", { ascending: true });

      setQueue((queueData as QueueItem[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to changes on tables and reservations
    const channel = supabase
      .channel("dashboard-tables-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCycleStatus = async (table: Table) => {
    const nextIndex = (cycle.indexOf(table.status) + 1) % cycle.length;
    const nextStatus = cycle[nextIndex];

    try {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({ status: nextStatus })
        .eq("id", table.id);

      if (error) throw error;
      
      // Optimistic update
      setLocalTables((current) =>
        current.map((row) => (row.id === table.id ? { ...row, status: nextStatus } : row))
      );
    } catch (err) {
      console.error("Failed to cycle table status:", err);
    }
  };

  return (
    <DashboardShell title="Tables and queue" subtitle="Visual floor-plan grid for seating, reservation, cleaning, and occupancy management.">
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {localTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleCycleStatus(table)}
                className={`rounded-[8px] p-5 text-left font-bold transition hover:scale-[1.02] border border-[#eadfce] ${
                  table.status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
                  table.status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
                  table.status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
                  "bg-[#f8ddd5] text-[#b24428]"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="block text-2xl">T{String(table.table_number).padStart(2, "0")}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQrTable(table);
                    }}
                    className="p-1 rounded-full hover:bg-black/10 transition text-inherit cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode size={18} />
                  </span>
                </div>
                <span className="capitalize">{table.status}</span>
                <span className="mt-3 block text-xs text-[var(--muted)]">Seats {table.capacity}</span>
                {table.profiles?.full_name && (
                  <span className="mt-1.5 block text-[10px] uppercase tracking-wider font-bold opacity-80 text-[var(--terracotta)] truncate">
                    Server: {table.profiles.full_name}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <aside className="rounded-[8px] border border-[#eadfce] bg-white p-5">
            <h2 className="font-serif text-2xl font-bold">Queue & Bookings</h2>
            <div className="mt-4 space-y-3">
              {queue.length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-4 text-center">No active bookings in queue.</p>
              ) : (
                queue.map((item) => (
                  <div key={item.id} className="rounded-[8px] bg-[#fcfaf6] p-4 text-sm font-bold border border-[#eadfce]">
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-[var(--terracotta)]">{item.party_size} pax</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1 font-semibold">
                      Time: {new Date(item.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {selectedQrTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[12px] border border-[#eadfce] bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedQrTable(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#fcfaf6] text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              <X size={20} />
            </button>

            <div className="text-center mt-2">
              <h3 className="font-serif text-xl font-bold text-[var(--ink)]">Table T{String(selectedQrTable.table_number).padStart(2, "0")} QR Code</h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">Scan this code with a mobile camera to open the menu for this table.</p>

              <div className="my-6 flex justify-center bg-[#fcfaf6] p-4 rounded-[8px] border border-[#eadfce] inline-block mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}/menu?table=${selectedQrTable.table_number}`
                      : ""
                  )}`}
                  alt={`Table ${selectedQrTable.table_number} QR Code`}
                  className="w-48 h-48 rounded-[6px]"
                />
              </div>

              <div className="space-y-2">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}/menu?table=${selectedQrTable.table_number}`
                      : ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] text-white text-xs font-bold transition hover:scale-[1.01]"
                >
                  Open High-Res QR Code
                </a>
                <button
                  onClick={() => setSelectedQrTable(null)}
                  className="flex h-10 w-full items-center justify-center rounded-full border border-[#d7c9b5] bg-[#fcfaf6] text-xs font-bold text-[var(--ink)] hover:bg-[#fcfaf6]/50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
