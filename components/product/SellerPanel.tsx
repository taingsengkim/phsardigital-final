import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Star,
  Store,
} from "lucide-react";
import type { ApiSellerProfile } from "@/lib/types";
import StoreMap from "@/components/product/StoreMap";

type Props = {
  seller: ApiSellerProfile | null;
  /** fallback name when the profile could not be loaded */
  fallbackName?: string;
  /** logo from the listing's embedded seller summary, used if the profile has none */
  fallbackLogoUri?: string | null;
  sellerId?: string | null;
  productCount?: number | null;
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual seller",
  SOLE_PROPRIETORSHIP: "Sole proprietorship",
  PARTNERSHIP: "Partnership",
  COMPANY: "Registered company",
};

function businessTypeLabel(type?: string | null): string | null {
  if (!type) return null;
  return BUSINESS_TYPE_LABELS[type.toUpperCase()] ?? type;
}

/** Cambodian phone numbers are stored unformatted — render them dial-ready. */
function telHref(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.length >= 6 ? `tel:${cleaned}` : null;
}

function socialLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".")[0];
  } catch {
    return "Link";
  }
}

export default function SellerPanel({
  seller,
  fallbackName = "Phsar Store",
  fallbackLogoUri,
  sellerId,
  productCount,
}: Props) {
  const name = seller?.businessName?.trim() || fallbackName;
  const logoUri = seller?.logoUri || fallbackLogoUri || null;
  const suspended = seller?.isActive === false;
  const avatarLetter = name.charAt(0).toUpperCase();
  const typeLabel = businessTypeLabel(seller?.businessType);

  const rating =
    typeof seller?.averageRating === "number" && seller.averageRating > 0
      ? seller.averageRating
      : null;
  const reviewCount = seller?.reviewCount ?? 0;

  const about = seller?.description?.trim() || seller?.biography?.trim() || null;
  const phoneHref = telHref(seller?.phoneNumber);
  const socials = (seller?.socialLink ?? []).filter(
    (link) => typeof link === "string" && link.startsWith("http")
  );

  const storeHref = sellerId ? `/stores/${sellerId}` : "/stores";

  const stats: { label: string; value: string; icon: typeof Package; tone: string }[] = [
    {
      label: "Products",
      value: productCount !== null && productCount !== undefined ? String(productCount) : "—",
      icon: Package,
      tone: "bg-[#F1EFFA] text-[#6C4CD8]",
    },
    {
      label: rating ? "Avg. rating" : "No ratings yet",
      value: rating ? rating.toFixed(1) : "New",
      icon: Star,
      tone: "bg-[#FFFBEB] text-[#F5B301]",
    },
    {
      label: reviewCount === 1 ? "Review" : "Reviews",
      value: String(reviewCount),
      icon: MessageCircle,
      tone: "bg-[#F0FDF4] text-emerald-500",
    },
  ];

  return (
    <section
      aria-labelledby="seller-heading"
      className="mt-12 overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white shadow-[0_2px_16px_rgba(108,76,216,0.08)]"
    >
      {/* ── header bar ── */}
      <div className="flex items-center justify-between gap-3 border-b border-[#F0EDFB] px-7 py-5">
        <div className="flex items-center gap-3">
          <Store size={18} className="text-[#6C4CD8]" />
          <h2 id="seller-heading" className="text-[18px] font-bold text-[#1A1330]">
            Sold by
          </h2>
        </div>
        {suspended ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-[13px] font-bold text-red-600">
            <ShieldAlert size={14} />
            Store suspended
          </span>
        ) : seller?.isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-[13px] font-bold text-emerald-600">
            <BadgeCheck size={14} />
            Active store
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
        {/* ── left: seller identity ── */}
        <div className="flex flex-col gap-6 p-7 lg:border-r lg:border-[#F0EDFB]">
          {/* logo + name */}
          <div className="flex items-center gap-4">
            {logoUri ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white">
                <Image
                  src={logoUri}
                  alt={`${name} logo`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[26px] font-black text-white shadow-md"
                style={{ background: "linear-gradient(135deg,#8267E8,#6C4CD8)" }}
                aria-hidden="true"
              >
                {avatarLetter}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-[20px] font-extrabold text-[#1A1330]">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {typeLabel && (
                  <span className="inline-flex items-center gap-1.5 text-[14px] text-[#8B85A0]">
                    <Building2 size={13} />
                    {typeLabel}
                  </span>
                )}
                {rating ? (
                  <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#F5B301]">
                    <Star size={13} fill="#F5B301" />
                    {rating.toFixed(1)}
                    <span className="font-medium text-[#8B85A0]">
                      ({reviewCount})
                    </span>
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F1EFFA] px-2.5 py-0.5 text-[13px] font-semibold text-[#6C4CD8]">
                    New on Phsar Digital
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* suspension notice */}
          {suspended && (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#FEF2F2] px-4 py-3">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-[13px] leading-relaxed text-red-800">
                This store is suspended and is not accepting new orders
                {seller?.suspensionReason ? `: ${seller.suspensionReason}` : "."}
              </p>
            </div>
          )}

          {/* about */}
          {about && (
            <p className="line-clamp-3 text-[15px] leading-relaxed text-[#5A5470]">
              {about}
            </p>
          )}

          {/* stats */}
          <div className="flex flex-wrap gap-6">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[18px] font-extrabold leading-none text-[#1A1330]">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#8B85A0]">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* buyer protection */}
          <div className="flex items-start gap-2.5 rounded-xl bg-[#F6F5FA] px-4 py-3">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6C4CD8]" />
            <p className="text-[13px] leading-relaxed text-[#5A5470]">
              Orders through Phsar Digital are covered by buyer protection. Keep
              payments and chat on the platform.
            </p>
          </div>

          {/* actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={storeHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-3 text-[15px] font-bold text-white shadow-md transition hover:bg-[#5B3DC0] hover:shadow-lg"
            >
              <Store size={16} />
              Visit store
            </Link>

            <Link
              href={
                sellerId
                  ? `/messages?seller=${encodeURIComponent(sellerId)}`
                  : "/messages"
              }
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
            >
              <MessageCircle size={16} />
              Chat
            </Link>

            {phoneHref && (
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
              >
                <Phone size={16} />
                {seller?.phoneNumber}
              </a>
            )}
          </div>

          {/* socials */}
          {socials.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#8B85A0]">Follow:</span>
              {socials.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#F1EFFA] px-3 py-1.5 text-[13px] font-bold capitalize text-[#6C4CD8] transition hover:bg-[#E4DEFA]"
                >
                  {socialLabel(link)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── right: real map ── */}
        <div className="flex flex-col gap-3 p-7">
          <p className="text-[15px] font-bold text-[#1A1330]">Store location</p>
          <StoreMap
            height={240}
            location={{
              latitude: seller?.latitude,
              longitude: seller?.longitude,
              address: seller?.address,
              city: seller?.city,
              province: seller?.province,
              googleMapUrl: seller?.googleMapUrl,
              businessName: seller?.businessName,
            }}
          />
        </div>
      </div>
    </section>
  );
}
