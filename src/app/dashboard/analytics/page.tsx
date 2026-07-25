import { TrendingUp } from "lucide-react";
import { DashboardShell, RevenueChart, StatCard } from "@/components/dashboard/dashboard-widgets";

export default function AnalyticsPage() {
  return (
    <DashboardShell title="Sales analytics" subtitle="Revenue, peak hours, item performance, and table-turn signals for owners.">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Average bill" value="Rs. 840" note="+9% after combo prompts" />
          <StatCard label="Peak hour" value="8 PM" note="Kitchen load highest" />
          <StatCard label="Top item" value="Bowl" note="22% of main sales" />
          <StatCard label="Repeat rate" value="38%" note="+6% this week" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <RevenueChart />
          <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
            <h2 className="font-serif text-2xl font-bold">Operational patterns</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Drinks attach rate", "Suggesting nimbu soda with spicy starters improves bill value."],
                ["Prep bottleneck", "Paneer and kulcha compete for tandoor time between 7:30 and 8:45 PM."],
                ["Table turn", "Two-seat tables clear 14 minutes faster when billing is started at served stage."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[8px] bg-[#fcfaf6] p-4">
                  <p className="flex items-center gap-2 font-bold"><TrendingUp size={16} className="text-[var(--sage)]" />{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
