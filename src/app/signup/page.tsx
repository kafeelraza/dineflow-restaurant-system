"use client";

import { useState } from "react";
import { BadgeCheck, KeyRound, Loader2, Store } from "lucide-react";
import { AppNav, Card, RolePill } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [phone, setPhone] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !restaurantName) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: phone ? (phone.startsWith("+") ? phone : `+91${phone}`) : undefined,
        options: {
          data: {
            full_name: restaurantName,
            role: role,
            phone: phone || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setMessage({
          type: "success",
          text: "Registration successful! Please check your email for a verification link.",
        });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage({
          type: "error",
          text: "🔑 Google OAuth is currently in Beta mode (requires GCP credentials). Please use Mobile OTP, Email OTP, or Password signup for instant workspace creation!",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "🔑 Google OAuth is currently in Beta mode. Please use Mobile OTP, Email OTP, or Password signup for instant workspace creation!",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.95fr] md:px-8">
        <Card className="bg-white p-6">
          <RolePill role="workspace setup" />
          <h1 className="mt-4 font-serif text-4xl font-black">Create your restaurant workspace</h1>
          
          {message && (
            <div
              className={`mt-4 rounded-[8px] p-4 text-sm leading-6 ${
                message.type === "success"
                  ? "bg-[#eaf2e5] text-[#4f7d52]"
                  : "bg-[#f8ddd5] text-[#b24428]"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-6 grid gap-4">
            <label>
              <span className="text-sm font-bold">Restaurant name</span>
              <input
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                placeholder="Haven Table"
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Mobile phone number (for OTP login)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                placeholder="+91 98765 43210"
              />
            </label>
            <label>
              <span className="text-sm font-bold">Owner email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                placeholder="owner@restaurant.com"
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                placeholder="Create password"
                minLength={6}
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Workspace Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-3 text-sm font-bold outline-none focus:border-[var(--terracotta)]"
              >
                <option value="admin">Admin (Restaurant Owner)</option>
                <option value="staff">Staff (Kitchen / Waiter)</option>
              </select>
            </label>
            
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <KeyRound size={18} />
              )}
              Create workspace
            </button>
            
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-white font-bold transition hover:scale-[1.02]"
            >
              <BadgeCheck size={18} /> Sign up with Google <span className="rounded-full bg-[var(--terracotta)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--terracotta)]">Beta</span>
            </button>
          </form>
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
