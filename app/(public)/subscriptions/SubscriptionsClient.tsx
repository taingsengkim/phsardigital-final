"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Store,
  Loader2,
  Clock,
  Package,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  useGetSubscriptionPlansQuery,
  useGetSellerSubscriptionQuery,
  useSubscribeToPlanMutation,
  SubscriptionPlan,
  SubscriptionPlanType,
} from "@/lib/api/sellerApi";
import { AuthToast } from "@/components/auth/AuthToast";

type ToastState = { message: string; type: "success" | "error" };

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    plan: "BASIC",
    displayName: "Basic Plan",
    priceUsd: 15,
    durationDays: 30,
    listingLimit: 20,
  },
  {
    plan: "STANDARD",
    displayName: "Standard Plan",
    priceUsd: 35,
    durationDays: 30,
    listingLimit: 100,
  },
  {
    plan: "PREMIUM",
    displayName: "Premium Plan",
    priceUsd: 80,
    durationDays: 30,
    listingLimit: 1000,
  },
];

const PLAN_FEATURES: Record<SubscriptionPlanType, string[]> = {
  BASIC: [
    "Up to 20 active product listings",
    "Standard store search placement",
    "Basic store analytics",
    "Community seller support",
  ],
  STANDARD: [
    "Up to 100 active product listings",
    "Priority category page placement",
    "Full sales & order analytics",
    "Featured store badge",
    "Instant direct buyer messaging",
  ],
  PREMIUM: [
    "Unlimited / 1000+ product listings",
    "Top banner homepage placement",
    "Advanced custom analytics & reports",
    "Dedicated 24/7 account manager",
    "Zero extra listing commissions",
  ],
};

export default function SubscriptionsClient() {
  const {
    data: fetchedPlans,
    isLoading: isLoadingPlans,
    isError: isPlansError,
    refetch: refetchPlans,
  } = useGetSubscriptionPlansQuery();

  const {
    data: mySub,
    isLoading: isLoadingMySub,
    refetch: refetchMySub,
  } = useGetSellerSubscriptionQuery();

  const [subscribeToPlan, { isLoading: isSubscribing }] =
    useSubscribeToPlanMutation();

  const [selectedPlanType, setSelectedPlanType] =
    useState<SubscriptionPlanType | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const plansToDisplay =
    fetchedPlans && fetchedPlans.length > 0 ? fetchedPlans : FALLBACK_PLANS;

  const handleSubscribe = async (planType: SubscriptionPlanType) => {
    setSelectedPlanType(planType);
    try {
      const res = await subscribeToPlan({ plan: planType }).unwrap();
      setToast({
        type: "success",
        message: `Successfully subscribed to ${res.planDisplayName || planType} plan!`,
      });
      refetchMySub();
    } catch (err: any) {
      console.error("Subscription failed:", err);
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Subscription failed. Please sign in as a seller and try again.";
      setToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setSelectedPlanType(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FB] pb-20 font-sans">
      <AuthToast toast={toast} onClose={() => setToast(null)} />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] py-14 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur text-white border border-white/15">
            <Sparkles size={14} className="text-yellow-300" /> Official Seller Subscriptions
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl tracking-tight">
            Choose a Subscription Plan for Your Store
          </h1>
          <p className="mt-2.5 text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Posting product listings and accessing advanced seller analytics requires an active seller subscription. Select the plan tailored to your business scale.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Active Subscription Status Banner */}
        {isLoadingMySub ? (
          <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin text-[#6C4CD8]" />
            Checking active subscription...
          </div>
        ) : mySub && mySub.status === "ACTIVE" ? (
          <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 text-white p-6 shadow-lg border border-emerald-700/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                    <Zap className="size-3 text-emerald-400" /> Active Subscription
                  </span>
                  <span className="text-xs text-emerald-200/80">
                    Status: <strong className="text-white">{mySub.status}</strong>
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {mySub.planDisplayName || `${mySub.plan} Plan`}
                </h2>
                <p className="mt-1 text-xs text-emerald-100/80">
                  Seller ID: <code className="text-emerald-200 font-mono">{mySub.sellerId}</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/10 p-4 backdrop-blur border border-white/10 text-xs w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-emerald-200/80 flex items-center gap-1">
                    <Package className="size-3.5" /> Listings Limit
                  </span>
                  <strong className="text-sm font-semibold text-white mt-0.5">
                    {mySub.listingsUsed ?? 0} / {mySub.listingLimit ?? "Unlimited"}
                  </strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-emerald-200/80 flex items-center gap-1">
                    <Clock className="size-3.5" /> Expiration
                  </span>
                  <strong className="text-sm font-semibold text-white mt-0.5">
                    {mySub.expiresAt ? new Date(mySub.expiresAt).toLocaleDateString() : "N/A"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Loading state for plans */}
        {isLoadingPlans ? (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-[#6C4CD8]" />
            <p className="mt-3 text-xs text-[#6B6580] font-medium">
              Fetching available subscription plans...
            </p>
          </div>
        ) : isPlansError ? (
          <div className="mb-8 rounded-2xl bg-amber-50 p-6 border border-amber-200 text-center">
            <AlertCircle className="mx-auto size-7 text-amber-600 mb-2" />
            <p className="text-sm font-bold text-amber-900">
              Could not load live plans from backend
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Showing default standard plans below. You can try refreshing.
            </p>
            <button
              onClick={() => refetchPlans()}
              className="mt-3 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
            >
              Retry Fetching Plans
            </button>
          </div>
        ) : null}

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plansToDisplay.map((p) => {
            const isPopular = p.plan === "STANDARD";
            const isCurrentPlan = mySub?.plan === p.plan && mySub?.status === "ACTIVE";
            const isThisSubscribing = isSubscribing && selectedPlanType === p.plan;
            const features = PLAN_FEATURES[p.plan] || [
              `Up to ${p.listingLimit} product listings`,
              `${p.durationDays} days active duration`,
              "Full store access",
            ];

            return (
              <div
                key={p.plan}
                className={`relative rounded-2xl bg-white p-7 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  isPopular
                    ? "ring-2 ring-[#6C4CD8] shadow-md scale-102"
                    : "ring-1 ring-black/5"
                } ${isCurrentPlan ? "border-2 border-emerald-500 bg-emerald-50/20" : ""}`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#6C4CD8] px-3.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                {isCurrentPlan && (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Current Plan
                  </span>
                )}

                <div>
                  <span className="text-xs font-bold text-[#6C4CD8] uppercase tracking-wider">
                    {p.displayName || `${p.plan} PLAN`}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#1A1330]">
                      ${p.priceUsd}
                    </span>
                    <span className="text-xs font-medium text-[#8D86A8]">
                      / {p.durationDays} days
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#6B6580]">
                    Allows posting up to <strong>{p.listingLimit} active listings</strong>.
                  </p>

                  <div className="my-6 h-px bg-gray-100" />

                  <ul className="space-y-3.5 text-xs text-[#1A1330]">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrentPlan ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl bg-emerald-100 py-3 text-xs font-bold text-emerald-800 cursor-default flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Current Active Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(p.plan)}
                      disabled={isSubscribing}
                      className={`w-full rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-[#6C4CD8] text-white shadow-md shadow-[#6C4CD8]/25 hover:bg-[#5C3DC8]"
                          : "border border-[#6C4CD8] text-[#6C4CD8] hover:bg-[#EDE9FB]"
                      } ${isSubscribing ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      {isThisSubscribing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe to {p.displayName || p.plan}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 rounded-2xl bg-white p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EDE9FB] text-[#6C4CD8]">
              <Store size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1330]">
                Already Subscribed or Need Dashboard Access?
              </h3>
              <p className="text-xs text-[#6B6580] mt-0.5">
                Manage your active listings, view store performance, and track customer orders.
              </p>
            </div>
          </div>
          <Link
            href="/seller-dashboard/home"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#1A1330] px-5 py-3 text-xs font-bold text-white hover:bg-[#2A1D4E] transition shadow-sm"
          >
            Go to Seller Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
