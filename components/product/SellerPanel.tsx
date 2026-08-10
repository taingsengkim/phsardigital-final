import Link from "next/link";
import { MapPin, Store, Star, Package, Clock } from "lucide-react";

type Props = {
  name: string;
  initial?: string;
  productCount?: number;
  avgRating?: number;
  yearsOnPlatform?: number;
  city?: string;
  cityKhmer?: string;
  address?: string;
  storeHref?: string;
};

export default function SellerPanel({
  name,
  initial,
  productCount,
  avgRating,
  yearsOnPlatform,
  city = "Phnom Penh",
  cityKhmer = "ភ្នំពេញ",
  address,
  storeHref = "#",
}: Props) {
  const avatarLetter = initial ?? name.charAt(0).toUpperCase();

  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white shadow-[0_2px_16px_rgba(108,76,216,0.08)]">

      {/* ── header bar ── */}
      <div className="flex items-center gap-3 border-b border-[#F0EDFB] px-7 py-5">
        <Store size={18} className="text-[#6C4CD8]" />
        <h2 className="text-[18px] font-bold text-[#1A1330]">Sold by</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr]">

        {/* ── left: seller info ── */}
        <div className="flex flex-col gap-5 p-7 sm:border-r sm:border-[#F0EDFB]">

          {/* avatar + name */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[26px] font-black text-white shadow-md"
              style={{ background: "linear-gradient(135deg,#8267E8,#6C4CD8)" }}
              aria-hidden="true"
            >
              {avatarLetter}
            </div>
            <div>
              <p className="text-[20px] font-extrabold text-[#1A1330]">{name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold text-[#F5B301]">
                <Star size={13} fill="#F5B301" />
                Positive Seller
              </p>
            </div>
          </div>

          {/* stats row */}
          {(productCount !== undefined || avgRating !== undefined || yearsOnPlatform !== undefined) && (
            <div className="flex flex-wrap gap-6">
              {productCount !== undefined && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EFFA]">
                    <Package size={16} className="text-[#6C4CD8]" />
                  </div>
                  <div>
                    <p className="text-[18px] font-extrabold text-[#1A1330] leading-none">{productCount}</p>
                    <p className="text-[13px] text-[#8B85A0]">Products</p>
                  </div>
                </div>
              )}
              {avgRating !== undefined && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB]">
                    <Star size={16} className="text-[#F5B301]" fill="#F5B301" />
                  </div>
                  <div>
                    <p className="text-[18px] font-extrabold text-[#1A1330] leading-none">{avgRating.toFixed(1)}</p>
                    <p className="text-[13px] text-[#8B85A0]">Avg. Rating</p>
                  </div>
                </div>
              )}
              {yearsOnPlatform !== undefined && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDF4]">
                    <Clock size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[18px] font-extrabold text-[#1A1330] leading-none">
                      {yearsOnPlatform} yr{yearsOnPlatform !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[13px] text-[#8B85A0]">On Platform</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <Link
            href={storeHref}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-3 text-[15px] font-bold text-white shadow-md transition hover:bg-[#5B3DC0] hover:shadow-lg"
          >
            <Store size={16} />
            Visit Store
          </Link>
        </div>

        {/* ── right: map card ── */}
        <div
          className="relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg,#cfe3d8 0%,#b9d6c9 45%,#a9c9bd 100%)" }}
          aria-hidden="true"
        >
          {/* grid lines */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent 0 18px,rgba(255,255,255,.6) 18px 19px),repeating-linear-gradient(90deg,transparent 0 18px,rgba(255,255,255,.6) 18px 19px)",
            }}
          />

          {/* pin */}
          <div
            className="z-10 mb-4 h-10 w-10 rounded-[50%_50%_50%_0] bg-[#6C4CD8] shadow-[0_8px_24px_rgba(108,76,216,0.4)]"
            style={{ transform: "rotate(-45deg)" }}
          />

          {/* city label */}
          <div className="z-10 text-center">
            <p className="text-[18px] font-extrabold text-[#1A1330]">{city}</p>
            <p className="text-[14px] text-[#5A5470]">{cityKhmer}</p>
          </div>

          {/* address chip */}
          {address && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-start gap-2 rounded-xl bg-white/90 px-4 py-3 text-[13px] text-[#3F3A52] shadow-sm backdrop-blur-sm">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#6C4CD8]" />
              <span>{address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
