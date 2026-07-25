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

interface InventoryRowProps {
  row: InventoryItem;
  restockingId: string | null;
  defaultRestockQty: number;
  onRestock: (qty: number) => void;
  onUpdateField: (field: "current_stock" | "reorder_threshold", val: number) => void;
}

function InventoryRow({
  row,
  restockingId,
  defaultRestockQty,
  onRestock,
  onUpdateField,
}: InventoryRowProps) {
  const [stock, setStock] = useState(row.current_stock);
  const [threshold, setThreshold] = useState(row.reorder_threshold);
  const [qtyInput, setQtyInput] = useState(defaultRestockQty);

  // Sync state with props if they change externally (e.g. from restock action or other devices)
  useEffect(() => {
    setStock(row.current_stock);
  }, [row.current_stock]);

  useEffect(() => {
    setThreshold(row.reorder_threshold);
  }, [row.reorder_threshold]);

  const low = Number(stock) < Number(threshold);

  const handleBlur = (field: "current_stock" | "reorder_threshold", val: number, oldVal: number) => {
    if (val !== oldVal) {
      onUpdateField(field, val);
    }
  };

  return (
    <tr className="border-b border-[#eadfce] hover:bg-[#fcfaf6] text-sm">
      <td className="py-4 font-bold flex items-center gap-1.5 text-[var(--ink)]">
        {low && <AlertTriangle className="text-[var(--terracotta)] shrink-0" size={16} />}
        {row.name}
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            onBlur={() => handleBlur("current_stock", stock, row.current_stock)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="w-16 h-8 text-center rounded-[6px] border border-[#d7c9b5] bg-white px-1 font-mono font-bold text-xs outline-none focus:border-[var(--terracotta)]"
          />
          <span className="text-[10px] text-[var(--muted)] font-bold uppercase">{row.unit}</span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            onBlur={() => handleBlur("reorder_threshold", threshold, row.reorder_threshold)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="w-16 h-8 text-center rounded-[6px] border border-[#d7c9b5] bg-white px-1 font-mono text-[var(--muted)] text-xs font-bold outline-none focus:border-[var(--terracotta)]"
          />
          <span className="text-[10px] text-[var(--muted)] font-bold uppercase">{row.unit}</span>
        </div>
      </td>
      <td className="text-right py-2">
        <div className="flex items-center gap-1.5 justify-end">
          <input
            type="number"
            min="1"
            value={qtyInput}
            onChange={(e) => setQtyInput(Number(e.target.value))}
            className="w-12 h-9 text-center rounded-[6px] border border-[#d7c9b5] bg-white px-1 text-xs font-mono font-bold outline-none focus:border-[var(--terracotta)]"
          />
          <button
            disabled={restockingId === row.id}
            onClick={() => onRestock(qtyInput)}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-[#f3eee5] px-3.5 text-xs font-bold text-[var(--ink)] hover:bg-[#eadfce] disabled:opacity-50 transition shrink-0"
          >
            {restockingId === row.id ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <>
                <Plus size={12} /> Restock
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
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

  const handleRestock = async (item: InventoryItem, qtyToAdd: number) => {
    setRestockingId(item.id);
    const updatedStock = Number(item.current_stock) + qtyToAdd;

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

  const [restockingAll, setRestockingAll] = useState(false);

  const handleRestockAllLow = async () => {
    const lowItems = items.filter((i) => Number(i.current_stock) < Number(i.reorder_threshold));
    if (lowItems.length === 0) return;
    setRestockingAll(true);

    try {
      for (const item of lowItems) {
        const newStock = Number(item.reorder_threshold) + 10;
        await supabase
          .from("inventory_items")
          .update({ current_stock: newStock, last_restocked: new Date().toISOString() })
          .eq("id", item.id);
      }
      fetchInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setRestockingAll(false);
    }
  };

  const handleUpdateField = async (itemId: string, field: "current_stock" | "reorder_threshold", val: number) => {
    try {
      // Optimistic update
      setItems((current) =>
        current.map((row) => (row.id === itemId ? { ...row, [field]: val } : row))
      );

      const { error } = await supabase
        .from("inventory_items")
        .update({ [field]: val })
        .eq("id", itemId);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to update inventory field:", err);
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold">Stock table</h2>
              {items.some((i) => Number(i.current_stock) < Number(i.reorder_threshold)) && (
                <button
                  disabled={restockingAll}
                  onClick={handleRestockAllLow}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-4 text-xs font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
                >
                  {restockingAll ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <>⚡ Restock All Low (+10)</>
                  )}
                </button>
              )}
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
                  {items.map((row) => (
                    <InventoryRow
                      key={row.id}
                      row={row}
                      restockingId={restockingId}
                      defaultRestockQty={5}
                      onRestock={(qty) => handleRestock(row, qty)}
                      onUpdateField={(field, val) => handleUpdateField(row.id, field, val)}
                    />
                  ))}
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
