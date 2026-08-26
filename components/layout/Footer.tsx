"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Star } from "lucide-react";
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo";

const FOOTER_COLS = [
  { title: "Company", links: [
    { label: "About us", href: "/about" }, { label: "Careers", href: "/careers" },
    { label: "Press & media", href: "/press" }, { label: "Privacy policy", href: "/privacy" },
    { label: "Terms & conditions", href: "/terms" },
  ] },
  { title: "Sell with us", links: [
    { label: "Become a seller", href: "/account/seller-application" },
    { label: "Seller dashboard", href: "/seller-dashboard/home" },
    { label: "Subscriptions", href: "/subscriptions" }, { label: "Merchant support", href: "/merchant-support" },
    { label: "Advertise with us", href: "/advertising" },
  ] },
  { title: "Customer care", links: [
    { label: "Help center", href: "/help" }, { label: "Contact us", href: "/contact-us" },
    { label: "My account", href: "/account" }, { label: "My orders", href: "/orders" },
    { label: "Returns & refunds", href: "/returns" },
  ] },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Secure checkout", text: "Protected payments" },
  { icon: Headphones, title: "Dedicated support", text: "Help when you need it" },
  { icon: Star, title: "Trusted reviews", text: "Shop with confidence" },
  { icon: RefreshCw, title: "Easy returns", text: "Simple return process" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
  }

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="border-b border-border bg-primary/[0.07] dark:bg-primary/10">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-y divide-border px-4 sm:px-6 md:grid-cols-4 md:divide-y-0">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-3 py-5 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <span className="min-w-0">
                <strong className="block text-xs font-bold sm:text-sm">{title}</strong>
                <span className="block truncate text-[11px] text-muted-foreground sm:text-xs">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.9fr_0.9fr] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/home" aria-label="Phsar Digital home" className="inline-flex items-center gap-3">
              <PhsarDigitalLogo className="size-10 shrink-0" aria-hidden="true" />
              <span className="text-xl font-extrabold tracking-tight">Phsar Digital</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Cambodia&apos;s digital marketplace for authentic products, trusted sellers, and a safer way to shop online.</p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="mailto:Phsar.Digital@com.kh" className="flex items-center gap-3 text-muted-foreground transition hover:text-primary"><Mail className="size-4 shrink-0 text-primary" />Phsar.Digital@com.kh</a>
              <a href="tel:+85512000000" className="flex items-center gap-3 text-muted-foreground transition hover:text-primary"><Phone className="size-4 shrink-0 text-primary" />+855 12 000 000</a>
              <p className="flex items-center gap-3 text-muted-foreground"><MapPin className="size-4 shrink-0 text-primary" />Street 124, Toul Kork, Phnom Penh</p>
            </div>
          </div>

          {FOOTER_COLS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em]">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground transition hover:text-primary">{link.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>

        <section className="mt-10 flex flex-col gap-5 rounded-2xl bg-primary px-5 py-6 text-primary-foreground sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold">Deals worth opening your inbox for</h2>
            <p className="mt-1 text-sm text-primary-foreground/75">New arrivals, seller stories, and marketplace offers—no spam.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">Subscribe <ArrowRight className="size-4" /></button>
          </form>
        </section>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Phsar Digital. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/aup" className="hover:text-primary">Acceptable use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
