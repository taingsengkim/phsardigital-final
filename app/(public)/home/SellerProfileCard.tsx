"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function SellerProfileCard({ seller }: { seller: any }) {
  const sellerName =
    seller.businessName || seller.storeDisplayName || seller.name || "Phsar Seller";

  const sellerSlug = seller.sellerId || seller.slug || seller.id || seller.uuid || "#";

  const logoImage =
    seller.logoUri || seller.logoUrl || seller.avatar_url || "/picture/pic1.jpg";

  const rating = seller.averageRating ?? seller.rating ?? 4.9;
  const reviewCount = seller.review_count ?? seller.reviewCount ?? 12;
  const productCount = seller.product_count ?? seller.productCount ?? 18;

  return (
    <Link href={`/stores/${sellerSlug}`}>
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.18)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative flex h-40 flex-col justify-end overflow-hidden rounded-xl font-sans"
      >
        {/* Cover image */}
        <Image
          src={logoImage}
          alt={sellerName}
          fill
          unoptimized={Boolean(logoImage?.startsWith("http"))}
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Avatar badge */}
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#6C4CD8] shadow">
          {sellerName.charAt(0).toUpperCase()}
        </div>

        <div className="relative space-y-1 p-3 text-white">
          <p className="truncate text-sm font-semibold">{sellerName}</p>
          <div className="flex items-center gap-1 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.round(rating)
                    ? "fill-[#F5B301] text-[#F5B301]"
                    : "text-white/40"
                }
              />
            ))}
          </div>
          <p className="text-xs text-white/85">
            {reviewCount} Reviews &nbsp;•&nbsp; {productCount} Products
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
