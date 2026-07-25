import { Gift, MessageSquareText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { customers, formatRs } from "@/lib/data";

export default function CustomersPage() {
  return (
    <DashboardShell title="Customer memory" subtitle="Simple CRM view for visits, favorites, last bill, and personalized service notes.">
      <div className="grid gap-5 lg:grid-cols-3">
        {customers.map((customer) => (
          <article key={customer.name} className="rounded-[8px] border border-[#eadfce] bg-white p-5">
            <div className="flex items-start justify-between">
              <div><h2 className="font-serif text-3xl font-bold">{customer.name}</h2><p className="text-sm text-[var(--muted)]">{customer.visits} visits</p></div>
              <span className="rounded-full bg-[#f8eadf] px-3 py-1 text-xs font-bold text-[var(--terracotta)]">Loyal</span>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <p><b>Favorite:</b> {customer.favorite}</p>
              <p><b>Last bill:</b> {formatRs(customer.lastBill)}</p>
              <p className="rounded-[8px] bg-[#fcfaf6] p-3 text-[var(--muted)]">{customer.note}</p>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-sm font-bold text-white"><Gift size={16} /> Offer</button>
              <button className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] text-sm font-bold"><MessageSquareText size={16} /> Notify</button>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
