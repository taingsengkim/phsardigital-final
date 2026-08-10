import Link from "next/link";
import { MapPin } from "lucide-react";

type Props = {
  /** Seller / store display name */
  name: string;
  /** Single letter used as avatar fallback */
  initial?: string;
  /** Number of products the seller has listed */
  productCount?: number;
  /** Average rating, e.g. 4.8 */
  avgRating?: number;
  /** How many years on the platform */
  yearsOnPlatform?: number;
  /** City name (English) */
  city?: string;
  /** City name (Khmer script) */
  cityKhmer?: string;
  /** Street address */
  address?: string;
  /** Link to the store page */
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
    <div className="mt-11 overflow-hidden rounded-[14px] border border-border bg-card grid grid-cols-1 sm:grid-cols-[1.1fr_1fr]">
      {/* ── left: seller info ── */}
      <div className="flex flex-col gap-3 p-7 sm:border-r sm:border-border">
        {/* avatar + name */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#e8a33d,#c9822a)",
            }}
            aria-hidden="true"
          >
            {avatarLetter}
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-[#2a1c63]">
              {name}
            </p>
            <p className="text-[13px] text-[#c9822a]">★★★★★ Positive review</p>
          </div>
        </div>

        {/* stats */}
        {(productCount !== undefined ||
          avgRating !== undefined ||
          yearsOnPlatform !== undefined) && (
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground my-1">
            {productCount !== undefined && (
              <div>
                <span className="block font-mono text-base font-bold text-foreground">
                  {productCount}
                </span>
                Products listed
              </div>
            )}
            {avgRating !== undefined && (
              <div>
                <span className="block font-mono text-base font-bold text-foreground">
                  {avgRating.toFixed(1)}
                </span>
                Avg. rating
              </div>
            )}
            {yearsOnPlatform !== undefined && (
              <div>
                <span className="block font-mono text-base font-bold text-foreground">
                  {yearsOnPlatform} yr{yearsOnPlatform !== 1 ? "s" : ""}
                </span>
                On Phsar Digital
              </div>
            )}
          </div>
        )}

        {/* visit store CTA */}
        <Link
          href={storeHref}
          className="self-start rounded-lg border border-[#3d2b87] px-5 py-2 text-sm font-semibold text-[#3d2b87] transition hover:bg-[#3d2b87] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d2b87]"
        >
          Visit store
        </Link>
      </div>

      {/* ── right: decorative map ── */}
      <div
        className="relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#cfe3d8 0%,#b9d6c9 45%,#a9c9bd 100%)",
        }}
        aria-hidden="true"
      >
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent 0 18px,rgba(255,255,255,.5) 18px 19px),repeating-linear-gradient(90deg,transparent 0 18px,rgba(255,255,255,.5) 18px 19px)",
          }}
        />

        {/* pin */}
        <div
          className="z-10 mb-3 h-9 w-9 rounded-[50%_50%_50%_0] bg-[#c1442c] shadow-[0_12px_28px_rgba(33,26,53,0.14)]"
          style={{ transform: "rotate(-45deg)" }}
        />

        {/* city label */}
        <div className="z-10 text-center">
          <p className="font-serif font-semibold text-[#2a1c63]">{city}</p>
          <p className="text-xs text-muted-foreground">{cityKhmer}</p>
        </div>

        {/* address chip */}
        {address && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-start gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-xs text-foreground shadow-sm">
            <MapPin size={12} className="mt-0.5 shrink-0 text-[#c1442c]" />
            <span>{address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
