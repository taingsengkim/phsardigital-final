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

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Shop details" },
  { id: "contact", label: "Contact" },
  { id: "location", label: "Location" },
];

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
    <div className="mx-auto w-full max-w-6xl">
      {/* ── overview header ── */}
      <header className="overflow-hidden rounded-2xl border border-[#EDEBF3] bg-white">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          {profile.logoUri ? (
            <Image
              src={profile.logoUri}
              alt={`${profile.businessName} logo`}
              width={80}
              height={80}
              unoptimized
              className="size-20 shrink-0 rounded-2xl border border-[#E2DFEC] object-cover"
            />
          ) : (
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white"
              style={{ background: "linear-gradient(135deg,#8267E8,#6C4CD8)" }}
              aria-hidden="true"
            >
              {(profile.businessName || "S").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#1A1330]">
                {profile.businessName || "Untitled shop"}
              </h1>
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
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#E2DFEC] px-4 py-2.5 text-sm font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
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
        <div className="grid grid-cols-3 divide-x divide-[#EDEBF3] border-t border-[#EDEBF3]">
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
        className="mt-6 flex gap-1 rounded-2xl bg-[#F0EDFB] p-1.5"
        role="tablist"
        aria-label="Shop settings"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl px-2 py-2.5 text-sm font-bold transition-all duration-200",
              tab === t.id
                ? "bg-white text-[#6C4CD8] shadow-sm"
                : "text-[#8B85A0] hover:text-[#6C4CD8]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "details" && <ShopDetailsSection />}
        {tab === "contact" && <ShopContactSection />}
        {tab === "location" && <ShopLocationSection />}
      </div>
    </div>
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
