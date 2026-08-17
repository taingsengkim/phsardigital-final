"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Seller } from "./seller-mock-types";

export function SellerProfileCard({ seller }: { seller: Seller }) {
  return (
    <Link href={`/stores/${seller.slug}`}>
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.18)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative flex h-40 flex-col justify-end overflow-hidden rounded-xl"
      >
        {/* Cover image */}
        <Image
          src={seller.avatar_url ?? "/picture/pic1.jpg"}
          alt={seller.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Avatar badge */}
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#6C4CD8] shadow">
          {seller.name.charAt(0)}
        </div>

        <div className="relative space-y-1 p-3 text-white">
          <p className="truncate text-sm font-semibold">{seller.name}</p>
          <div className="flex items-center gap-1 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.round(seller.rating) ? "fill-[#F5B301] text-[#F5B301]" : "text-white/40"}
              />
            ))}
          </div>
          <p className="text-xs text-white/85">
            {seller.review_count} Reviews &nbsp;•&nbsp; {seller.product_count} Products
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
