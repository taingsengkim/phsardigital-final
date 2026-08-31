"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Store,
  Loader2,
  Clock,
  Package,
  AlertCircle,
  Zap,
  MessageSquare,
} from "lucide-react";
import {
  useGetSubscriptionPlansQuery,
  useGetSellerSubscriptionQuery,
  useSubscribeToPlanMutation,
  SubscriptionCheckout,
  SubscriptionPlan,
} from "@/lib/api/sellerApi";
import { AuthToast } from "@/components/auth/AuthToast";
import { KhqrPaymentDialog } from "@/components/subscriptions/KhqrPaymentDialog";

type ToastState = { message: string; type: "success" | "error" };

/**
 * Perks that cannot be read off the plan record. The listing cap and duration
 * are always rendered from the plan itself, so an admin changing a limit can
 * never leave a card advertising the old one.
 */
const PLAN_PERKS: Record<string, string[]> = {
  BASIC: [
    "Standard store search placement",
    "Basic store analytics",
    "Community seller support",
  ],
  STANDARD: [
    "Priority category page placement",
    "Full sales & order analytics",
    "Featured store badge",
    "Instant direct buyer messaging",
  ],
  PREMIUM: [
    "Top banner homepage placement",
    "Advanced custom analytics & reports",
    "Dedicated 24/7 account manager",
    "Zero extra listing commissions",
  ],
};

/** `listingLimit` is null for an unlimited plan, not 0 and not -1. */
function formatLimit(limit: number | null | undefined): string {
  return limit === null || limit === undefined ? "Unlimited" : String(limit);
}

function featuresFor(plan: SubscriptionPlan): string[] {
  return [
    plan.listingLimit === null
      ? "Unlimited active product listings"
      : `Up to ${plan.listingLimit} active product listings`,
    `${plan.durationDays} days of active access`,
    ...(PLAN_PERKS[plan.code] ?? ["Full store access"]),
  ];
}

function checkoutErrorMessage(err: unknown): string {
  const e = err as { status?: number | string; data?: { message?: string } };
  switch (e?.status) {
    case 401:
      return "Please sign in as a seller before subscribing.";
    case 403:
      return "This account cannot subscribe right now — the shop may be pending approval or suspended.";
    case 404:
      return "That plan no longer exists. Refresh the page to see the current plans.";
    case 409:
      return "That plan has been retired and can no longer be purchased. Please choose another plan.";
    case 503:
      return "Online payment is temporarily unavailable. This is on our side, not yours — please try again shortly.";
    default:
      return (
        e?.data?.message ||
        "Could not start the payment. Please check your connection and try again."
      );
  }
}

export default function SubscriptionsClient({
  subscriptionRequired = false,
}: {
  /** True when a 402 elsewhere in the app bounced the seller to this page. */
  subscriptionRequired?: boolean;
}) {
  const {
    data: plans,
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

  const [pendingPlanCode, setPendingPlanCode] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<SubscriptionCheckout | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const plansToDisplay = plans ?? [];

  /**
   * Opens a checkout. Nothing is granted here for a paid plan — the response
   * carries a QR and the dialog polls until Bakong confirms the transfer.
   * Pressing Subscribe twice is safe: the server hands back the same payment.
   */
  const startCheckout = async (planCode: string) => {
    setPendingPlanCode(planCode);
    try {
      const result = await subscribeToPlan({ planCode }).unwrap();

      // Branch on paymentRequired, never on the price: a free plan activates
      // immediately and comes back with no payment at all.
      if (!result.paymentRequired) {
        setCheckout(null);
        setToast({
          type: "success",
          message: `Your ${result.planDisplayName || result.planCode} plan is active.`,
        });
        refetchMySub();
        return;
      }

      setCheckout(result);
    } catch (err) {
      setToast({ type: "error", message: checkoutErrorMessage(err) });
    } finally {
      setPendingPlanCode(null);
    }
  };

  const statusLabel =
    mySub?.status === "EXPIRED"
      ? "Your subscription has expired"
      : mySub?.status === "CANCELLED"
        ? "Your subscription was cancelled"
        : null;

  return (
    <div className="min-h-screen bg-[#F8F7FB] pb-20 font-sans">
      <AuthToast toast={toast} onClose={() => setToast(null)} />

      {checkout?.payment && (
        <KhqrPaymentDialog
          // A fresh QR is a fresh countdown and a fresh poll.
          key={checkout.payment.uuid}
          checkout={checkout}
          onPaid={() => {
            refetchMySub();
          }}
          onRetry={() => {
            const planCode = checkout.planCode;
            setCheckout(null);
            startCheckout(planCode);
          }}
          onClose={() => setCheckout(null)}
        />
      )}

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
            Posting product listings and messaging customers requires an active seller subscription. Pay securely with Bakong KHQR from any Cambodian banking app.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {subscriptionRequired && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[#6C4CD8]/30 bg-[#EDE9FB] p-5">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-[#6C4CD8]" />
            <div>
              <p className="text-sm font-bold text-[#1A1330]">
                A subscription is needed for that action
              </p>
              <p className="mt-0.5 text-xs text-[#6B6580]">
                Publishing listings and messaging customers both need an active
                plan. Pick one below and you will be sent straight back to work.
              </p>
            </div>
          </div>
        )}

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
                  {mySub.planDisplayName || `${mySub.planCode} Plan`}
                </h2>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                      mySub.canPostListing
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-rose-500/20 text-rose-200"
                    }`}
                  >
                    <Package className="size-3" />
                    {mySub.canPostListing
                      ? "Publishing allowed"
                      : "Listing limit reached"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                      mySub.canChat
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-rose-500/20 text-rose-200"
                    }`}
                  >
                    <MessageSquare className="size-3" />
                    {mySub.canChat ? "Messaging allowed" : "Messaging locked"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/10 p-4 backdrop-blur border border-white/10 text-xs w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-emerald-200/80 flex items-center gap-1">
                    <Package className="size-3.5" /> Listings Used
                  </span>
                  <strong className="text-sm font-semibold text-white mt-0.5">
                    {mySub.listingsUsed ?? 0} / {formatLimit(mySub.listingLimit)}
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
        ) : statusLabel ? (
          <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-[#1A1330]">{statusLabel}</p>
              <p className="text-xs text-[#6B6580] mt-0.5">
                Your {mySub?.planDisplayName || mySub?.planCode} plan ended on{" "}
                {mySub?.expiresAt
                  ? new Date(mySub.expiresAt).toLocaleDateString()
                  : "an earlier date"}
                . Pick a plan below to start publishing again.
              </p>
            </div>
          </div>
        ) : null}

        {/* Plans */}
        {isLoadingPlans ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-16 text-sm text-gray-500 shadow-sm border border-gray-100">
            <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
            Loading subscription plans...
          </div>
        ) : isPlansError || plansToDisplay.length === 0 ? (
          /* No hard-coded fallback: showing invented prices or plan codes would
             let a seller start a checkout for a plan that does not exist. */
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm border border-gray-100">
            <AlertCircle className="mx-auto size-7 text-amber-600 mb-3" />
            <p className="text-sm font-bold text-[#1A1330]">
              {isPlansError
                ? "Could not load subscription plans"
                : "No plans are available right now"}
            </p>
            <p className="mt-1 text-xs text-[#6B6580]">
              {isPlansError
                ? "The pricing service could not be reached. No charge has been made."
                : "Our team is updating the catalogue. Please check back shortly."}
            </p>
            <button
              onClick={() => refetchPlans()}
              className="mt-4 rounded-lg bg-[#6C4CD8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5C3DC8]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plansToDisplay.map((p) => {
              const isPopular = p.code === "STANDARD";
              const isCurrentPlan =
                mySub?.planCode === p.code && mySub?.status === "ACTIVE";
              const isThisPending = pendingPlanCode === p.code;
              const isFree = p.priceUsd === 0;

              return (
                <div
                  key={p.code}
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
                      {p.displayName || p.code}
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#1A1330]">
                        {isFree ? "Free" : `$${p.priceUsd.toFixed(2)}`}
                      </span>
                      <span className="text-xs font-medium text-[#8D86A8]">
                        / {p.durationDays} days
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#6B6580]">
                      Allows posting up to{" "}
                      <strong>{formatLimit(p.listingLimit)} active listings</strong>.
                    </p>

                    <div className="my-6 h-px bg-gray-100" />

                    <ul className="space-y-3.5 text-xs text-[#1A1330]">
                      {featuresFor(p).map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
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
                        onClick={() => startCheckout(p.code)}
                        disabled={isSubscribing}
                        className={`w-full rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                          isPopular
                            ? "bg-[#6C4CD8] text-white shadow-md shadow-[#6C4CD8]/25 hover:bg-[#5C3DC8]"
                            : "border border-[#6C4CD8] text-[#6C4CD8] hover:bg-[#EDE9FB]"
                        } ${isSubscribing ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        {isThisPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            {isFree ? "Activating..." : "Preparing QR..."}
                          </>
                        ) : (
                          <>
                            {isFree ? "Activate" : "Pay with KHQR"} —{" "}
                            {p.displayName || p.code}
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
        )}

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
