"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, Phone, User, MapPinned } from "lucide-react";

/* ── data ──────────────────────────────────────────────────────────────── */

const FOOTER_COLS = [
  {
    title: "Company",
    links: [
      { label: "About Us",              href: "/about"   },
      { label: "Careers",               href: "/careers" },
      { label: "Press & Media",         href: "/press"   },
      { label: "Privacy Policy",        href: "/privacy" },
      { label: "Terms & Conditions",    href: "/terms"   },
      { label: "Acceptable Use Policy", href: "/aup"     },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell product on Phsar Digital", href: "/sell"            },
      { label: "Sell on Amazon Business",       href: "/sell-amazon"     },
      { label: "Merchant Portal",               href: "/merchant-portal" },
      { label: "Merchant Support",              href: "/merchant-support"},
      { label: "Partner With Us",               href: "/partner"         },
      { label: "Advertising",                   href: "/advertising"     },
      { label: "Help Center",                   href: "/help"            },
      { label: "Community",                     href: "/community"       },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Brand Directory",           href: "/brands"     },
      { label: "Customer Service",          href: "/contact-us" },
      { label: "Your Account",              href: "/account"    },
      { label: "Your Order",                href: "/orders"     },
      { label: "Shipping Rates & Policies", href: "/shipping"   },
      { label: "Returns & Replacements",    href: "/returns"    },
    ],
  },
];

const TRUST_BADGES = [
  {
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C4CD8" strokeWidth="2">
        <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z"/>
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "100% SECURE CHECKOUT",
  },
  {
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C4CD8" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
    label: "24/7 DEDICATED SUPPORT",
  },
  {
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#6C4CD8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    label: "THOUSANDS OF GENUINE REVIEWS",
  },
];

const CONTACTS = [
  { Icon: Phone,     text: "+012 ********"                  },
  { Icon: Mail,      text: "Phsar.Digital@com.kh"           },
  { Icon: User,      text: "Support ticket"                 },
  { Icon: MapPinned, text: "Street 124, Toul Kork, Cambodia"},
];

/* ── component ─────────────────────────────────────────────────────────── */

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-white text-[#241F35]">

      {/* ── newsletter strip ── */}
      <div className="bg-[#ECEAF7]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-7">
          <div>
            <p className="text-[18px] font-bold text-[#1A1330]">
              Sign up for Phsar Digital&apos;s News &amp; Offers
            </p>
            <p className="mt-0.5 text-[18px] text-[#5A5470]">
              Be the first to know about Exclusive deals, New arrivals,
              and Marketplace insights!
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center overflow-hidden rounded-lg border border-[#C8C3E0] bg-white"
          >
            <Mail size={16} className="ml-3 shrink-0 text-[#6C4CD8]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Phsar.Digital@com.kh"
              className="w-44 px-2.5 py-2.5 text-[18px] text-[#3F3A52] outline-none placeholder:text-[#6C4CD8] placeholder:underline sm:w-52"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-[#6C4CD8] px-4 py-2.5 text-[18px] font-semibold text-white transition-colors hover:bg-[#5C3DC8]"
            >
              <Send size={17} /> Sign up
            </button>
          </form>
        </div>
      </div>

      {/* ── main columns ── */}
      <div className="mx-auto max-w-5xl px-6 pt-9 pb-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">

          {/* logo + brand */}
          <div className="flex flex-col items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/picture/logo.png"
              alt="Phsar Digital"
              width={1220}
              height={1220}
              className="h-16 w-16 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
            {/* fallback circle */}
            <div
              className="hidden h-16 w-16 items-center justify-center rounded-full bg-[#6C4CD8]"
              aria-hidden="true"
            >
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-[18px] font-bold text-[#1A1330]">Phsar Digital</span>
          </div>

          {/* 3 link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-[18px] font-bold uppercase tracking-wide text-[#1A1330]">
                {col.title}
              </p>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[18px] text-[#5A5470] transition-colors hover:text-[#6C4CD8]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── trust badges ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-[#EDEBF3] pt-6">
          {TRUST_BADGES.map(({ svg, label }) => (
            <div key={label} className="flex items-center gap-2">
              {svg}
              <span className="text-[18px] font-bold uppercase tracking-wide text-[#3B2A85]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── contact strip ── */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#EDEBF3] pt-5">
          <Link
            href="/contact-us"
            className="text-[18px] font-bold text-[#6C4CD8] hover:underline"
          >
            Start A Conversation
          </Link>
          <div className="hidden flex-1 border-t border-[#DEDAEA] sm:block" />
          <span className="text-[18px] font-bold text-[#6C4CD8]">Address</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {CONTACTS.map(({ Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-[18px] text-[#241F35]">
              <Icon size={16} className="shrink-0 text-[#6C4CD8]" />
              {text}
            </span>
          ))}
        </div>

        {/* ── copyright ── */}
        <p className="mt-6 border-t border-[#EDEBF3] pt-4 text-center text-[18px] text-[#9CA3AF]">
          © {new Date().getFullYear()} Phsar Digital. All rights reserved.
        </p>
      </div>

    </footer>
  );
}
