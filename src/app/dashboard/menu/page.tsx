"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { formatRs } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  spice_level: number;
  prep_time_minutes: number;
  category_id: string;
  menu_categories?: {
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function ManageMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("12");
  const [spiceLevel, setSpiceLevel] = useState("1");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch categories
      const { data: catData } = await supabase.from("menu_categories").select("*");
      const loadedCats = (catData as Category[]) || [];
      setCategories(loadedCats);
      if (loadedCats.length > 0 && !categoryId) {
        setCategoryId(loadedCats[0].id);
      }

      // 2. Fetch menu items
      const { data: itemsData } = await supabase
        .from("menu_items")
        .select("*, menu_categories(name)")
        .order("created_at", { ascending: false });

      setItems((itemsData as MenuItem[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      setMessage({ type: "error", text: "Please fill in Name, Price, and Category." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const defaultImg = isVeg
      ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
      : "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80";

    try {
      const { error } = await supabase.from("menu_items").insert({
        name,
        price: Number(price),
        description,
        category_id: categoryId,
        is_veg: isVeg,
        is_available: true,
        image_url: imageUrl.trim() || defaultImg,
        prep_time_minutes: Number(prepTime),
        spice_level: Number(spiceLevel),
        tags: isVeg ? ["Veg"] : ["Non-Veg"],
      });

      if (error) throw error;

      setMessage({ type: "success", text: `${name} has been added successfully!` });
      
      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("");

      fetchData(); // Reload items list
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add item." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err: any) {
      alert("Failed to delete item: " + err.message);
    }
  };

  return (
    <DashboardShell title="Menu Management" subtitle="Add dishes, modify prices, upload photos, and control what customers see on their screen.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Add New Item Form */}
        <section className="rounded-[8px] border border-[#eadfce] bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Plus size={20} className="text-[var(--terracotta)]" /> Add New Dish
          </h2>
          
          {message && (
            <div
              className={`mt-4 rounded-[8px] p-4 text-sm leading-6 ${
                message.type === "success"
                  ? "bg-[#eaf2e5] text-[#4f7d52] border border-[#eadfce]"
                  : "bg-[#f8ddd5] text-[#b24428] border border-[#eadfce]"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddItem} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Dish Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 text-sm outline-none focus:border-[var(--terracotta)] font-semibold"
                  placeholder="e.g. Garlic Naan"
                  required
                />
              </label>
              
              <label>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Price (Rs.)</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 text-sm outline-none focus:border-[var(--terracotta)] font-mono"
                  placeholder="e.g. 120"
                  required
                />
              </label>
            </div>

            <label>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] p-4 text-sm outline-none focus:border-[var(--terracotta)] resize-none h-20"
                placeholder="Brief ingredients or allergens detail..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Category</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)] font-bold capitalize"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Prep Time (mins)</span>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 text-sm outline-none focus:border-[var(--terracotta)] font-mono"
                />
              </label>

              <label>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Spice Level (0-3)</span>
                <select
                  value={spiceLevel}
                  onChange={(e) => setSpiceLevel(e.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm outline-none focus:border-[var(--terracotta)] font-bold"
                >
                  <option value="0">Mild (0)</option>
                  <option value="1">Medium (1)</option>
                  <option value="2">Spicy (2)</option>
                  <option value="3">Extra Hot (3)</option>
                </select>
              </label>
            </div>

            <label>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Food Image URL (Optional)</span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-2 h-11 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 text-sm outline-none focus:border-[var(--terracotta)]"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </label>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="veg-checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="h-5 w-5 rounded-[4px] border-[#d7c9b5] text-[var(--terracotta)] accent-[var(--terracotta)] cursor-pointer"
              />
              <label htmlFor="veg-checkbox" className="text-sm font-bold cursor-pointer select-none">
                Vegetarian dish
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Publish to Menu"}
            </button>
          </form>
        </section>

        {/* Right Column: Existing Menu Items List */}
        <section className="rounded-[8px] border border-[#eadfce] bg-white p-6 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <h2 className="font-serif text-2xl font-bold border-b border-[#eadfce] pb-3">Active Menu Items</h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-[var(--terracotta)]" size={32} />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-12 flex-1">No items on the menu yet. Create your first one!</p>
          ) : (
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] items-center">
                  <div className="relative h-14 w-14 shrink-0 rounded-[6px] overflow-hidden bg-white border border-[#eadfce] flex items-center justify-center text-xs">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="text-[var(--muted)]" size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold truncate text-sm">{item.name}</h4>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${item.is_veg ? "bg-[#6B9B6E]" : "bg-[#C1502E]"}`} />
                    </div>
                    <p className="text-xs text-[var(--muted)] capitalize font-semibold">{item.menu_categories?.name || "General"}</p>
                    <p className="font-mono text-xs font-bold text-[var(--terracotta)] mt-0.5">{formatRs(item.price)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="h-9 w-9 rounded-full hover:bg-[#f8ddd5] text-[#b24428] flex items-center justify-center transition shrink-0"
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
