"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Headphones, Mail, MapPin, Phone, ShieldCheck, Store, Truck } from "lucide-react"
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo"

const linkGroups = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse products", href: "/products" },
      { label: "Shop by category", href: "/products" },
      { label: "Top stores", href: "/stores" },
      { label: "Saved products", href: "/saved" },
    ],
  },
  {
    title: "My account",
    links: [
      { label: "Account settings", href: "/account" },
      { label: "My orders", href: "/orders" },
      { label: "Shopping cart", href: "/cart" },
      { label: "Messages", href: "/messages" },
    ],
  },
  {
    title: "Sell with us",
    links: [
      { label: "Become a seller", href: "/account/seller-application" },
      { label: "Seller dashboard", href: "/seller-dashboard/home" },
      { label: "Subscription plans", href: "/subscriptions" },
      { label: "Add a product", href: "/seller-dashboard/products/new" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Phsar Digital", href: "/about" },
      { label: "Contact us", href: "/contact-us" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
]

const benefits = [
  { Icon: ShieldCheck, title: "Secure shopping", text: "Protected checkout" },
  { Icon: Truck, title: "Local delivery", text: "Across Cambodia" },
  { Icon: Headphones, title: "Helpful support", text: "Here when you need us" },
  { Icon: Store, title: "Trusted sellers", text: "Local shops and brands" },
]

export default function Footer() {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail("")
  }

  return (
    <footer className="mt-auto bg-[#171326] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="relative -top-8 overflow-hidden rounded-3xl bg-[#6C4CD8] px-6 py-7 shadow-[0_20px_50px_rgba(53,35,125,0.28)] sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-white/70">Stay close to the marketplace</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">New arrivals and local deals, in your inbox.</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">A useful update from Phsar Digital—no clutter, and you can unsubscribe anytime.</p>
          </div>
          <form onSubmit={subscribe} className="mt-5 flex w-full max-w-lg flex-col gap-2 sm:flex-row lg:mt-0">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Email address</span>
              <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6C4CD8]" />
              <input required type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubscribed(false) }} placeholder="Enter your email address" className="h-12 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-sm text-[#241F35] outline-none ring-white/30 placeholder:text-slate-400 focus:ring-4" />
            </label>
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#201938] px-5 text-sm font-semibold transition hover:bg-[#151026]">Subscribe <ArrowRight className="size-4" /></button>
          </form>
          {subscribed && <p role="status" className="mt-3 text-sm font-medium text-white lg:absolute lg:bottom-2 lg:right-8">Thanks for subscribing!</p>}
        </section>

        <div className="grid gap-10 pb-10 pt-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/home" className="inline-flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white"><PhsarDigitalLogo className="size-9" aria-hidden="true" /></span>
              <span><strong className="block text-lg">Phsar Digital</strong><span className="text-xs text-white/50">Cambodia&apos;s digital marketplace</span></span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">Discover products from Cambodian sellers and shop with confidence in one connected marketplace.</p>
            <address className="mt-5 space-y-3 not-italic text-sm text-white/65">
              <a href="mailto:support@phsardigital.com" className="flex items-center gap-3 hover:text-white"><Mail className="size-4 text-[#a998ff]" />support@phsardigital.com</a>
              <a href="tel:+85512000000" className="flex items-center gap-3 hover:text-white"><Phone className="size-4 text-[#a998ff]" />+855 12 000 000</a>
              <span className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#a998ff]" />Phnom Penh, Cambodia</span>
            </address>
          </div>

          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-sm font-bold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => <li key={link.label}><Link href={link.href} className="text-sm text-white/55 transition hover:text-white">{link.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>

        <div className="grid border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ Icon, title, text }, index) => (
            <div key={title} className={`flex items-center gap-3 py-3 ${index > 0 ? "lg:border-l lg:border-white/10 lg:pl-6" : ""}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#b8aaff]"><Icon className="size-5" /></span>
              <span><strong className="block text-sm">{title}</strong><span className="text-xs text-white/45">{text}</span></span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Phsar Digital. All rights reserved.</p>
          <p>Made for buyers and sellers across Cambodia.</p>
        </div>
      </div>
    </footer>
  )
}
