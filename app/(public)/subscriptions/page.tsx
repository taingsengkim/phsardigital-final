import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Seller Subscriptions & Plans | Phsar Digital",
  description: "Explore subscription plans to post listings and grow your business on Phsar Digital.",
};

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FB] pb-20 font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] py-12 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur text-white">
            <Sparkles size={14} className="text-yellow-300" /> Seller Subscriptions
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Choose a Subscription Plan for Your Store
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-xl mx-auto">
            Posting listings and unlocking advanced analytics requires an active seller subscription. Choose the plan that fits your growth.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Plan 1 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#8D86A8] uppercase tracking-wider">Starter</span>
              <h3 className="mt-1 text-2xl font-bold text-[#1A1330]">$15 <span className="text-sm font-normal text-[#8D86A8]">/ month</span></h3>
              <p className="mt-2 text-xs text-[#6B6580]">Perfect for new individual sellers getting started.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-[#1A1330]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Up to 20 active product listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Standard store search placement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Basic store analytics
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-xl border border-[#6C4CD8] py-2.5 text-xs font-bold text-[#6C4CD8] hover:bg-[#EDE9FB] transition"
            >
              Select Starter
            </button>
          </div>

          {/* Plan 2: Popular */}
          <div className="relative rounded-2xl bg-white p-6 shadow-md ring-2 ring-[#6C4CD8] flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6C4CD8] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold text-[#6C4CD8] uppercase tracking-wider">Professional</span>
              <h3 className="mt-1 text-3xl font-extrabold text-[#1A1330]">$35 <span className="text-sm font-normal text-[#8D86A8]">/ month</span></h3>
              <p className="mt-2 text-xs text-[#6B6580]">Ideal for growing digital and retail stores.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-[#1A1330]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Up to 100 active product listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Priority category page placement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Full sales & order analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Featured store badge
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-[#6C4CD8] py-2.5 text-xs font-bold text-white shadow-md shadow-[#6C4CD8]/20 hover:bg-[#5C3DC8] transition"
            >
              Subscribe Now
            </button>
          </div>

          {/* Plan 3 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#8D86A8] uppercase tracking-wider">Enterprise</span>
              <h3 className="mt-1 text-2xl font-bold text-[#1A1330]">$80 <span className="text-sm font-normal text-[#8D86A8]">/ month</span></h3>
              <p className="mt-2 text-xs text-[#6B6580]">For large multi-category retailers.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-[#1A1330]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Unlimited product listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Top banner placement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Dedicated account manager
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-xl border border-[#E2DFEC] py-2.5 text-xs font-bold text-[#5A5470] hover:bg-[#F8F7FB] transition"
            >
              Contact Sales
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/seller-dashboard/home"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#6C4CD8] hover:underline"
          >
            Go to Seller Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
