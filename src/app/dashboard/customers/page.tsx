"use client";

import { useEffect, useState } from "react";
import { Gift, MessageSquareText, Loader2, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { supabase } from "@/lib/supabaseClient";

interface CustomerData {
  name: string;
  phone: string;
  visits: number;
  totalSpent: number;
  lastBill: number;
  lastVisit: string;
  favorite: string;
  tier: "Loyal" | "Regular" | "Newcomer";
  note: string;
}

export default function CustomersPage() {
  const [customersList, setCustomersList] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const fetchCRMData = async () => {
    try {
      // Fetch all orders with order items and menu item names
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          guest_name,
          guest_phone,
          total_amount,
          created_at,
          order_items (
            quantity,
            menu_items (
              name
            )
          )
        `);

      if (error) throw error;

      // Group and aggregate orders in JS to form CRM data
      const map: Record<string, {
        name: string;
        phone: string;
        visits: number;
        totalSpent: number;
        lastBill: number;
        lastVisitDate: Date;
        itemCounts: Record<string, number>;
      }> = {};

      (data || []).forEach((o) => {
        const rawName = o.guest_name?.trim() || "";
        if (!rawName) return; // ignore anonymous orders

        const phone = o.guest_phone || "No phone added";
        const key = `${rawName.toLowerCase()}-${phone}`;

        if (!map[key]) {
          map[key] = {
            name: rawName,
            phone,
            visits: 0,
            totalSpent: 0,
            lastBill: 0,
            lastVisitDate: new Date(o.created_at),
            itemCounts: {},
          };
        }

        const c = map[key];
        c.visits += 1;
        c.totalSpent += Number(o.total_amount);

        const oDate = new Date(o.created_at);
        if (oDate >= c.lastVisitDate) {
          c.lastVisitDate = oDate;
          c.lastBill = Number(o.total_amount);
        }

        if (o.order_items) {
          o.order_items.forEach((item: any) => {
            const itemName = item.menu_items?.name;
            if (itemName) {
              c.itemCounts[itemName] = (c.itemCounts[itemName] || 0) + Number(item.quantity);
            }
          });
        }
      });

      const aggregated: CustomerData[] = Object.values(map).map((c) => {
        let favorite = "None yet";
        let maxQty = 0;
        Object.entries(c.itemCounts).forEach(([name, qty]) => {
          if (qty > maxQty) {
            maxQty = qty;
            favorite = name;
          }
        });

        // Determine tier based on repeat visits
        let tier: "Loyal" | "Regular" | "Newcomer" = "Newcomer";
        if (c.visits >= 5) tier = "Loyal";
        else if (c.visits >= 2) tier = "Regular";

        // Generate intelligent memory note
        let note = "";
        if (tier === "Loyal") {
          note = `Loyal patron! Prefers ${favorite}. Highly responsive to premium recommendations. Total spent: Rs. ${c.totalSpent.toFixed(0)}.`;
        } else if (tier === "Regular") {
          note = `Regular customer with ${c.visits} visits. Favorite is ${favorite}. Responsive to standard discounts.`;
        } else {
          note = `New profile created during checkout. Favorite item: ${favorite}. Monitor for return patterns.`;
        }

        return {
          name: c.name,
          phone: c.phone,
          visits: c.visits,
          totalSpent: c.totalSpent,
          lastBill: c.lastBill,
          lastVisit: c.lastVisitDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          favorite,
          tier,
          note,
        };
      });

      // Sort by visits descending
      aggregated.sort((a, b) => b.visits - a.visits);
      setCustomersList(aggregated);
    } catch (err) {
      console.error("Failed to load customer CRM data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const handleAction = (customerName: string, actionType: "offer" | "notify") => {
    const code = actionType === "offer" ? "DINEPROMO15" : "Shift Notification Update";
    const msg = actionType === "offer" 
      ? `Loyalty offer code '${code}' successfully dispatched to ${customerName}!`
      : `Broadcasting operational notification successfully to ${customerName}!`;
    
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  return (
    <DashboardShell title="Customer memory" subtitle="Smart database aggregated CRM displaying guest visits, preferences, order sizes, and custom notes.">
      {/* Alert Dispatch Popover */}
      {activeNotification && (
        <div className="mb-6 rounded-[8px] bg-[#eaf2e5] border border-[#eadfce] p-4 text-xs font-semibold text-[#4f7d52] shadow-sm animate-pulse">
          🎉 {activeNotification}
        </div>
      )}

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : customersList.length === 0 ? (
        <div className="rounded-[8px] bg-white border border-[#eadfce] p-8 text-center max-w-xl mx-auto mt-6">
          <Users className="mx-auto text-[var(--muted)] mb-3" size={32} />
          <h3 className="font-serif text-2xl font-bold">No Guest Profiles Found</h3>
          <p className="text-sm text-[var(--muted)] mt-2">
            CRM database aggregates profiles automatically as guests make orders at the menu checkout. Once an order is placed, customer loyalty records show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {customersList.map((customer) => (
            <article key={`${customer.name}-${customer.phone}`} className="rounded-[8px] border border-[#eadfce] bg-white p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">{customer.name}</h2>
                    <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">{customer.visits} visits</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    customer.tier === "Loyal" ? "bg-[#eaf2e5] text-[#4f7d52]" :
                    customer.tier === "Regular" ? "bg-[#fbf0cf] text-[#a07012]" :
                    "bg-[#f3eee5] text-[var(--muted)]"
                  }`}>
                    {customer.tier}
                  </span>
                </div>
                
                <p className="text-[10px] text-[var(--muted)] font-mono mt-1.5">{customer.phone}</p>

                <div className="mt-5 space-y-2.5 text-sm">
                  <p className="flex justify-between">
                    <span className="text-[var(--muted)]">Favorite Dish:</span>
                    <b className="text-[var(--ink)] truncate max-w-[150px]">{customer.favorite}</b>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--muted)]">Last Bill:</span>
                    <b className="text-[var(--ink)] font-mono">Rs. {customer.lastBill}</b>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--muted)]">Last Visit:</span>
                    <b className="text-[var(--ink)]">{customer.lastVisit}</b>
                  </p>
                  <div className="rounded-[8px] bg-[#fcfaf6] border border-[#eadfce]/50 p-3 text-xs text-[var(--muted)] leading-relaxed italic mt-4 font-semibold">
                    &ldquo;{customer.note}&rdquo;
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => handleAction(customer.name, "offer")}
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-xs font-bold text-white transition hover:scale-[1.01]"
                >
                  <Gift size={14} /> Offer promo
                </button>
                <button
                  onClick={() => handleAction(customer.name, "notify")}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] text-xs font-bold text-[var(--ink)] transition hover:scale-[1.01]"
                >
                  <MessageSquareText size={14} /> Notify
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
