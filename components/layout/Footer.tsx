"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, Phone, User, MapPin, RefreshCw, Headphones, Star } from "lucide-react";

/* ── Data Config ───────────────────────────────────────────────────────── */

const FOOTER_COLS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press & Media", href: "/press" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Acceptable Use Policy", href: "/aup" },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell product on Phsar Digital", href: "/sell" },
      { label: "Sell on Amazon Business", href: "/sell-amazon" },
      { label: "Merchant Portal", href: "/merchant-portal" },
      { label: "Merchant Support", href: "/merchant-support" },
      { label: "Partner With Us", href: "/partner" },
      { label: "Advertising", href: "/advertising" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Brand Directory", href: "/brands" },
      { label: "Customer Service", href: "/contact-us" },
      { label: "Your Account", href: "/account" },
      { label: "Your Order", href: "/orders" },
      { label: "Shipping Rates & Policies", href: "/shipping" },
      { label: "Returns & Replacements", href: "/returns" },
    ],
  },
];

const TRUST_BADGES = [
  {
    icon: RefreshCw,
    line1: "100% SECURE",
    line2: "CHECKOUT",
  },
  {
    icon: Headphones,
    line1: "24/7 DEDICATED",
    line2: "SUPPORT",
  },
  {
    icon: Star,
    line1: "THOUSANDS OF",
    line2: "GENUINE REVIEWS",
    fill: true,
  },
];

const CONTACTS = [
  { icon: Phone, text: "+012*********", href: "tel:+012000000" },
  { icon: Mail, text: "Phsar.Digital@com.kh", href: "mailto:Phsar.Digital@com.kh" },
  { icon: User, text: "Support ticket", href: "/support" },
  { icon: MapPin, text: "street 124, Toul Kork, Cambodia", href: "#" },
];

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <footer className="w-full bg-white text-gray-900 font-sans border-t border-gray-100">
      
      {/* ── Top Newsletter Banner ── */}
      <div className="bg-[#E8E5FA] px-6 py-9 sm:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Sign up for Phsar Digital News &amp; Offers
            </h2>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Be the first to know about exclusive deals, new arrivals, and marketplace insights!
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md items-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex flex-1 items-center gap-2.5 px-3">
              <Mail className="h-5 w-5 shrink-0 text-[#5B3DE8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Phsar.Digital@com.kh"
                aria-label="Email address"
                required
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-[#5B3DE8]/80 outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-md bg-[#5B3DE8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d32c9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B3DE8]"
            >
              <Send className="h-4 w-4" />
              Sign up
            </button>
          </form>
        </div>
      </div>

      {/* ── Main Links Section ── */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_1fr] items-start">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center justify-center text-center sm:col-span-2 lg:col-span-1 lg:items-start lg:text-left">
            <svg width={76} height={76} viewBox="0 0 100 100" fill="none" className="shrink-0">
              <circle cx="50" cy="50" r="34" fill="#5B3DE8" />
              <rect x="14" y="34" width="6" height="6" rx="1" fill="#5B3DE8" />
              <rect x="6" y="46" width="6" height="6" rx="1" fill="#5B3DE8" />
              <rect x="14" y="58" width="6" height="6" rx="1" fill="#5B3DE8" />
              <path d="M44 32h14a12 12 0 0 1 0 24H44V32z" fill="white" />
              <rect x="44" y="32" width="8" height="42" rx="3" fill="white" />
            </svg>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-950">
              Phsar Digital
            </h3>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition hover:text-[#5B3DE8] hover:underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Solid Center Divider ── */}
        <hr className="my-10 border-t-2 border-gray-900" />

        {/* ── Trust Badges ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left my-8">
          {TRUST_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center justify-center sm:justify-start gap-4">
                <Icon
                  className={`h-7 w-7 shrink-0 text-[#5B3DE8] ${badge.fill ? "fill-[#5B3DE8]" : ""}`}
                />
                <span className="text-xs font-black tracking-wide text-[#5B3DE8] leading-snug">
                  {badge.line1}
                  <br />
                  {badge.line2}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Sub-header with Dual Lines ── */}
        <div className="my-6 flex items-center gap-4">
          <span className="text-sm font-bold text-[#5B3DE8] whitespace-nowrap">
            Start A Conversation
          </span>
          <div className="h-[1px] flex-1 bg-gray-400" />
          <span className="text-sm font-bold text-[#5B3DE8] whitespace-nowrap">
            Address
          </span>
          <div className="h-[1px] flex-1 bg-gray-400" />
        </div>

        {/* ── Contacts Row ── */}
        <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 pt-2 text-sm font-medium text-gray-800">
          {CONTACTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-2 transition hover:text-[#5B3DE8]"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#5B3DE8]" />
                <span>{item.text}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Copyright Disclaimer ── */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Phsar Digital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}