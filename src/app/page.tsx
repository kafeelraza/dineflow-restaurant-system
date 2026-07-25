"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  Check,
  ChefHat,
  Clock3,
  LayoutDashboard,
  MessageCircle,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";

const menuItems = [
  {
    name: "Charred Paneer Tikka",
    description: "Smoked cottage cheese, mustard cream, pickled onion",
    price: "₹280",
    tag: "Chef special",
    veg: true,
    img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Saffron Butter Bowl",
    description: "Slow-cooked rice, roasted vegetables, herb yoghurt",
    price: "₹340",
    tag: "Bestseller",
    veg: true,
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tamarind Glazed Wings",
    description: "Crisp wings, jaggery-tamarind glaze, sesame",
    price: "₹390",
    tag: "12 min",
    veg: false,
    img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
  },
];

const orders = [
  { id: "#1842", table: "T07", items: "Paneer tikka, Nimbu soda", eta: "8m", status: "Preparing" },
  { id: "#1843", table: "T11", items: "Butter bowl x2", eta: "14m", status: "Placed" },
  { id: "#1844", table: "Takeaway", items: "Wings, Kulcha", eta: "Ready", status: "Ready" },
];

const tables = [
  "available",
  "occupied",
  "reserved",
  "available",
  "cleaning",
  "occupied",
  "available",
  "reserved",
];

function HandDrawnPlate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} fill="none" aria-hidden="true">
      <path d="M27 67c10 30 90 35 111 1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 68c18 9 55 13 82-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      <path d="M42 55c4-17 16-29 36-32 25-4 45 7 54 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M65 44c11-6 28-8 43 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <path d="M22 91c26 16 86 19 119 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 26c11 4 17 10 20 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M122 19c-8 7-11 14-10 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--terracotta)]">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight text-[var(--ink)] md:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

function MenuCard({ item }: { item: (typeof menuItems)[number] }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-[8px] bg-white shadow-[0_18px_45px_rgba(43,38,33,0.08)]"
    >
      <div className="relative h-48 w-full">
        <Image src={item.img} alt={item.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full border ${item.veg ? "border-[#6B9B6E]" : "border-[#C1502E]"}`}>
                <span className={`mx-auto mt-[3px] block h-1.5 w-1.5 rounded-full ${item.veg ? "bg-[#6B9B6E]" : "bg-[#C1502E]"}`} />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--sage)]">{item.tag}</p>
            </div>
            <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">{item.name}</h3>
          </div>
          <p className="font-mono text-lg font-bold text-[var(--terracotta)]">{item.price}</p>
        </div>
        <p className="min-h-12 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
        <Link href="/menu" className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(193,98,46,0.22)] transition hover:scale-[1.02]">
          <Plus size={16} /> Order Live
        </Link>
      </div>
    </motion.article>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-[#fcfaf6] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="font-mono text-3xl font-bold text-[var(--ink)]">{value}</p>
        <svg viewBox="0 0 80 28" className="h-8 w-20 text-[var(--sage)]" fill="none">
          <path d="M2 24c10-2 12-14 22-11 8 2 8 9 18 6 9-3 11-16 21-15 8 1 10 8 15 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--sage)]">{note}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      <nav className="sticky top-0 z-50 border-b border-[#eadfce] bg-[rgba(247,243,236,0.94)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--ink)] text-[var(--terracotta)]">
              <Utensils size={20} />
            </span>
            <span className="font-serif text-2xl font-black">DineFlow</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
            <Link href="/menu" className="hover:text-[var(--ink)]">Menu</Link>
            <Link href="/#flow" className="hover:text-[var(--ink)]">How it works</Link>
            <Link href="/login" className="hover:text-[var(--ink)]">For restaurants</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-bold text-[var(--ink)] sm:block">Login</Link>
            <Link href="/menu" className="rounded-full bg-[var(--terracotta)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(193,98,46,0.18)] transition hover:scale-[1.03]">
              See what&apos;s cooking
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fcfaf6] px-4 py-2 text-sm font-bold text-[var(--sage)]">
            <Sparkles size={16} /> AI-assisted restaurant service
          </p>
          <h1 className="font-serif text-5xl font-black leading-[0.98] text-[var(--ink)] md:text-7xl">
            Great food, effortless service.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            DineFlow connects the table, kitchen, billing counter, and owner dashboard so guests know what is available and staff know what needs attention.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/reserve" className="rounded-full bg-[var(--terracotta)] px-7 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(193,98,46,0.24)] transition hover:scale-[1.03]">
              Grab a table
            </Link>
            <Link href="/login" className="rounded-full border border-[#d7c9b5] px-7 py-4 text-base font-bold text-[var(--ink)] transition hover:bg-white">
              View owner dashboard
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.7 }} className="relative">
          <div className="overflow-hidden rounded-[8px] shadow-[0_28px_80px_rgba(43,38,33,0.16)]">
            <Image
              src="https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=85"
              alt="Warm restaurant table with plated food"
              width={1400}
              height={900}
              priority
              className="h-[56vh] min-h-[430px] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 left-6 right-6 rounded-[8px] border border-[#eadfce] bg-[#fcfaf6] p-5 shadow-[0_18px_45px_rgba(43,38,33,0.12)] md:left-auto md:w-80">
            <div className="flex items-center justify-between">
              <p className="font-bold">Live kitchen pulse</p>
              <span className="rounded-full bg-[#eaf2e5] px-3 py-1 text-xs font-bold text-[var(--sage)]">12 min ETA</span>
            </div>
            <div className="mt-4 space-y-3">
              {["Order placed", "Chef confirmed", "Now preparing"].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--terracotta)] text-white">
                    <Check size={14} />
                  </span>
                  <p className="text-sm font-semibold text-[var(--ink)]">{step}</p>
                  {index === 2 && <span className="ml-auto h-2 w-2 rounded-full bg-[var(--mustard)]" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#eadfce] bg-[#fcfaf6] px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ["Guests wait just to ask what is available", ChefHat],
            ["Kitchen updates happen too late", Clock3],
            ["Reservations live in scattered notebooks", CalendarCheck],
            ["Managers see insights after the rush", TrendingUp],
          ].map(([text, Icon]) => (
            <motion.div key={text as string} whileHover={{ y: -4 }} className="rounded-[8px] border border-[#eadfce] bg-white p-5">
              <Icon className="text-[var(--terracotta)]" size={26} />
              <p className="mt-4 text-base font-bold leading-6">{text as string}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionTitle eyebrow="Customer app" title="A menu that feels alive" copy="Guests can browse, add items, see sold-out signals, and get AI suggestions without waiting for a staff member." />
        <div className="mt-12 flex gap-3 overflow-x-auto pb-3">
          {["Chef picks", "Starters", "Mains", "Beverages", "Desserts"].map((tab) => (
            <Link key={tab} href="/menu" className="shrink-0 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-white">
              {tab}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {menuItems.map((item) => <MenuCard key={item.name} item={item} />)}
        </div>
      </section>

      <section id="flow" className="bg-[#efe7d9] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="How it works" title="From QR scan to calm service" copy="A simple table-side flow for customers, with the operational details quietly handled in the background." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              ["Scan the code", "Guests open the menu for their table instantly."],
              ["Order and watch it live", "Every update moves from the kitchen to the table."],
              ["AI keeps rhythm", "Wait times, suggestions, and daily summaries stay current."],
            ].map(([title, copy], index) => (
              <div key={title} className="relative rounded-[8px] bg-[#fcfaf6] p-8">
                <HandDrawnPlate className="h-24 w-32 text-[var(--terracotta)]" />
                <p className="mt-8 font-mono text-sm font-bold text-[var(--sage)]">0{index + 1}</p>
                <h3 className="mt-2 font-serif text-3xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--terracotta)]">AI spotlight</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Quiet intelligence behind the rush</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            DineFlow uses AI where it actually helps: recommending dishes, predicting wait time from kitchen load, and giving owners a daily digest they can act on.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#eadfce] bg-white p-5 shadow-[0_18px_45px_rgba(43,38,33,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#eadfce] pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e1d4] text-[var(--terracotta)]">
              <MessageCircle />
            </span>
            <div>
              <p className="font-bold">DineFlow Assistant</p>
              <p className="text-sm text-[var(--muted)]">Online now</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="max-w-[80%] rounded-[8px] bg-[#f3eee5] p-4 text-sm leading-6">I want something spicy but vegetarian. What should I order?</div>
            <div className="ml-auto max-w-[84%] rounded-[8px] bg-[var(--terracotta)] p-4 text-sm leading-6 text-white">
              Try the Charred Paneer Tikka. It is smoky, spicy, and ready in about 10 minutes. I can add it to your order.
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="bg-[#2b2621] px-5 py-24 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9a441]">Staff dashboard</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Built for the dinner rush</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#d7c9b5]">Orders, tables, inventory, and AI insights stay visible without making the team fight the interface.</p>
          </div>
          <div className="grid overflow-hidden rounded-[8px] border border-white/10 bg-[#fcfaf6] text-[var(--ink)] shadow-[0_28px_80px_rgba(0,0,0,0.25)] lg:grid-cols-[240px_1fr]">
            <aside className="hidden border-r border-[#eadfce] bg-[#f5efe5] p-5 lg:block">
              <div className="mb-8 flex items-center gap-3">
                <Utensils className="text-[var(--terracotta)]" />
                <span className="font-serif text-2xl font-black">DineFlow</span>
              </div>
              {["Overview", "Orders", "Tables", "Inventory", "Staff", "Analytics"].map((item, index) => (
                <div key={item} className={`mb-2 flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold ${index === 0 ? "bg-white text-[var(--terracotta)] shadow-sm" : "text-[var(--muted)]"}`}>
                  <LayoutDashboard size={18} /> {item}
                </div>
              ))}
            </aside>
            <div className="min-w-0 p-5 md:p-7">
              <header className="flex flex-col justify-between gap-4 border-b border-[#eadfce] pb-5 md:flex-row md:items-center">
                <div>
                  <p className="text-sm text-[var(--muted)]">Saturday service</p>
                  <h3 className="font-serif text-3xl font-bold">Haven Table, Indore</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center gap-2 rounded-full border border-[#d7c9b5] px-4 text-sm text-[var(--muted)]">
                    <Search size={16} /> Search orders
                  </div>
                  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--ink)]"><Bell size={18} /></button>
                </div>
              </header>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Today's revenue" value="₹42.8k" note="+18% vs yesterday" />
                <StatCard label="Active orders" value="24" note="7 need attention" />
                <StatCard label="Occupancy" value="78%" note="Peak in 35 min" />
                <StatCard label="Low stock" value="06" note="Paneer, mint, cream" />
              </div>
              <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-serif text-2xl font-bold">Live orders</h4>
                    <span className="rounded-full bg-[#f8eadf] px-3 py-1 text-xs font-bold text-[var(--terracotta)]">Realtime</span>
                  </div>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="grid gap-3 rounded-[8px] border border-[#eadfce] p-4 sm:grid-cols-[76px_1fr_74px_104px] sm:items-center">
                        <p className="font-mono font-bold">{order.id}</p>
                        <p className="text-sm text-[var(--muted)]"><span className="font-bold text-[var(--ink)]">{order.table}</span> · {order.items}</p>
                        <p className="font-mono text-sm font-bold text-[var(--sage)]">{order.eta}</p>
                        <button className="rounded-full bg-[#f3eee5] px-3 py-2 text-xs font-bold">{order.status}</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
                  <h4 className="font-serif text-2xl font-bold">AI daily digest</h4>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                    <p><Sparkles className="mr-2 inline text-[var(--mustard)]" size={16} />Butter Bowl is leading sales by 22% today.</p>
                    <p><ReceiptText className="mr-2 inline text-[var(--terracotta)]" size={16} />Average bill value is rising after 7 PM.</p>
                    <p><ShoppingBag className="mr-2 inline text-[var(--sage)]" size={16} />Restock mint before tomorrow&apos;s lunch rush.</p>
                  </div>
                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {tables.map((status, index) => (
                      <div key={`${status}-${index}`} className={`flex aspect-square items-center justify-center rounded-[8px] text-xs font-bold ${
                        status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
                        status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
                        status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
                        "bg-[#f8ddd5] text-[#b24428]"
                      }`}>
                        T{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reserve" className="bg-[var(--terracotta)] px-5 py-16 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffe0c8]">Ready for demo day</p>
            <h2 className="mt-3 font-serif text-4xl font-black">Make service feel effortless.</h2>
          </div>
          <Link href="/menu" className="rounded-full bg-white px-7 py-4 font-bold text-[var(--terracotta)] transition hover:scale-[1.03]">Start ordering</Link>
        </div>
      </section>
    </main>
  );
}
