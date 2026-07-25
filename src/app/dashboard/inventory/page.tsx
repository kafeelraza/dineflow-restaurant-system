"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";
import { DashboardShell, InventoryBars } from "@/components/dashboard/dashboard-widgets";
import { supabase } from "@/lib/supabaseClient";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  reorder_threshold: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const { data } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      setItems((data as any[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Subscribe to database changes
    const channel = supabase
      .channel("dashboard-inventory-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => fetchInventory())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRestock = async (item: InventoryItem) => {
    setRestockingId(item.id);
    const updatedStock = Number(item.current_stock) + 5; // Restock by adding 5 units

    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({ current_stock: updatedStock, last_restocked: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;
      
      // Optimistic update
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, current_stock: updatedStock } : row))
      );
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <DashboardShell title="Inventory control" subtitle="Stock levels, reorder thresholds, supplier context, and low-stock actions.">
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Stock table</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr className="border-b border-[#eadfce]">
                    <th className="py-3">Item</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const low = Number(row.current_stock) < Number(row.reorder_threshold);
                    return (
                      <tr key={row.id} className="border-b border-[#eadfce] hover:bg-[#fcfaf6]">
                        <td className="py-4 font-bold flex items-center gap-1.5">
                          {low && <AlertTriangle className="text-[var(--terracotta)] shrink-0" size={16} />}
                          {row.name}
                        </td>
                        <td className={low ? "font-bold text-[var(--terracotta)]" : "font-mono"}>
                          {row.current_stock} {row.unit}
                        </td>
                        <td className="font-mono text-[var(--muted)]">
                          {row.reorder_threshold} {row.unit}
                        </td>
                        <td className="text-right py-2">
                          <button
                            disabled={restockingId === row.id}
                            onClick={() => handleRestock(row)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f3eee5] px-4 text-xs font-bold text-[var(--ink)] hover:bg-[#eadfce] disabled:opacity-50 transition"
                          >
                            {restockingId === row.id ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              <>
                                <Plus size={12} /> +5 Restock
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <InventoryBars />
        </div>
      )}
    </DashboardShell>
  );
}
