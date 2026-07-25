# DineFlow Frontend Code

## package.json
```json
{
  "name": "hackathon",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "framer-motion": "^12.42.2",
    "lucide-react": "^1.26.0",
    "next": "16.2.11",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.11",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## next.config.ts
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
```

## src/app/layout.tsx
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DineFlow | Smart Restaurant Management",
  description:
    "A warm, AI-assisted restaurant operations UI for customer ordering, live kitchen status, reservations, and owner insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full"
        style={
          {
            "--font-body": 'Inter, "Segoe UI", Arial, sans-serif',
            "--font-display": 'Georgia, "Times New Roman", serif',
            "--font-numeric": '"Space Grotesk", "Segoe UI", monospace',
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
```

## src/app/globals.css
```css
@import "tailwindcss";

:root {
  --cream: #f7f3ec;
  --ink: #2b2621;
  --muted: #8a7f71;
  --terracotta: #c1622e;
  --sage: #7a8b6f;
  --mustard: #d9a441;
  --background: var(--cream);
  --foreground: var(--ink);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-serif: var(--font-display);
  --font-mono: var(--font-numeric);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body), Inter, "Segoe UI", Arial, sans-serif;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

img {
  display: block;
}

::selection {
  background: #f5d7c3;
  color: var(--ink);
}
```

## src/lib/data.ts
```ts
export type Role = "customer" | "staff" | "admin";
export type OrderStatus = "placed" | "confirmed" | "preparing" | "ready" | "served" | "billed";
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export const categories = ["Chef picks", "Starters", "Mains", "Beverages", "Desserts"];

export const menuItems = [
  {
    id: "paneer-tikka",
    category: "Starters",
    name: "Charred Paneer Tikka",
    description: "Smoked cottage cheese, mustard cream, pickled onion",
    price: 280,
    isVeg: true,
    isAvailable: true,
    spice: 2,
    prepTime: 10,
    tags: ["Chef special", "Spicy"],
    img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saffron-bowl",
    category: "Mains",
    name: "Saffron Butter Bowl",
    description: "Slow-cooked rice, roasted vegetables, herb yoghurt",
    price: 340,
    isVeg: true,
    isAvailable: true,
    spice: 1,
    prepTime: 14,
    tags: ["Bestseller"],
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tamarind-wings",
    category: "Starters",
    name: "Tamarind Glazed Wings",
    description: "Crisp wings, jaggery-tamarind glaze, sesame",
    price: 390,
    isVeg: false,
    isAvailable: true,
    spice: 2,
    prepTime: 12,
    tags: ["Fast moving"],
    img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mango-cream",
    category: "Desserts",
    name: "Mango Cream Kulfi",
    description: "Alphonso pulp, pistachio crumb, cardamom cream",
    price: 210,
    isVeg: true,
    isAvailable: false,
    spice: 0,
    prepTime: 4,
    tags: ["Sold out"],
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "nimbu-soda",
    category: "Beverages",
    name: "House Nimbu Soda",
    description: "Fresh lime, black salt, mint, sparkling water",
    price: 120,
    isVeg: true,
    isAvailable: true,
    spice: 0,
    prepTime: 3,
    tags: ["Fresh"],
    img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "kulcha",
    category: "Mains",
    name: "Stuffed Amritsari Kulcha",
    description: "Crisp kulcha, chole, onion relish, tamarind chutney",
    price: 260,
    isVeg: true,
    isAvailable: true,
    spice: 2,
    prepTime: 16,
    tags: ["Comfort"],
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
  },
];

export const orders = [
  { id: "1842", table: "T07", customer: "Aarav", items: ["Charred Paneer Tikka", "House Nimbu Soda"], total: 400, eta: 8, status: "preparing" as OrderStatus },
  { id: "1843", table: "T11", customer: "Meera", items: ["Saffron Butter Bowl x2"], total: 680, eta: 14, status: "placed" as OrderStatus },
  { id: "1844", table: "Takeaway", customer: "Kabir", items: ["Tamarind Glazed Wings", "Kulcha"], total: 650, eta: 0, status: "ready" as OrderStatus },
  { id: "1845", table: "T02", customer: "Riya", items: ["Kulcha", "Nimbu Soda x2"], total: 500, eta: 18, status: "confirmed" as OrderStatus },
  { id: "1846", table: "T05", customer: "Zoya", items: ["Saffron Butter Bowl"], total: 340, eta: 0, status: "served" as OrderStatus },
];

export const tables = Array.from({ length: 16 }, (_, index) => {
  const statuses: TableStatus[] = ["available", "occupied", "reserved", "available", "cleaning", "occupied", "available", "reserved"];
  return {
    id: `T${String(index + 1).padStart(2, "0")}`,
    capacity: [2, 4, 4, 6][index % 4],
    status: statuses[index % statuses.length],
    server: ["Nikhil", "Sara", "Dev", "Ira"][index % 4],
  };
});

export const inventory = [
  { item: "Paneer", unit: "kg", stock: 4.2, threshold: 8, supplier: "Fresh Dairy Co.", trend: "High demand" },
  { item: "Mint", unit: "bunch", stock: 7, threshold: 18, supplier: "Green Basket", trend: "Low by dinner" },
  { item: "Cream", unit: "litre", stock: 5, threshold: 10, supplier: "Fresh Dairy Co.", trend: "Restock today" },
  { item: "Rice", unit: "kg", stock: 38, threshold: 20, supplier: "Indore Grains", trend: "Healthy" },
  { item: "Lime", unit: "kg", stock: 12, threshold: 9, supplier: "Green Basket", trend: "Healthy" },
];

export const staff = [
  { name: "Nikhil Jain", role: "Chef", shift: "10:00 - 18:00", load: "4 active tickets", status: "On shift" },
  { name: "Sara Khan", role: "Waiter", shift: "12:00 - 22:00", load: "5 tables", status: "On shift" },
  { name: "Dev Mehta", role: "Cashier", shift: "14:00 - 23:00", load: "Bills desk", status: "On shift" },
  { name: "Ira Shah", role: "Host", shift: "17:00 - 23:00", load: "Reservations", status: "Starts soon" },
];

export const customers = [
  { name: "Aarav", visits: 8, favorite: "Paneer Tikka", lastBill: 400, note: "Likes spicy veg starters" },
  { name: "Meera", visits: 5, favorite: "Saffron Bowl", lastBill: 680, note: "Often reserves T11" },
  { name: "Kabir", visits: 3, favorite: "Tamarind Wings", lastBill: 650, note: "Takeaway regular" },
];

export const notifications = [
  "Order #1844 is ready for pickup.",
  "Mint stock may run low before dinner closes.",
  "T03 reservation confirmed for 8:30 PM.",
  "AI predicts a 22-minute kitchen load spike at 8 PM.",
];

export const aiInsights = [
  "Butter Bowl is leading sales by 22% today.",
  "Average bill value rises when drinks are suggested with mains.",
  "Restock mint and cream before tomorrow lunch.",
  "Add one runner between 7:45 PM and 9:00 PM to reduce table wait.",
];

export function formatRs(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}
```

## src/components/ui/brand.tsx
```tsx
import Link from "next/link";
import { Utensils } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--ink)] text-[var(--terracotta)]">
        <Utensils size={20} />
      </span>
      <span className="font-serif text-2xl font-black">DineFlow</span>
    </Link>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-[var(--terracotta)] text-white shadow-[0_10px_24px_rgba(193,98,46,0.2)]",
    secondary: "border border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)]",
    ghost: "text-[var(--ink)]",
  };

  return (
    <Link href={href} className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition hover:scale-[1.03] ${styles[variant]}`}>
      {children}
    </Link>
  );
}

export function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--terracotta)]">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[var(--ink)] md:text-6xl">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

export function AppNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#eadfce] bg-[rgba(247,243,236,0.96)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Logo />
        <div className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted)] md:flex">
          <Link href="/menu" className="hover:text-[var(--ink)]">Menu</Link>
          <Link href="/reserve" className="hover:text-[var(--ink)]">Reserve</Link>
          <Link href="/order/demo" className="hover:text-[var(--ink)]">Track Order</Link>
          <Link href="/dashboard" className="hover:text-[var(--ink)]">Dashboard</Link>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/login" variant="ghost">Login</ButtonLink>
          <ButtonLink href="/menu">Order now</ButtonLink>
        </div>
      </div>
    </nav>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[8px] border border-[#eadfce] bg-[#fcfaf6] shadow-[0_18px_45px_rgba(43,38,33,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function RolePill({ role }: { role: string }) {
  return (
    <span className="rounded-full bg-[#eaf2e5] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--sage)]">
      {role}
    </span>
  );
}
```

## src/components/customer/customer-widgets.tsx
```tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Bot, Check, MessageCircle, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { categories, formatRs, menuItems } from "@/lib/data";

export function MenuExperience() {
  const [active, setActive] = useState("Chef picks");
  const [cart, setCart] = useState<Record<string, number>>({ "paneer-tikka": 1, "nimbu-soda": 2 });
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const filtered = active === "Chef picks" ? menuItems : menuItems.filter((item) => item.category === active);
  const cartLines = menuItems.filter((item) => cart[item.id]);
  const subtotal = cartLines.reduce((sum, item) => sum + item.price * cart[item.id], 0);
  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  function updateCart(id: string, delta: number) {
    setCart((current) => {
      const nextQty = Math.max(0, (current[id] ?? 0) + delta);
      const next = { ...current, [id]: nextQty };
      if (!nextQty) delete next[id];
      return next;
    });
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${active === tab ? "bg-[var(--ink)] text-white" : "border border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)] hover:bg-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className={`overflow-hidden rounded-[8px] bg-white shadow-[0_18px_45px_rgba(43,38,33,0.08)] ${!item.isAvailable ? "opacity-70" : ""}`}>
            <div className="relative h-48">
              <Image src={item.img} alt={item.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              {!item.isAvailable && <span className="absolute right-4 top-4 rounded-full bg-[#2b2621] px-3 py-1 text-xs font-bold text-white">Sold out</span>}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`h-3 w-3 rounded-full border ${item.isVeg ? "border-[#6B9B6E]" : "border-[#C1502E]"}`}>
                      <span className={`mx-auto mt-[3px] block h-1.5 w-1.5 rounded-full ${item.isVeg ? "bg-[#6B9B6E]" : "bg-[#C1502E]"}`} />
                    </span>
                    {item.tags.map((tag) => <span key={tag} className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sage)]">{tag}</span>)}
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{item.name}</h2>
                </div>
                <p className="font-mono text-lg font-bold text-[var(--terracotta)]">{formatRs(item.price)}</p>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f3eee5] px-3 py-2 text-xs font-bold text-[var(--muted)]">{item.prepTime} min prep</span>
                {cart[item.id] ? (
                  <div className="flex h-11 items-center overflow-hidden rounded-full border border-[#d7c9b5] bg-[#fcfaf6]">
                    <button className="px-3" onClick={() => updateCart(item.id, -1)}><Minus size={16} /></button>
                    <span className="w-8 text-center font-bold">{cart[item.id]}</span>
                    <button className="px-3" onClick={() => updateCart(item.id, 1)}><Plus size={16} /></button>
                  </div>
                ) : (
                  <button disabled={!item.isAvailable} onClick={() => updateCart(item.id, 1)} className="flex h-11 items-center gap-2 rounded-full bg-[var(--terracotta)] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#cbbfb0]">
                    <Plus size={16} /> Add
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button onClick={() => setChatOpen(true)} className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sage)] text-white shadow-[0_16px_32px_rgba(43,38,33,0.22)]" aria-label="Open AI assistant">
        <MessageCircle />
      </button>
      <button onClick={() => setCartOpen(true)} className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-3 rounded-full bg-[var(--ink)] px-5 text-white shadow-[0_16px_32px_rgba(43,38,33,0.22)]" aria-label="Open cart">
        <ShoppingBag /> <span className="font-bold">{itemCount}</span>
      </button>

      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/25 p-4 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full max-w-md flex-col rounded-[8px] bg-[#fcfaf6] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eadfce] pb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--terracotta)]">Table T07</p>
                <h2 className="font-serif text-3xl font-bold">Your order</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full border border-[#d7c9b5] p-2"><X size={18} /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-auto py-5">
              {cartLines.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-white p-4">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-[var(--muted)]">{cart[item.id]} x {formatRs(item.price)}</p>
                  </div>
                  <p className="font-mono font-bold">{formatRs(cart[item.id] * item.price)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#eadfce] pt-4">
              <div className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
              <a href="/order/demo" className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[var(--terracotta)] font-bold text-white">Place order</a>
            </div>
          </aside>
        </div>
      )}

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I can suggest dishes, explain allergens, or estimate prep time." },
    { from: "user", text: "Something spicy and vegetarian?" },
    { from: "bot", text: "Try Charred Paneer Tikka. It is spicy, vegetarian, and usually ready in about 10 minutes." },
  ]);
  const [text, setText] = useState("");

  const quickSuggestion = useMemo(() => "Add Paneer Tikka + Nimbu Soda combo", []);

  return (
    <div className="fixed inset-0 z-[70] bg-black/25 p-4 backdrop-blur-sm">
      <section className="ml-auto flex h-full max-w-md flex-col rounded-[8px] bg-[#fcfaf6] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eadfce] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e1d4] text-[var(--terracotta)]"><Bot /></span>
            <div><p className="font-bold">AI dining assistant</p><p className="text-sm text-[var(--muted)]">Frontend mock, Gemini-ready</p></div>
          </div>
          <button onClick={onClose} className="rounded-full border border-[#d7c9b5] p-2"><X size={18} /></button>
        </header>
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {messages.map((message, index) => (
            <div key={index} className={`max-w-[86%] rounded-[8px] p-4 text-sm leading-6 ${message.from === "bot" ? "bg-white text-[var(--ink)]" : "ml-auto bg-[var(--terracotta)] text-white"}`}>{message.text}</div>
          ))}
          <button className="inline-flex items-center gap-2 rounded-full bg-[#eaf2e5] px-4 py-2 text-sm font-bold text-[var(--sage)]"><Sparkles size={16} /> {quickSuggestion}</button>
        </div>
        <form
          className="flex gap-2 border-t border-[#eadfce] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            setMessages((current) => [...current, { from: "user", text }, { from: "bot", text: "Nice choice. Based on live kitchen load, I would suggest Saffron Butter Bowl with Nimbu Soda. Estimated prep is 14 minutes." }]);
            setText("");
          }}
        >
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about dishes..." className="min-w-0 flex-1 rounded-full border border-[#d7c9b5] bg-white px-4 outline-none" />
          <button className="rounded-full bg-[var(--ink)] px-5 font-bold text-white">Send</button>
        </form>
      </section>
    </div>
  );
}

export function OrderStepper({ status = "preparing" }: { status?: string }) {
  const steps = ["placed", "confirmed", "preparing", "ready", "served"];
  const active = Math.max(0, steps.indexOf(status));

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {steps.map((step, index) => {
        const done = index <= active;
        return (
          <div key={step} className={`rounded-[8px] border p-4 ${done ? "border-[var(--terracotta)] bg-[#f8eadf]" : "border-[#eadfce] bg-[#fcfaf6]"}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? "bg-[var(--terracotta)] text-white" : "bg-[#eadfce] text-[var(--muted)]"}`}>
              {done ? <Check size={16} /> : index + 1}
            </span>
            <p className="mt-4 text-sm font-bold capitalize">{step}</p>
          </div>
        );
      })}
    </div>
  );
}
```

## src/components/dashboard/dashboard-widgets.tsx
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Package,
  Search,
  Table2,
  Users,
  Utensils,
} from "lucide-react";
import { aiInsights, formatRs, inventory, orders, tables } from "@/lib/data";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ChefHat },
  { href: "/dashboard/tables", label: "Tables", icon: Table2 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/customers", label: "Customers", icon: CreditCard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Ops", icon: Bot },
];

export function DashboardShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#2b2621] p-3 text-[var(--ink)] md:p-5">
      <div className="grid min-h-[calc(100vh-24px)] overflow-hidden rounded-[8px] bg-[#fcfaf6] lg:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-[#eadfce] bg-[#f5efe5] p-5 lg:block">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Utensils className="text-[var(--terracotta)]" />
            <span className="font-serif text-2xl font-black">DineFlow</span>
          </Link>
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`mb-2 flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold ${active ? "bg-white text-[var(--terracotta)] shadow-sm" : "text-[var(--muted)] hover:bg-white/60"}`}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </aside>
        <section className="min-w-0 p-5 md:p-7">
          <header className="flex flex-col justify-between gap-4 border-b border-[#eadfce] pb-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--terracotta)]">Admin role: owner</p>
              <h1 className="font-serif text-4xl font-black">{title}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-11 items-center gap-2 rounded-full border border-[#d7c9b5] bg-white px-4 text-sm text-[var(--muted)] sm:flex">
                <Search size={16} /> Search operations
              </div>
              <Link href="/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                <Bell size={18} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--terracotta)]" />
              </Link>
            </div>
          </header>
          <div className="mt-6 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {nav.map((item) => <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-[#d7c9b5] bg-white px-4 py-2 text-xs font-bold">{item.label}</Link>)}
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-4">
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

export function OverviewDashboard() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today's revenue" value="Rs. 42.8k" note="+18% vs yesterday" />
        <StatCard label="Active orders" value="24" note="7 need attention" />
        <StatCard label="Occupancy" value="78%" note="Peak in 35 min" />
        <StatCard label="Low stock" value="06" note="Paneer, mint, cream" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <LiveOrders />
        <AIInsightCard />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <TableGrid compact />
        <InventoryBars />
      </div>
    </div>
  );
}

export function LiveOrders() {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Live orders</h2>
        <span className="rounded-full bg-[#f8eadf] px-3 py-1 text-xs font-bold text-[var(--terracotta)]">Realtime mock</span>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="grid gap-3 rounded-[8px] border border-[#eadfce] p-4 sm:grid-cols-[76px_1fr_74px_112px] sm:items-center">
            <p className="font-mono font-bold">#{order.id}</p>
            <p className="text-sm text-[var(--muted)]"><span className="font-bold text-[var(--ink)]">{order.table}</span> - {order.items.join(", ")}</p>
            <p className="font-mono text-sm font-bold text-[var(--sage)]">{order.eta ? `${order.eta}m` : "Ready"}</p>
            <button className="rounded-full bg-[#f3eee5] px-3 py-2 text-xs font-bold capitalize">{order.status}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIInsightCard() {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">AI daily digest</h2>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
        {aiInsights.map((insight) => (
          <p key={insight}><Bot className="mr-2 inline text-[var(--terracotta)]" size={16} />{insight}</p>
        ))}
      </div>
      <Link href="/dashboard/ai" className="mt-5 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white">Open AI ops</Link>
    </div>
  );
}

export function TableGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">Floor plan</h2>
      <div className={`mt-5 grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
        {tables.map((table) => (
          <button key={table.id} className={`rounded-[8px] p-4 text-left text-xs font-bold ${
            table.status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
            table.status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
            table.status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
            "bg-[#f8ddd5] text-[#b24428]"
          }`}>
            <span className="block text-base">{table.id}</span>
            <span className="capitalize">{table.status}</span>
            {!compact && <span className="mt-2 block text-[var(--muted)]">Seats {table.capacity} - {table.server}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InventoryBars() {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <h2 className="font-serif text-2xl font-bold">Inventory watch</h2>
      <div className="mt-5 space-y-4">
        {inventory.map((row) => {
          const percent = Math.min(100, Math.round((row.stock / row.threshold) * 100));
          const low = row.stock < row.threshold;
          return (
            <div key={row.item}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold">{row.item}</span>
                <span className={low ? "font-bold text-[var(--terracotta)]" : "text-[var(--muted)]"}>{row.stock} {row.unit} / min {row.threshold}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f3eee5]">
                <div className={`h-full rounded-full ${low ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RevenueChart() {
  const values = [18, 24, 20, 32, 28, 45, 42, 58, 51, 68, 76, 72];
  const max = Math.max(...values);
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Sales pulse</h2>
        <p className="font-mono font-bold text-[var(--terracotta)]">{formatRs(42800)}</p>
      </div>
      <div className="mt-8 flex h-56 items-end gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-[8px] bg-[var(--terracotta)]" style={{ height: `${(value / max) * 100}%`, opacity: 0.45 + index / 24 }} />
            <span className="text-xs text-[var(--muted)]">{index + 11}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## src/app/page.tsx
```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(193,98,46,0.22)] transition hover:scale-[1.02]">
          <Plus size={16} /> Add to order
        </button>
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
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--ink)] text-[var(--terracotta)]">
              <Utensils size={20} />
            </span>
            <span className="font-serif text-2xl font-black">DineFlow</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[var(--muted)] md:flex">
            <a href="#menu" className="hover:text-[var(--ink)]">Menu</a>
            <a href="#flow" className="hover:text-[var(--ink)]">How it works</a>
            <a href="#dashboard" className="hover:text-[var(--ink)]">For restaurants</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#dashboard" className="hidden text-sm font-bold text-[var(--ink)] sm:block">Login</a>
            <a href="#menu" className="rounded-full bg-[var(--terracotta)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(193,98,46,0.18)] transition hover:scale-[1.03]">
              See what&apos;s cooking
            </a>
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
            <a href="#reserve" className="rounded-full bg-[var(--terracotta)] px-7 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(193,98,46,0.24)] transition hover:scale-[1.03]">
              Grab a table
            </a>
            <a href="#dashboard" className="rounded-full border border-[#d7c9b5] px-7 py-4 text-base font-bold text-[var(--ink)] transition hover:bg-white">
              View owner dashboard
            </a>
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
          {["Chef picks", "Starters", "Mains", "Beverages", "Desserts"].map((tab, index) => (
            <button key={tab} className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold ${index === 0 ? "bg-[var(--ink)] text-white" : "border border-[#d7c9b5] bg-[#fcfaf6] text-[var(--ink)]"}`}>
              {tab}
            </button>
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
          <a href="#menu" className="rounded-full bg-white px-7 py-4 font-bold text-[var(--terracotta)] transition hover:scale-[1.03]">Start ordering</a>
        </div>
      </section>

      <button className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sage)] text-white shadow-[0_16px_32px_rgba(43,38,33,0.22)] transition hover:scale-105" aria-label="Open AI assistant">
        <MessageCircle />
      </button>
      <button className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-3 rounded-full bg-[var(--ink)] px-5 text-white shadow-[0_16px_32px_rgba(43,38,33,0.22)] transition hover:scale-105" aria-label="Open cart">
        <ShoppingBag /> <span className="font-bold">3</span>
      </button>
    </main>
  );
}
```

## src/app/login/page.tsx
```tsx
import { Mail, ShieldCheck } from "lucide-react";
import { AppNav, ButtonLink, Card, RolePill } from "@/components/ui/brand";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <div className="self-center">
          <RolePill role="Silver story: auth UI" />
          <h1 className="mt-5 font-serif text-5xl font-black leading-tight">Secure entry for every restaurant role.</h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            This frontend flow is ready for Supabase Auth: email/password, OTP verification, Google OAuth, and role-based routing for customer, staff, and admin.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <ButtonLink href="/menu" variant="secondary">Customer demo</ButtonLink>
            <ButtonLink href="/dashboard/orders" variant="secondary">Staff demo</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">Admin demo</ButtonLink>
          </div>
        </div>
        <Card className="bg-white p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">Welcome back</p>
            <h2 className="mt-2 font-serif text-4xl font-bold">Login</h2>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]" placeholder="owner@dineflow.app" />
            </label>
            <label className="block">
              <span className="text-sm font-bold">Password</span>
              <input type="password" className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]" placeholder="••••••••" />
            </label>
            <div>
              <span className="text-sm font-bold">Choose role</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {["customer", "staff", "admin"].map((role) => <button key={role} className="rounded-full border border-[#d7c9b5] bg-[#fcfaf6] px-4 py-3 text-sm font-bold capitalize hover:bg-white">{role}</button>)}
              </div>
            </div>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white"><Mail size={18} /> Send OTP and login</button>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-white font-bold text-[var(--ink)]"><ShieldCheck size={18} /> Continue with Google</button>
          </div>
          <div className="mt-6 rounded-[8px] bg-[#f8eadf] p-4 text-sm leading-6 text-[var(--ink)]">
            OTP preview: <b>428196</b>. Backend later will replace this with Supabase email verification.
          </div>
          <p className="mt-5 text-sm text-[var(--muted)]">New restaurant? <a href="/signup" className="font-bold text-[var(--terracotta)]">Create workspace</a></p>
        </Card>
      </section>
    </main>
  );
}
```

## src/app/signup/page.tsx
```tsx
import { BadgeCheck, KeyRound, Store } from "lucide-react";
import { AppNav, Card, RolePill } from "@/components/ui/brand";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.95fr] md:px-8">
        <Card className="bg-white p-6">
          <RolePill role="workspace setup" />
          <h1 className="mt-4 font-serif text-4xl font-black">Create your restaurant workspace</h1>
          <div className="mt-6 grid gap-4">
            <label><span className="text-sm font-bold">Restaurant name</span><input className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none" placeholder="Haven Table" /></label>
            <label><span className="text-sm font-bold">Owner email</span><input className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none" placeholder="owner@restaurant.com" /></label>
            <label><span className="text-sm font-bold">Password</span><input type="password" className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none" placeholder="Create password" /></label>
            <button className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white"><KeyRound size={18} /> Create with OTP verification</button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-white font-bold"><BadgeCheck size={18} /> Sign up with Google</button>
          </div>
        </Card>
        <div className="self-center">
          <Store className="text-[var(--terracotta)]" size={42} />
          <h2 className="mt-5 font-serif text-5xl font-black leading-tight">One account. Three useful work modes.</h2>
          <div className="mt-6 space-y-3">
            {[
              ["Customer", "Scan menu, reserve, order, track status, pay bill."],
              ["Staff", "Move orders, manage tables, handle notifications."],
              ["Admin", "Control menu, inventory, staff, analytics, AI insights."],
            ].map(([role, copy]) => (
              <div key={role} className="rounded-[8px] border border-[#eadfce] bg-[#fcfaf6] p-4">
                <p className="font-bold">{role}</p>
                <p className="text-sm leading-6 text-[var(--muted)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

## src/app/menu/page.tsx
```tsx
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
          <MenuExperience />
        </div>
      </section>
    </main>
  );
}
```

## src/app/reserve/page.tsx
```tsx
import { CalendarDays, Clock, Users } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { tables } from "@/lib/data";

export default function ReservePage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <PageHeader eyebrow="Smart reservations" title="Grab a table without phone calls" copy="A frontend reservation flow that shows table fit, preferred time, guest count, and confirmation states." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-white p-6">
            <h2 className="font-serif text-3xl font-bold">Reserve your spot</h2>
            <div className="mt-6 grid gap-4">
              <label><span className="text-sm font-bold">Name</span><input className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none" placeholder="Aarav Sharma" /></label>
              <label><span className="text-sm font-bold">Phone</span><input className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none" placeholder="+91 98765 43210" /></label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label><span className="text-sm font-bold">Date</span><div className="mt-2 flex h-12 items-center gap-2 rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4"><CalendarDays size={16} /> Today</div></label>
                <label><span className="text-sm font-bold">Time</span><div className="mt-2 flex h-12 items-center gap-2 rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4"><Clock size={16} /> 8:30 PM</div></label>
                <label><span className="text-sm font-bold">Guests</span><div className="mt-2 flex h-12 items-center gap-2 rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4"><Users size={16} /> 4</div></label>
              </div>
              <button className="h-12 rounded-full bg-[var(--terracotta)] font-bold text-white">Confirm reservation</button>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-3xl font-bold">Available floor plan</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {tables.slice(0, 12).map((table) => (
                <button key={table.id} className={`rounded-[8px] p-4 text-left text-sm font-bold ${
                  table.status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
                  table.status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
                  table.status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
                  "bg-[#f8ddd5] text-[#b24428]"
                }`}>
                  <span className="block text-lg">{table.id}</span>
                  <span className="capitalize">{table.status}</span>
                  <span className="mt-2 block text-xs text-[var(--muted)]">Seats {table.capacity}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
```

## src/app/order/demo/page.tsx
```tsx
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
              <Link href="/billing/demo" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] font-bold text-white"><ReceiptText size={18} /> View bill</Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
```

## src/app/billing/demo/page.tsx
```tsx
import { CreditCard, Download, ReceiptText } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { formatRs } from "@/lib/data";

export default function BillingPage() {
  const subtotal = 520;
  const tax = 26;
  const discount = 50;
  const total = subtotal + tax - discount;

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8">
        <PageHeader eyebrow="Billing workflow" title="A bill that is ready when the table is" copy="Frontend bill preview with subtotal, tax, discount, payment state, and receipt actions." />
        <Card className="mx-auto mt-12 bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#eadfce] pb-5">
            <div><p className="font-mono text-sm font-bold text-[var(--terracotta)]">BILL #B-1842</p><h2 className="font-serif text-3xl font-bold">Table T07</h2></div>
            <ReceiptText className="text-[var(--terracotta)]" size={34} />
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Charred Paneer Tikka", 280],
              ["House Nimbu Soda x2", 240],
            ].map(([name, price]) => (
              <div key={name as string} className="flex justify-between text-sm"><span>{name}</span><span className="font-mono font-bold">{formatRs(price as number)}</span></div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-[#eadfce] pt-5">
            <div className="flex justify-between"><span>Subtotal</span><b>{formatRs(subtotal)}</b></div>
            <div className="flex justify-between text-[var(--muted)]"><span>GST</span><span>{formatRs(tax)}</span></div>
            <div className="flex justify-between text-[var(--sage)]"><span>Loyalty discount</span><span>-{formatRs(discount)}</span></div>
            <div className="flex justify-between border-t border-[#eadfce] pt-4 text-2xl font-black"><span>Total</span><span>{formatRs(total)}</span></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white"><CreditCard size={18} /> Mark paid</button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] font-bold"><Download size={18} /> Download receipt</button>
          </div>
        </Card>
      </section>
    </main>
  );
}
```

## src/app/notifications/page.tsx
```tsx
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
```

## src/app/dashboard/page.tsx
```tsx
import { DashboardShell, OverviewDashboard } from "@/components/dashboard/dashboard-widgets";

export default function DashboardPage() {
  return (
    <DashboardShell title="Operations overview" subtitle="Live view of service, tables, revenue, inventory, and AI recommendations.">
      <OverviewDashboard />
    </DashboardShell>
  );
}
```

## src/app/dashboard/orders/page.tsx
```tsx
"use client";

import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs, orders, type OrderStatus } from "@/lib/data";

const columns: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "served"];

export default function OrdersPage() {
  const [localOrders, setLocalOrders] = useState(orders);

  function advance(id: string) {
    setLocalOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        const next = columns[Math.min(columns.indexOf(order.status) + 1, columns.length - 1)];
        return { ...order, status: next };
      }),
    );
  }

  return (
    <DashboardShell title="Order command board" subtitle="Kitchen-friendly kanban with quick status movement and ETA visibility.">
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <section key={column} className="rounded-[8px] border border-[#eadfce] bg-white p-4">
            <h2 className="font-serif text-2xl font-bold capitalize">{column}</h2>
            <div className="mt-4 space-y-3">
              {localOrders.filter((order) => order.status === column).map((order) => (
                <article key={order.id} className="rounded-[8px] bg-[#fcfaf6] p-4">
                  <div className="flex justify-between gap-3">
                    <p className="font-mono font-bold">#{order.id}</p>
                    <span className="rounded-full bg-[#eaf2e5] px-2 py-1 text-xs font-bold text-[var(--sage)]">{order.table}</span>
                  </div>
                  <p className="mt-3 font-bold">{order.customer}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{order.items.join(", ")}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-bold text-[var(--terracotta)]"><Clock3 size={14} /> {order.eta ? `${order.eta}m` : "Ready"}</span>
                    <span className="font-mono text-sm font-bold">{formatRs(order.total)}</span>
                  </div>
                  <button onClick={() => advance(order.id)} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-sm font-bold text-white">
                    Move <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
```

## src/app/dashboard/tables/page.tsx
```tsx
"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { tables, type TableStatus } from "@/lib/data";

const cycle: TableStatus[] = ["available", "occupied", "reserved", "cleaning"];

export default function TablesPage() {
  const [localTables, setLocalTables] = useState(tables);

  return (
    <DashboardShell title="Tables and queue" subtitle="Visual floor-plan grid for seating, reservation, cleaning, and occupancy management.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {localTables.map((table) => (
            <button
              key={table.id}
              onClick={() => setLocalTables((current) => current.map((row) => row.id === table.id ? { ...row, status: cycle[(cycle.indexOf(row.status) + 1) % cycle.length] } : row))}
              className={`rounded-[8px] p-5 text-left font-bold transition hover:scale-[1.02] ${
                table.status === "available" ? "bg-[#eaf2e5] text-[#4f7d52]" :
                table.status === "reserved" ? "bg-[#fbf0cf] text-[#a07012]" :
                table.status === "cleaning" ? "bg-[#ece7df] text-[#8a7f71]" :
                "bg-[#f8ddd5] text-[#b24428]"
              }`}
            >
              <span className="block text-2xl">{table.id}</span>
              <span className="capitalize">{table.status}</span>
              <span className="mt-3 block text-xs text-[var(--muted)]">Seats {table.capacity} - {table.server}</span>
            </button>
          ))}
        </div>
        <aside className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <h2 className="font-serif text-2xl font-bold">Queue</h2>
          <div className="mt-4 space-y-3">
            {["Ananya - 2 guests - 12m wait", "Rohit - 5 guests - 18m wait", "Nora - 3 guests - patio preferred"].map((item) => (
              <div key={item} className="rounded-[8px] bg-[#fcfaf6] p-4 text-sm font-bold">{item}</div>
            ))}
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
```

## src/app/dashboard/inventory/page.tsx
```tsx
import { AlertTriangle, Plus } from "lucide-react";
import { DashboardShell, InventoryBars } from "@/components/dashboard/dashboard-widgets";
import { inventory } from "@/lib/data";

export default function InventoryPage() {
  return (
    <DashboardShell title="Inventory control" subtitle="Stock levels, reorder thresholds, supplier context, and low-stock actions.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Stock table</h2>
            <button className="flex h-10 items-center gap-2 rounded-full bg-[var(--terracotta)] px-4 text-sm font-bold text-white"><Plus size={16} /> Add item</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-[var(--muted)]"><tr className="border-b border-[#eadfce]"><th className="py-3">Item</th><th>Stock</th><th>Threshold</th><th>Supplier</th><th>AI note</th></tr></thead>
              <tbody>
                {inventory.map((row) => {
                  const low = row.stock < row.threshold;
                  return (
                    <tr key={row.item} className="border-b border-[#eadfce]">
                      <td className="py-4 font-bold">{low && <AlertTriangle className="mr-2 inline text-[var(--terracotta)]" size={16} />}{row.item}</td>
                      <td>{row.stock} {row.unit}</td>
                      <td>{row.threshold} {row.unit}</td>
                      <td>{row.supplier}</td>
                      <td className={low ? "font-bold text-[var(--terracotta)]" : "text-[var(--muted)]"}>{row.trend}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <InventoryBars />
      </div>
    </DashboardShell>
  );
}
```

## src/app/dashboard/staff/page.tsx
```tsx
import { CalendarPlus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { staff } from "@/lib/data";

export default function StaffPage() {
  return (
    <DashboardShell title="Staff coordination" subtitle="Shift roster, current load, and role assignment views for smoother service.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {staff.map((member) => (
          <article key={member.name} className="rounded-[8px] border border-[#eadfce] bg-white p-5">
            <span className="rounded-full bg-[#eaf2e5] px-3 py-1 text-xs font-bold text-[var(--sage)]">{member.status}</span>
            <h2 className="mt-5 font-serif text-2xl font-bold">{member.name}</h2>
            <p className="text-sm font-bold text-[var(--terracotta)]">{member.role}</p>
            <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              <p><b className="text-[var(--ink)]">Shift:</b> {member.shift}</p>
              <p><b className="text-[var(--ink)]">Load:</b> {member.load}</p>
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] text-sm font-bold"><CalendarPlus size={16} /> Edit shift</button>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
```

## src/app/dashboard/customers/page.tsx
```tsx
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
```

## src/app/dashboard/analytics/page.tsx
```tsx
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
```

## src/app/dashboard/ai/page.tsx
```tsx
"use client";

import { useMemo, useState } from "react";
import { BellRing, Bot, Brain, ChefHat, PackageSearch, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { aiInsights, formatRs, inventory, menuItems, orders } from "@/lib/data";

export default function AIOpsPage() {
  const [pending, setPending] = useState(7);
  const [chefs, setChefs] = useState(3);
  const avgPrep = Math.round(orders.reduce((sum, order) => sum + (order.eta || 8), 0) / orders.length);
  const eta = useMemo(() => Math.max(8, Math.round(avgPrep + (pending * avgPrep) / Math.max(1, chefs) / 2)), [avgPrep, chefs, pending]);
  const recommendations = menuItems.filter((item) => item.isAvailable).slice(0, 3);

  return (
    <DashboardShell title="AI operations center" subtitle="Frontend-ready intelligent workflows for recommendations, ETA prediction, forecasts, and smart alerts.">
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]"><Brain /></span>
            <div><h2 className="font-serif text-2xl font-bold">Wait-time predictor</h2><p className="text-sm text-[var(--muted)]">Formula now, Gemini phrasing later.</p></div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label><span className="text-sm font-bold">Pending orders: {pending}</span><input type="range" min="1" max="20" value={pending} onChange={(event) => setPending(Number(event.target.value))} className="mt-3 w-full accent-[#c1622e]" /></label>
            <label><span className="text-sm font-bold">Active chefs: {chefs}</span><input type="range" min="1" max="8" value={chefs} onChange={(event) => setChefs(Number(event.target.value))} className="mt-3 w-full accent-[#7a8b6f]" /></label>
          </div>
          <div className="mt-6 rounded-[8px] bg-[#fcfaf6] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">Predicted customer ETA</p>
            <p className="mt-2 font-mono text-5xl font-black">~{eta} min</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Kitchen load is moderate. Suggest drinks or quick starters if guests are waiting.</p>
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)]"><Sparkles /></span>
            <div><h2 className="font-serif text-2xl font-bold">Personalized recommendations</h2><p className="text-sm text-[var(--muted)]">For customer Aarav, based on cart and history.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-[8px] bg-[#fcfaf6] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{item.name}</p>
                  <span className="font-mono text-sm font-bold text-[var(--terracotta)]">{formatRs(item.price)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Recommended because the guest likes {item.spice > 1 ? "spicy" : "comfort"} dishes and this item has healthy prep capacity.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbf0cf] text-[#a07012]"><PackageSearch /></span>
            <div><h2 className="font-serif text-2xl font-bold">Low-stock smart alerts</h2><p className="text-sm text-[var(--muted)]">Inventory prediction UI for restock decisions.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {inventory.filter((row) => row.stock < row.threshold).map((row) => (
              <div key={row.item} className="flex items-start gap-3 rounded-[8px] bg-[#f8eadf] p-4">
                <BellRing className="mt-1 text-[var(--terracotta)]" size={18} />
                <div><p className="font-bold">{row.item} needs restock</p><p className="text-sm leading-6 text-[var(--muted)]">{row.stock} {row.unit} left. Recommended reorder from {row.supplier} today.</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#eadfce] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]"><Bot /></span>
            <div><h2 className="font-serif text-2xl font-bold">Manager digest generator</h2><p className="text-sm text-[var(--muted)]">Daily summary card ready for Gemini API output.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {aiInsights.map((insight) => (
              <p key={insight} className="rounded-[8px] bg-[#fcfaf6] p-4 text-sm leading-6 text-[var(--muted)]"><ChefHat className="mr-2 inline text-[var(--terracotta)]" size={16} />{insight}</p>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
```

