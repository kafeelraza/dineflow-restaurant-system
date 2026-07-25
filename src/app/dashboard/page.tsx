import { DashboardShell, OverviewDashboard } from "@/components/dashboard/dashboard-widgets";

export default function DashboardPage() {
  return (
    <DashboardShell title="Operations overview" subtitle="Live view of service, tables, revenue, inventory, and AI recommendations.">
      <OverviewDashboard />
    </DashboardShell>
  );
}
