import Link from "next/link";
import { Clock3, ReceiptText } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { OrderStepper } from "@/components/customer/customer-widgets";
import { formatRs } from "@/lib/data";

export default function OrderTrackingPage() {
  const lines = [
    { name: "Charred Paneer Tikka", qty: 1, price: 280 },
    { name: "House Nimbu Soda", qty: 2, price: 120 },
  ];
  const subtotal = lines.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <PageHeader eyebrow="Live order tracking" title="Your kitchen status is visible" copy="Customers can see ETA, order stage, item details, and move to billing when service is complete." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-white p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eadfce] pb-5 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-sm font-bold text-[var(--terracotta)]">ORDER #1842 - TABLE T07</p>
                <h2 className="mt-1 font-serif text-3xl font-bold">Preparing now</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf2e5] px-4 py-2 font-bold text-[var(--sage)]"><Clock3 size={18} /> Ready in ~8 mins</span>
            </div>
            <div className="mt-6"><OrderStepper status="preparing" /></div>
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-3xl font-bold">Order summary</h2>
            <div className="mt-5 space-y-3">
              {lines.map((line) => (
                <div key={line.name} className="flex justify-between rounded-[8px] bg-white p-4">
                  <div><p className="font-bold">{line.name}</p><p className="text-sm text-[var(--muted)]">Qty {line.qty}</p></div>
                  <p className="font-mono font-bold">{formatRs(line.qty * line.price)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[#eadfce] pt-4">
              <div className="flex justify-between font-bold"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
              <Link href="/billing/demo?orderId=demo-1842" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] font-bold text-white"><ReceiptText size={18} /> View bill</Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
