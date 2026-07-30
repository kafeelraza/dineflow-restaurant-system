"use client";

import { useState } from "react";
import Link from "next/link";
import { Utensils, Menu, X, ShoppingBag, Calendar, Clock, LayoutDashboard, User } from "lucide-react";

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#eadfce] bg-[rgba(247,243,236,0.96)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Logo />
          <div className="hidden items-center gap-7 text-sm font-semibold text-[var(--muted)] md:flex">
            <Link href="/menu" className="hover:text-[var(--ink)] transition">Menu</Link>
            <Link href="/reserve" className="hover:text-[var(--ink)] transition">Reserve</Link>
            <Link href="/order" className="hover:text-[var(--ink)] transition">Track Order</Link>
            <Link href="/dashboard" className="hover:text-[var(--ink)] transition">Dashboard</Link>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setShowGuideModal(true)}
              className="flex h-11 items-center gap-2 rounded-full border border-[var(--terracotta)] bg-[#f8eadf] px-4 text-xs font-bold text-[var(--terracotta)] transition hover:scale-[1.03] shadow-sm animate-pulse"
            >
              🏆 Evaluator Guide
            </button>
            <ButtonLink href="/login" variant="ghost">Login</ButtonLink>
            <ButtonLink href="/menu">Order now</ButtonLink>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowGuideModal(true)}
              className="flex h-10 items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-3 text-[11px] font-bold text-white shadow-sm"
            >
              🏆 Guide
            </button>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c9b5] bg-white text-[var(--ink)] transition active:scale-95 shadow-sm"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Evaluator Demo Guide Interactive Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-[#eadfce] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#fcfaf6] border border-[#eadfce] text-[var(--muted)] hover:text-[var(--ink)] font-bold transition"
            >
              ✕
            </button>

            <div className="pr-8">
              <span className="rounded-full bg-[var(--terracotta)]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--terracotta)]">
                Vibeathon 6.0 Phase 2 • Evaluator Tour
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[var(--ink)]">
                DineFlow Workflow & Testing Roadmap
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)] font-semibold leading-relaxed">
                Welcome Judges! Use this quick guide to test all primary production workflows and beta feature enhancements in 1 click.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {/* Section 1: Authentication Engine */}
              <div className="rounded-[12px] border border-[#eadfce] bg-[#fcfaf6] p-4 space-y-2">
                <h3 className="font-serif font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                  🔒 Authentication & Security Workflows
                </h3>
                <div className="grid gap-2 text-xs">
                  <div className="p-2.5 rounded-[8px] bg-white border border-[#eadfce]">
                    <span className="font-bold text-[var(--ink)]">1. Email OTP & Password Auth (Primary):</span>
                    <p className="text-[11px] text-[var(--muted)] font-semibold mt-0.5">
                      Sends real 6-digit verification tokens / magic links to real email inboxes via Supabase Auth server.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-white border border-[#eadfce]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--ink)]">2. Mobile Phone OTP Auth:</span>
                      <span className="rounded-full bg-[var(--terracotta)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--terracotta)]">Beta Feature</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] font-semibold mt-0.5">
                      Test code <code className="font-mono font-bold text-[var(--terracotta)]">123456</code> allows instant evaluator mobile login without SMS gateway restrictions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Quick Test Shortcuts */}
              <div className="rounded-[12px] border border-[#eadfce] bg-white p-4 space-y-2">
                <h3 className="font-serif font-bold text-sm text-[var(--ink)]">
                  ⚡ 1-Click Interactive Demo Shortcuts
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                  <Link
                    href="/menu?table=2"
                    onClick={() => setShowGuideModal(false)}
                    className="flex items-center justify-between p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] font-bold text-[var(--ink)] hover:border-[var(--terracotta)] transition"
                  >
                    <span>🍽️ Test Table T02 QR Menu</span>
                    <span className="text-[var(--terracotta)]">→</span>
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    onClick={() => setShowGuideModal(false)}
                    className="flex items-center justify-between p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] font-bold text-[var(--ink)] hover:border-[var(--terracotta)] transition"
                  >
                    <span>🛎️ Kitchen Kanban + Chime</span>
                    <span className="text-[var(--terracotta)]">→</span>
                  </Link>
                  <Link
                    href="/billing/demo"
                    onClick={() => setShowGuideModal(false)}
                    className="flex items-center justify-between p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] font-bold text-[var(--ink)] hover:border-[var(--terracotta)] transition"
                  >
                    <span>💳 Test 5s Payment Gateway</span>
                    <span className="text-[var(--terracotta)]">→</span>
                  </Link>
                  <Link
                    href="/dashboard/tables"
                    onClick={() => setShowGuideModal(false)}
                    className="flex items-center justify-between p-3 rounded-[8px] bg-[#fcfaf6] border border-[#eadfce] font-bold text-[var(--ink)] hover:border-[var(--terracotta)] transition"
                  >
                    <span>🖨️ Table QR Standee Generator</span>
                    <span className="text-[var(--terracotta)]">→</span>
                  </Link>
                </div>
              </div>

              {/* Section 3: Beta Features Summary */}
              <div className="rounded-[12px] border border-[#eadfce] bg-[#fcfaf6] p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[var(--ink)]">⭐ Customer Review & AI Sentiment Analysis</span>
                  <span className="rounded-full bg-[var(--terracotta)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--terracotta)]">Beta Feature</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] font-semibold">
                  Unlocked on order tracking page (<code className="font-mono">/order/[id]</code>) once order status is updated to <span className="font-bold text-[var(--ink)]">Served</span> or <span className="font-bold text-[var(--ink)]">Billed</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 h-11 w-full rounded-full bg-[var(--terracotta)] font-bold text-white text-xs transition hover:scale-[1.01]"
            >
              Close & Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#fcfaf6] border-l border-[#eadfce] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              {/* Top Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#eadfce] pb-5">
                <Logo />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c9b5] bg-white text-[var(--ink)]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Zomato-Style Dining/Takeaway Options */}
              <div className="my-6 space-y-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] px-1">How would you like to order?</p>
                <Link
                  href="/reserve"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-between rounded-[10px] border border-[#eadfce] bg-white p-3.5 shadow-sm transition hover:border-[var(--terracotta)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                      <Calendar size={18} />
                    </span>
                    <div>
                      <p className="font-serif font-bold text-sm text-[var(--ink)]">Grab a Table</p>
                      <p className="text-[10px] text-[var(--muted)] font-semibold">Reserve Dine-In Spot</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--terracotta)]">Book →</span>
                </Link>

                <Link
                  href="/menu"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-between rounded-[10px] border border-[#eadfce] bg-white p-3.5 shadow-sm transition hover:border-[var(--terracotta)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf2e5] text-[var(--sage)]">
                      <ShoppingBag size={18} />
                    </span>
                    <div>
                      <p className="font-serif font-bold text-sm text-[var(--ink)]">Takeaway Order</p>
                      <p className="text-[10px] text-[var(--muted)] font-semibold">Instant Pickup Online</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--sage)]">Browse →</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 border-t border-[#eadfce] pt-4">
                <Link
                  href="/menu"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold text-[var(--ink)] hover:bg-white transition"
                >
                  <Utensils size={18} className="text-[var(--terracotta)]" /> Explore Menu
                </Link>
                <Link
                  href="/order"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold text-[var(--ink)] hover:bg-white transition"
                >
                  <Clock size={18} className="text-[var(--terracotta)]" /> Track Active Order
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-bold text-[var(--ink)] hover:bg-white transition"
                >
                  <LayoutDashboard size={18} className="text-[var(--terracotta)]" /> Staff & Owner Desk
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 border-t border-[#eadfce] pt-4">
              <Link
                href="/login"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d7c9b5] bg-white text-sm font-bold text-[var(--ink)] transition"
              >
                <User size={16} /> Login to Account
              </Link>
              <Link
                href="/menu"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] text-sm font-bold text-white shadow-sm transition"
              >
                Order Now
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
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
