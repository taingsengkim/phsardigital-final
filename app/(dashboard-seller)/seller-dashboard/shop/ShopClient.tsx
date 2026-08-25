"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldAlert,
  Star,
  Store,
} from "lucide-react";
import {
  useGetMyListingsQuery,
  useGetSellerProfileQuery,
} from "@/lib/api/sellerApi";
import { formatAddress } from "@/lib/maps";
import { cn } from "@/lib/utils";
import ShopDetailsSection from "./sections/ShopDetailsSection";
import ShopContactSection from "./sections/ShopContactSection";
import ShopLocationSection from "./sections/ShopLocationSection";

type Tab = "details" | "contact" | "location";

const TABS = [
  { id: "details", label: "Shop details", description: "Brand and description", icon: Store },
  { id: "contact", label: "Contact", description: "Phone and social links", icon: Phone },
  { id: "location", label: "Location", description: "Address and map pin", icon: MapPin },
] satisfies { id: Tab; label: string; description: string; icon: typeof Store }[];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual seller",
  SOLE_PROPRIETORSHIP: "Sole proprietorship",
  PARTNERSHIP: "Partnership",
  COMPANY: "Registered company",
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ShopClient() {
  const { data: profile, isLoading } = useGetSellerProfileQuery();
  const { data: listings } = useGetMyListingsQuery({ pageSize: 1 });

  const [tab, setTab] = useState<Tab>("details");
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#6C4CD8]" />
      </div>
    );
  }

  /* ── no seller profile: nothing to manage yet ── */
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#EDEBF3] bg-white p-10 text-center">
        <Store className="mx-auto size-10 text-[#6C4CD8]/50" />
        <h1 className="mt-4 text-xl font-bold text-[#1A1330]">No shop yet</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B6580]">
          You need an approved seller application before you can manage a shop.
        </p>
        <Link
          href="/account/seller-application"
          className="mt-5 inline-flex rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C3DC8]"
        >
          Apply to sell
        </Link>
      </div>
    );
  }

  const suspended = profile.isActive === false;
  const rating =
    typeof profile.averageRating === "number" && profile.averageRating > 0
      ? profile.averageRating
      : null;
  const reviewCount = profile.reviewCount ?? 0;
  const productCount =
    (listings as { page?: { totalElements?: number } } | undefined)?.page
      ?.totalElements ?? null;

  const typeLabel = profile.businessType
    ? (BUSINESS_TYPE_LABELS[profile.businessType.toUpperCase()] ??
      profile.businessType)
    : null;

  const address = formatAddress({
    address: profile.address,
    city: profile.city,
    province: profile.province,
  });

  async function copyId() {
    if (!profile?.id) return;
    try {
      await navigator.clipboard.writeText(profile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[#f7f8fb] px-4 py-6 dark:bg-background sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Storefront settings</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#1A1330] dark:text-foreground sm:text-3xl">Manage your shop</h1>
          <p className="mt-1.5 text-sm text-[#77728a] dark:text-muted-foreground">Keep your public shop information accurate and up to date.</p>
        </div>
      {/* ── overview header ── */}
      <header className="overflow-hidden rounded-[24px] border border-[#e8e5f0] bg-white shadow-[0_12px_35px_rgba(43,35,74,0.06)] dark:bg-card">
        <div className="h-2 bg-gradient-to-r from-[#6C4CD8] via-[#8c68f5] to-[#c4b3ff]" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          {profile.logoUri ? (
            <Image
              src={profile.logoUri}
              alt={`${profile.businessName} logo`}
              width={80}
              height={80}
              unoptimized
              className="size-24 shrink-0 rounded-[22px] border-4 border-white object-cover shadow-lg ring-1 ring-[#E2DFEC]"
            />
          ) : (
            <div
              className="flex size-24 shrink-0 items-center justify-center rounded-[22px] border-4 border-white text-4xl font-black text-white shadow-lg ring-1 ring-[#E2DFEC]"
              style={{ background: "linear-gradient(135deg,#8267E8,#6C4CD8)" }}
              aria-hidden="true"
            >
              {(profile.businessName || "S").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-[#1A1330] dark:text-foreground sm:text-[28px]">
                {profile.businessName || "Untitled shop"}
              </h2>
              {suspended ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-bold text-red-600">
                  <ShieldAlert size={13} />
                  Suspended
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-emerald-600">
                  <BadgeCheck size={13} />
                  Active
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#6B6580]">
              {typeLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#B5B0CA]" />
                  {typeLabel}
                </span>
              )}
              {address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#B5B0CA]" />
                  {address}
                </span>
              )}
            </div>

            {/* shop id — support asks for this */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[#8D86A8]">Shop ID</span>
              <code className="rounded bg-[#F4F2FA] px-2 py-0.5 font-mono text-xs text-[#5A5470]">
                {profile.id}
              </code>
              <button
                type="button"
                onClick={copyId}
                aria-label="Copy shop ID"
                className="rounded p-1 text-[#8D86A8] transition hover:text-[#6C4CD8]"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>

          <Link
            href={`/stores/${profile.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f2effc] px-4 py-3 text-sm font-bold text-[#6C4CD8] transition hover:bg-[#e9e3fb]"
          >
            <ExternalLink size={15} />
            View public page
          </Link>
        </div>

        {/* suspension detail */}
        {suspended && (
          <div className="flex items-start gap-2.5 border-t border-[#EDEBF3] bg-[#FEF2F2] px-6 py-4">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-sm leading-relaxed text-red-800">
              This shop is suspended and cannot take new orders
              {profile.suspensionReason ? `: ${profile.suspensionReason}` : "."}
              {formatDate(profile.suspendedAt) && (
                <span className="text-red-700">
                  {" "}
                  (since {formatDate(profile.suspendedAt)})
                </span>
              )}
            </p>
          </div>
        )}

        {/* stats */}
        <div className="grid grid-cols-1 divide-y divide-[#EDEBF3] border-t border-[#EDEBF3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat
            icon={Package}
            tone="bg-[#F1EFFA] text-[#6C4CD8]"
            value={productCount !== null ? String(productCount) : "—"}
            label={productCount === 1 ? "Product" : "Products"}
          />
          <Stat
            icon={Star}
            tone="bg-[#FFFBEB] text-[#F5B301]"
            value={rating ? rating.toFixed(1) : "New"}
            label={rating ? "Avg. rating" : "No ratings yet"}
          />
          <Stat
            icon={MessageCircle}
            tone="bg-[#F0FDF4] text-emerald-500"
            value={String(reviewCount)}
            label={reviewCount === 1 ? "Review" : "Reviews"}
          />
        </div>
      </header>

      {/* ── tabs ── */}
      <div
        className="mt-6 grid gap-2 rounded-[20px] border border-[#e8e5f0] bg-white p-2 shadow-sm dark:bg-card sm:grid-cols-3"
        role="tablist"
        aria-label="Shop settings"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200",
              tab === t.id
                ? "bg-[#6C4CD8] text-white shadow-md shadow-[#6C4CD8]/20"
                : "text-[#676178] hover:bg-[#f6f3fd] hover:text-[#6C4CD8]"
            )}
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tab === t.id ? "bg-white/15" : "bg-[#f1edfb] text-[#6C4CD8]")}>
              <Icon size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold">{t.label}</span>
              <span className={cn("mt-0.5 block text-xs font-normal", tab === t.id ? "text-white/75" : "text-[#9690a6]")}>{t.description}</span>
            </span>
          </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "details" && <ShopDetailsSection />}
        {tab === "contact" && <ShopContactSection />}
        {tab === "location" && <ShopLocationSection />}
      </div>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Package;
  tone: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", tone)}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-extrabold leading-none text-[#1A1330]">{value}</p>
        <p className="mt-0.5 text-xs text-[#8D86A8]">{label}</p>
      </div>
    </div>
  );
}
