"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Star } from "lucide-react";
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  const footerCols = [
    {
      title: t("company"),
      links: [
        { label: t("about_us"), href: "/about" },
        { label: t("careers"), href: "/careers" },
        { label: t("press_media"), href: "/press" },
        { label: t("privacy_policy"), href: "/privacy" },
        { label: t("terms_conditions"), href: "/terms" },
      ],
    },
    {
      title: t("sell_with_us"),
      links: [
        { label: t("become_seller"), href: "/account/seller-application" },
        { label: t("seller_dashboard"), href: "/seller-dashboard/home" },
        { label: t("subscriptions"), href: "/subscriptions" },
        { label: t("merchant_support"), href: "/merchant-support" },
        { label: t("advertise_with_us"), href: "/advertising" },
      ],
    },
    {
      title: t("customer_care"),
      links: [
        { label: t("help_center"), href: "/help" },
        { label: t("contact_us"), href: "/contact-us" },
        { label: t("my_account"), href: "/account" },
        { label: t("orders"), href: "/orders" },
        { label: t("returns_refunds"), href: "/returns" },
      ],
    },
  ];

  const benefits = [
    { icon: ShieldCheck, title: t("secure_checkout"), text: t("protected_payments") },
    { icon: Headphones, title: t("dedicated_support"), text: t("help_when_needed") },
    { icon: Star, title: t("trusted_reviews"), text: t("shop_confidence") },
    { icon: RefreshCw, title: t("easy_returns"), text: t("simple_return_process") },
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
  }

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="border-b border-border bg-primary/[0.07] dark:bg-primary/10">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-y divide-border px-4 sm:px-6 md:grid-cols-4 md:divide-y-0">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-3 py-5 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
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
              <span className="text-xl font-extrabold tracking-tight">{t("brand_name")}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              {t("footer_tagline")}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="mailto:Phsar.Digital@com.kh" className="flex items-center gap-3 text-muted-foreground transition hover:text-primary">
                <Mail className="size-4 shrink-0 text-primary" />Phsar.Digital@com.kh
              </a>
              <a href="tel:+85512000000" className="flex items-center gap-3 text-muted-foreground transition hover:text-primary">
                <Phone className="size-4 shrink-0 text-primary" />+855 12 000 000
              </a>
              <p className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />Street 124, Toul Kork, Phnom Penh
              </p>
            </div>
          </div>

          {footerCols.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em]">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <section className="mt-10 flex flex-col gap-5 rounded-2xl bg-primary px-5 py-6 text-primary-foreground sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold">{t("deals_headline")}</h2>
            <p className="mt-1 text-sm text-primary-foreground/75">{t("deals_subline")}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("enter_email")}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 cursor-pointer">
              {t("subscribe")} <ArrowRight className="size-4" />
            </button>
          </form>
        </section>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {t("brand_name")}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-primary">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-primary">{t("terms")}</Link>
            <Link href="/aup" className="hover:text-primary">{t("acceptable_use")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
