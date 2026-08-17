"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Store } from "lucide-react";
import type { Seller } from "../types";

interface SellerCardProps {
  seller: Seller;
}

export function SellerCard({ seller }: SellerCardProps) {
  const { name, bannerImage, logoImage, rating, reviewCount, productCount } = seller;

  return (
    <Link
      href={`/store/${seller.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 w-full overflow-hidden bg-muted sm:h-28">
        <Image
          src={bannerImage}
          alt={`${name} banner`}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute -bottom-4 left-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-background shadow-sm sm:h-10 sm:w-10">
          {logoImage ? (
            <Image
              src={logoImage}
              alt={`${name} logo`}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <Store size={16} className="text-primary" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-3 pb-3 pt-5 sm:pt-6">
        <p className="truncate text-[13px] font-semibold text-foreground sm:text-sm">
          {name}
        </p>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.round(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              }
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{reviewCount} Reviews</span>
          <span aria-hidden>•</span>
          <span className="font-medium text-primary">
            {productCount} Products
          </span>
        </div>
      </div>
    </Link>
  );
}
