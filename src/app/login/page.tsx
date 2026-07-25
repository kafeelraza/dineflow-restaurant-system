"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { AppNav, ButtonLink, Card, RolePill } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRoleRedirect = async (userId: string) => {
    try {
      // Fetch user profile from the database to check role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        // Fallback: Default to customer if profile is missing
        router.push("/menu");
        return;
      }

      if (profile.role === "admin") {
        router.push("/dashboard");
      } else if (profile.role === "staff") {
        router.push("/dashboard/orders");
      } else {
        router.push("/menu");
      }
    } catch (err) {
      router.push("/menu");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Please enter both email and password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        await handleRoleRedirect(data.user.id);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email first to send OTP." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Login only
        },
      });

      if (error) throw error;

      setOtpSent(true);
      setMessage({ type: "success", text: "OTP sent to your email!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpToken) {
      setMessage({ type: "error", text: "Please enter both email and OTP code." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: "email",
      });

      if (error) throw error;

      if (data.user) {
        setMessage({ type: "success", text: "OTP verified! Redirecting..." });
        await handleRoleRedirect(data.user.id);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Invalid OTP code." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to start Google login." });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <div className="self-center">
          <RolePill role="Silver story: auth UI" />
          <h1 className="mt-5 font-serif text-5xl font-black leading-tight">Secure entry for every restaurant role.</h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            This live system utilizes Supabase Auth to handle email/password login, magic links/OTP verification, Google OAuth, and secure role-based routing.
          </p>
        </div>
        
        <Card className="bg-white p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">Welcome back</p>
            <h2 className="mt-2 font-serif text-4xl font-bold">Login</h2>
          </div>

          {message && (
            <div
              className={`mb-4 rounded-[8px] p-4 text-sm leading-6 ${
                message.type === "success"
                  ? "bg-[#eaf2e5] text-[#4f7d52]"
                  : "bg-[#f8ddd5] text-[#b24428]"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                placeholder="owner@dineflow.app"
                required
              />
            </label>

            {!otpSent ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                    placeholder="••••••••"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Login with Password"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold">Enter OTP Code</span>
                  <input
                    type="text"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                    placeholder="123456"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Verify OTP & Sign In"
                  )}
                </button>
              </form>
            )}

            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-[#fcfaf6] font-bold text-[var(--ink)] transition hover:scale-[1.02]"
              >
                <Mail size={18} /> Send OTP to Email
              </button>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-white font-bold text-[var(--ink)] transition hover:scale-[1.02]"
            >
              <ShieldCheck size={18} /> Continue with Google
            </button>
          </div>

          <p className="mt-5 text-sm text-[var(--muted)]">
            New restaurant? <a href="/signup" className="font-bold text-[var(--terracotta)]">Create workspace</a>
          </p>
        </Card>
      </section>
    </main>
  );
}
