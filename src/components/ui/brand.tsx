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
