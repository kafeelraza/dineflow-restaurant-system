"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bot, Check, Loader2, MessageCircle, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { categories as mockCategories, formatRs, menuItems as mockMenuItems } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  spice: number;
  prepTime: number;
  tags: string[];
  img: string;
}

export function MenuExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  const [categories, setCategories] = useState<string[]>(mockCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [active, setActive] = useState("Chef picks");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Table selection states
  const [tablesList, setTablesList] = useState<{ id: string; table_number: number; status: string }[]>([]);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("takeaway");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [preselected, setPreselected] = useState(false);

  // Fetch Menu Categories, Items & Tables from Supabase on mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Fetch Tables List
        const { data: dbTables } = await supabase
          .from("restaurant_tables")
          .select("id, table_number, status")
          .order("table_number", { ascending: true });

        const loadedTables = (dbTables as any[]) || [];
        setTablesList(loadedTables);

        // Handle URL table parameter
        if (tableParam) {
          if (tableParam.toLowerCase() === "takeaway") {
            setOrderType("takeaway");
            setSelectedTableId(null);
            setSelectedTableNumber(null);
            setPreselected(true);
          } else {
            const cleanNum = Number(tableParam.replace(/\D/g, ""));
            const matchedTable = loadedTables.find((t) => t.table_number === cleanNum);
            if (matchedTable) {
              setOrderType("dine-in");
              setSelectedTableId(matchedTable.id);
              setSelectedTableNumber(matchedTable.table_number);
              setPreselected(true);
            }
          }
        } else {
          // Default selection fallback if no query param is provided: Takeaway order with NO table assigned
          setOrderType("takeaway");
          setPreselected(false);
          setSelectedTableId(null);
          setSelectedTableNumber(null);
        }

        // Fetch Categories
        const { data: dbCategories, error: catError } = await supabase
          .from("menu_categories")
          .select("name")
          .order("sort_order", { ascending: true });

        if (!catError && dbCategories && dbCategories.length > 0) {
          const catNames = dbCategories.map((c) => c.name);
          setCategories(catNames);
          // If the default active tab is not in categories, reset active tab
          if (!catNames.includes(active)) {
            setActive(catNames[0]);
          }
        }

        // Fetch Menu Items (with category name joined)
        const { data: dbItems, error: itemError } = await supabase
          .from("menu_items")
          .select("*, menu_categories(name)");

        if (!itemError && dbItems && dbItems.length > 0) {
          const itemsMapped: MenuItem[] = dbItems.map((item) => ({
            id: item.id,
            category: item.menu_categories?.name || "Chef picks",
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            isVeg: item.is_veg,
            isAvailable: item.is_available,
            spice: item.spice_level,
            prepTime: item.prep_time_minutes,
            tags: item.tags || [],
            img: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          }));
          setMenuItems(itemsMapped);
        } else {
          // Fallback to mock items if DB is empty
          loadMockFallbacks();
        }
      } catch (err) {
        console.warn("Failed to fetch database menu, falling back to mock data:", err);
        loadMockFallbacks();
      }
    };

    const loadMockFallbacks = () => {
      // Map mock items to local structure
      const fallbacks: MenuItem[] = mockMenuItems.map((item) => ({
        id: item.id,
        category: item.category,
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        spice: item.spice,
        prepTime: item.prepTime,
        tags: item.tags,
        img: item.img,
      }));
      setMenuItems(fallbacks);
    };

    fetchMenuData();

    // Pre-fill saved guest details from local storage
    const savedName = localStorage.getItem("dineflow_guest_name");
    const savedPhone = localStorage.getItem("dineflow_guest_phone");
    if (savedName) setGuestName(savedName);
    if (savedPhone) setGuestPhone(savedPhone);
  }, [tableParam]);

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

  // Handle Dynamic Order Placement
  const handlePlaceOrder = async () => {
    if (itemCount === 0) return;
    if (!guestName.trim()) {
      alert("Please enter your name to place the order.");
      return;
    }
    setOrderLoading(true);

    try {
      const tableId = orderType === "dine-in" ? selectedTableId : null;

      // 2. Fetch logged in user or treat as guest customer
      const { data: { user } } = await supabase.auth.getUser();

      // 3. Create Order with guest details
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id || null,
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim() || null,
          table_id: tableId,
          status: "placed",
          order_type: orderType,
          total_amount: subtotal,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 4. Insert Order Items
      if (order) {
        const orderItemsData = cartLines.map((item) => ({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: cart[item.id],
          price_at_order: item.price,
        }));

        const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsData);
        if (itemsErr) throw itemsErr;

        // Insert exactly 1 notification row in DB for Manager/Owner
        const orderTypeLabel = orderType === "dine-in" ? `Table T${String(selectedTableNumber).padStart(2, "0")}` : "Takeaway";
        const idTag = order.id.slice(0, 4).toUpperCase();
        await supabase.from("notifications").insert({
          message: `🔔 New ${orderType === "dine-in" ? "Dine-In" : "Takeaway"} Order #${idTag} placed (${orderTypeLabel}) — Total: ${formatRs(subtotal)}`,
          is_read: false,
        });

        // Save guest details to local storage to eliminate repetitive typing on subsequent orders
        localStorage.setItem("dineflow_guest_name", guestName.trim());
        if (guestPhone.trim()) {
          localStorage.setItem("dineflow_guest_phone", guestPhone.trim());
        }
        localStorage.setItem("dineflow_last_order_id", order.id);
        setCart({});
        setCartOpen(false);
        router.push(`/order/${order.id}`);
      }
    } catch (err: any) {
      alert("Failed to place order: " + (err.message || "Unknown error"));
    } finally {
      setOrderLoading(false);
    }
  };

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
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--terracotta)]">
                  {orderType === "dine-in"
                    ? `Table T${String(selectedTableNumber || "??").padStart(2, "0")}`
                    : "Takeaway Order"}
                </p>
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
            <div className="border-t border-[#eadfce] pt-4 space-y-3">
              {/* Dining Option Selectors */}
              {preselected ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">Order Mode</label>
                    <div className="h-10 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 flex items-center text-xs font-bold text-[var(--terracotta)]">
                      Dine-In
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">Table Station</label>
                    <div className="h-10 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 flex items-center text-xs font-bold text-[var(--terracotta)] font-mono">
                      T{String(selectedTableNumber).padStart(2, "0")} (Reserved)
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">Order Mode</label>
                  <div className="h-10 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 flex items-center text-xs font-bold text-[var(--ink)]">
                    Takeaway Order
                  </div>
                  <p className="text-[10px] text-[var(--muted)] mt-1.5 leading-normal">
                    * Dine-In ordering is only available by scanning a table QR code or proceeding from a table reservation.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">Your Name</label>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-10 w-full rounded-[8px] border border-[#d7c9b5] bg-white px-3 text-sm outline-none focus:border-[var(--terracotta)]"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">Phone Number (Optional)</label>
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="h-10 w-full rounded-[8px] border border-[#d7c9b5] bg-white px-3 text-sm outline-none focus:border-[var(--terracotta)]"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div className="flex justify-between text-lg font-bold pt-2"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading || itemCount === 0 || !guestName.trim()}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
              >
                {orderLoading ? <Loader2 className="animate-spin" size={18} /> : "Place order"}
              </button>
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
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const quickSuggestion = useMemo(() => "Suggest something spicy and vegetarian", []);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    setMessages((current) => [...current, { from: "user", text: userText }]);
    setText("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages((current) => [...current, { from: "bot", text: data.reply }]);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (err) {
      setMessages((current) => [
        ...current,
        { from: "bot", text: "Sorry, my chef-brain is taking a short rest. Please try asking again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/25 p-4 backdrop-blur-sm">
      <section className="ml-auto flex h-full max-w-md flex-col rounded-[8px] bg-[#fcfaf6] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eadfce] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e1d4] text-[var(--terracotta)]"><Bot /></span>
            <div><p className="font-bold">AI dining assistant</p><p className="text-sm text-[var(--muted)]">Gemini-powered Assistant</p></div>
          </div>
          <button onClick={onClose} className="rounded-full border border-[#d7c9b5] p-2"><X size={18} /></button>
        </header>
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {messages.map((message, index) => (
            <div key={index} className={`max-w-[86%] rounded-[8px] p-4 text-sm leading-6 ${message.from === "bot" ? "bg-white text-[var(--ink)]" : "ml-auto bg-[var(--terracotta)] text-white"}`}>{message.text}</div>
          ))}
          {loading && (
            <div className="max-w-[86%] rounded-[8px] p-4 text-sm leading-6 bg-white text-[var(--ink)] flex items-center gap-2">
              <Loader2 className="animate-spin text-[var(--terracotta)]" size={16} /> Thinking...
            </div>
          )}
          {!loading && (
            <button 
              onClick={() => handleSendMessage(quickSuggestion)}
              className="inline-flex items-center gap-2 rounded-full bg-[#eaf2e5] px-4 py-2 text-sm font-bold text-[var(--sage)] hover:bg-[#e2eadc] transition"
            >
              <Sparkles size={16} /> {quickSuggestion}
            </button>
          )}
        </div>
        <form
          className="flex gap-2 border-t border-[#eadfce] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage(text);
          }}
        >
          <input 
            value={text} 
            onChange={(event) => setText(event.target.value)} 
            placeholder="Ask about dishes..." 
            className="min-w-0 flex-1 rounded-full border border-[#d7c9b5] bg-white px-4 outline-none focus:border-[var(--terracotta)]" 
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="rounded-full bg-[var(--ink)] px-5 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
          >
            Send
          </button>
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
