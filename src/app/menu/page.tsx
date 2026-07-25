import { Suspense } from "react";
import { AppNav, PageHeader } from "@/components/ui/brand";
import { MenuExperience } from "@/components/customer/customer-widgets";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <PageHeader
          eyebrow="Digital menu"
          title="See what is cooking right now"
          copy="Browse live availability, add items to a table cart, and ask the AI assistant for recommendations before placing the order."
        />
        <div className="mt-12">
          <Suspense fallback={<div className="text-center text-sm py-12">Loading Menu Experience...</div>}>
            <MenuExperience />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
