import { Bell, CheckCircle2 } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { notifications } from "@/lib/data";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8">
        <PageHeader eyebrow="Smart notifications" title="No update gets lost in the rush" copy="Customer, kitchen, staff, and inventory alerts collected in one calm notification center." />
        <div className="mt-12 space-y-4">
          {notifications.map((note, index) => (
            <Card key={note} className="flex items-start gap-4 bg-white p-5">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-[#f8eadf] text-[var(--terracotta)]" : "bg-[#eaf2e5] text-[var(--sage)]"}`}>
                {index === 0 ? <Bell /> : <CheckCircle2 />}
              </span>
              <div>
                <p className="font-bold">{note}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{index + 2} minutes ago - routed by role and priority</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
